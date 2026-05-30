"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Html,
  Line,
  OrbitControls,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import {
  HUBS,
  SPEAKER_PATHS,
  CATEGORIES,
  type Hub,
  type PathCategory,
  type SpeakerPath,
} from "@/lib/data/globeData";

// ─── Constants ────────────────────────────────────────────────────────────────

const GLOBE_R = 1;

// Pre-computed camera position facing Bishkek (lat=42.87, lon=74.59)
// phi = (90-42.87)*PI/180 = 0.8225, theta = (74.59+180)*PI/180 = 4.4449
function latLonToCam(lat: number, lon: number, d: number): [number, number, number] {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -d * Math.sin(phi) * Math.cos(theta),
     d * Math.cos(phi),
     d * Math.sin(phi) * Math.sin(theta),
  ];
}
const INITIAL_CAM = latLonToCam(42.87, 74.59, 2.6);

// ─── Utility ──────────────────────────────────────────────────────────────────

function latLonToVec3(lat: number, lon: number, r = GLOBE_R): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

// ─── Globe sphere ─────────────────────────────────────────────────────────────

function GlobeMesh() {
  return (
    <mesh renderOrder={0}>
      <sphereGeometry args={[GLOBE_R, 64, 64]} />
      <meshStandardMaterial
        color="#030d1c"
        emissive="#071020"
        emissiveIntensity={0.6}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

// Latitude / longitude grid overlay — gives the neon grid look
function GlobeGrid() {
  return (
    <mesh renderOrder={1}>
      <sphereGeometry args={[GLOBE_R + 0.002, 40, 40]} />
      <meshBasicMaterial
        color="#ff6b00"
        wireframe
        transparent
        opacity={0.05}
        depthWrite={false}
      />
    </mesh>
  );
}

// Second, denser grid in complementary blue
function GlobeGridBlue() {
  return (
    <mesh renderOrder={1}>
      <sphereGeometry args={[GLOBE_R + 0.003, 24, 24]} />
      <meshBasicMaterial
        color="#1a4dff"
        wireframe
        transparent
        opacity={0.03}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Hub markers ──────────────────────────────────────────────────────────────

interface HubDotProps {
  hub:        Hub;
  isSource:   boolean;
  isActive:   boolean;
  onClick:    (hub: Hub) => void;
  isMobile:   boolean;
}

function HubDot({ hub, isSource, isActive, onClick, isMobile }: HubDotProps) {
  const pos     = useMemo(() => latLonToVec3(hub.lat, hub.lon, GLOBE_R + 0.015), [hub]);
  const dotSize = isSource ? 0.028 : isMobile ? 0.014 : 0.018;

  const color   = isSource  ? "#ff4500"
                : isActive  ? "#ffaa00"
                : "#ff6b00";
  const emissive = isSource  ? "#ff4500"
                 : isActive  ? "#ff9900"
                 : "#ff4000";
  const emissiveIntensity = isSource || isActive ? 3 : 1.5;

  return (
    <group position={pos}>
      {/* Core dot */}
      <mesh
        onClick={(e) => { e.stopPropagation(); if (!isSource) onClick(hub); }}
        onPointerOver={() => { if (!isSource) document.body.style.cursor = "pointer"; }}
        onPointerOut={()  => { document.body.style.cursor = "auto"; }}
      >
        <sphereGeometry args={[dotSize, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Outer glow ring (active only) */}
      {(isSource || isActive) && (
        <mesh>
          <sphereGeometry args={[dotSize * 2.2, 12, 12]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.12}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

// ─── Animated arc ─────────────────────────────────────────────────────────────

interface ArcProps {
  sourceHub:  Hub;
  targetHub:  Hub;
  isMobile:   boolean;
  onComplete: () => void;
}

function GlobeArc({ sourceHub, targetHub, isMobile, onComplete }: ArcProps) {
  const progressRef  = useRef(0);
  const completedRef = useRef(false);
  const [pts, setPts] = useState<[number, number, number][]>(() => {
    const s = latLonToVec3(sourceHub.lat, sourceHub.lon, GLOBE_R + 0.015);
    return [[s.x, s.y, s.z], [s.x, s.y, s.z]];
  });

  const { allPts } = useMemo(() => {
    const start = latLonToVec3(sourceHub.lat, sourceHub.lon, GLOBE_R + 0.015);
    const end   = latLonToVec3(targetHub.lat, targetHub.lon, GLOBE_R + 0.015);
    const arcH  = GLOBE_R + (isMobile ? 0.45 : 0.65);
    const mid   = start.clone().add(end).normalize().multiplyScalar(arcH);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const all   = curve.getPoints(100).map((p) => [p.x, p.y, p.z] as [number, number, number]);
    return { allPts: all };
  }, [sourceHub, targetHub, isMobile]);

  useFrame((_, delta) => {
    if (completedRef.current) return;
    progressRef.current = Math.min(1, progressRef.current + delta * 0.65);
    const n = Math.max(2, Math.floor(allPts.length * progressRef.current));
    setPts(allPts.slice(0, n));
    if (progressRef.current >= 1 && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  });

  return (
    <>
      {/* Bright core line */}
      <Line
        points={pts}
        color="#ffaa00"
        lineWidth={isMobile ? 1.5 : 2.5}
        transparent
        opacity={0.95}
      />
      {/* Wide glow halo */}
      <Line
        points={pts}
        color="#ff6b00"
        lineWidth={isMobile ? 4 : 8}
        transparent
        opacity={0.18}
      />
      {/* Medium mid-glow */}
      <Line
        points={pts}
        color="#ff8800"
        lineWidth={isMobile ? 2.5 : 4.5}
        transparent
        opacity={0.35}
      />
    </>
  );
}

// ─── 3-D popup card (desktop only) ───────────────────────────────────────────

function SpeakerCard3D({ hub, path }: { hub: Hub; path: SpeakerPath }) {
  const pos = useMemo(
    () => latLonToVec3(hub.lat, hub.lon, GLOBE_R + 0.18),
    [hub],
  );

  return (
    <Html position={[pos.x, pos.y, pos.z]} distanceFactor={3.5} center>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 6 }}
        animate={{ opacity: 1, scale: 1,   y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="
          pointer-events-none w-44
          border border-[#ff6b00]/40 bg-[#050d1a]/90 p-3
          shadow-2xl shadow-orange-950/60 backdrop-blur-sm
        "
      >
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#ff6b00]/30 bg-[#ff6b00]/15 font-sans text-sm font-bold text-[#ff8800]">
            {path.speakerData.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-sans text-[11px] font-semibold leading-tight text-white">
              {path.speakerData.name}
            </p>
            <p className="truncate font-sans text-[10px] leading-tight text-[#ff8800]/80">
              {path.speakerData.university}
            </p>
          </div>
        </div>
        <div className="mt-2 border-t border-[#ff6b00]/20 pt-1.5">
          <p className="font-sans text-[9px] uppercase tracking-widest text-white/40">
            {hub.name} · {path.category}
          </p>
        </div>
      </motion.div>
    </Html>
  );
}

// ─── Atmosphere glow ring ─────────────────────────────────────────────────────

function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_R * 1.06, 32, 32]} />
      <meshBasicMaterial
        color="#ff4400"
        transparent
        opacity={0.04}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Auto-rotate group ────────────────────────────────────────────────────────

function RotatingGlobe({
  children,
  paused,
  isMobile,
}: {
  children: React.ReactNode;
  paused:   boolean;
  isMobile: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current || paused) return;
    groupRef.current.rotation.y += delta * (isMobile ? 0.12 : 0.06);
  });

  return <group ref={groupRef}>{children}</group>;
}

// ─── Full scene (inside Canvas) ───────────────────────────────────────────────

interface SceneProps {
  activeHub:      Hub | null;
  activePath:     SpeakerPath | null;
  arcDone:        boolean;
  isMobile:       boolean;
  onHubClick:     (hub: Hub) => void;
  onArcComplete:  () => void;
}

function GlobeScene({
  activeHub,
  activePath,
  arcDone,
  isMobile,
  onHubClick,
  onArcComplete,
}: SceneProps) {
  const bishkek = HUBS.find((h) => h.id === "bishkek")!;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[4,  3,  4]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-3, -2, -3]} intensity={0.25} color="#3366ff" />
      <pointLight position={[0,  2, -4]} intensity={0.15} color="#ff4400" />

      <RotatingGlobe paused={!!activeHub} isMobile={isMobile}>
        <GlobeMesh />
        <GlobeGrid />
        <GlobeGridBlue />
        <Atmosphere />

        {/* Hub dots */}
        {HUBS.map((hub) => (
          <HubDot
            key={hub.id}
            hub={hub}
            isSource={hub.id === "bishkek"}
            isActive={hub.id === activeHub?.id}
            onClick={onHubClick}
            isMobile={isMobile}
          />
        ))}

        {/* Active arc */}
        {activePath && activeHub && (
          <GlobeArc
            key={activePath.id}
            sourceHub={bishkek}
            targetHub={activeHub}
            isMobile={isMobile}
            onComplete={onArcComplete}
          />
        )}

        {/* 3-D popup — desktop only, after arc finishes */}
        {activePath && activeHub && arcDone && !isMobile && (
          <SpeakerCard3D hub={activeHub} path={activePath} />
        )}
      </RotatingGlobe>

      {/* Controls */}
      {!isMobile && (
        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.07}
          minDistance={1.7}
          maxDistance={4.0}
          autoRotate={!activeHub}
          autoRotateSpeed={0.4}
          makeDefault
        />
      )}

      {/* Bloom post-processing */}
      <EffectComposer>
        <Bloom
          intensity={isMobile ? 0.6 : 1.1}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

// ─── Category filter pills ────────────────────────────────────────────────────

const CATEGORY_HUB_MAP: Record<PathCategory, string> = {
  "Азия":             "tokyo",
  "Северная Америка": "newyork",
  "Европа":           "london",
  "Ближний Восток":   "dubai",
};

// ─── Main exported component ──────────────────────────────────────────────────

export function InteractiveGlobe() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeHub,  setActiveHub]  = useState<Hub | null>(null);
  const [activePath, setActivePath] = useState<SpeakerPath | null>(null);
  const [arcDone,    setArcDone]    = useState(false);
  const [showSheet,  setShowSheet]  = useState(false);

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const activateHub = useCallback((hub: Hub) => {
    const path = SPEAKER_PATHS.find((p) => p.targetHubId === hub.id) ?? null;
    setActiveHub(hub);
    setActivePath(path);
    setArcDone(false);
    setShowSheet(false);
  }, []);

  const handleArcComplete = useCallback(() => {
    setArcDone(true);
    if (isMobile) setShowSheet(true);
  }, [isMobile]);

  const handleClose = useCallback(() => {
    setActiveHub(null);
    setActivePath(null);
    setArcDone(false);
    setShowSheet(false);
  }, []);

  const handleCategoryClick = useCallback((cat: PathCategory) => {
    const hubId = CATEGORY_HUB_MAP[cat];
    const hub   = HUBS.find((h) => h.id === hubId);
    if (hub) activateHub(hub);
  }, [activateHub]);

  const nonSource = HUBS.filter((h) => h.id !== "bishkek");

  return (
    <section
      id="globe"
      className="relative overflow-hidden bg-[#020810]"
      aria-label="Интерактивная карта спикеров"
    >
      {/* ── 3-D Canvas ── */}
      <div className="relative h-[440px] md:h-[640px]">
        <Canvas
          camera={{ position: INITIAL_CAM, fov: 42, near: 0.1, far: 100 }}
          gl={{ antialias: !isMobile, alpha: false }}
          dpr={[1, isMobile ? 1.2 : 2]}
          className="touch-auto"
        >
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <GlobeScene
            activeHub={activeHub}
            activePath={activePath}
            arcDone={arcDone}
            isMobile={isMobile}
            onHubClick={activateHub}
            onArcComplete={handleArcComplete}
          />
        </Canvas>

        {/* ── Section header (top-left overlay) ── */}
        <div className="pointer-events-none absolute left-4 top-6 sm:left-8 md:top-8">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="block font-sans text-xs font-medium uppercase tracking-[0.22em] text-[#ff6b00]"
          >
            Карта выпускников
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-1 font-sans text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl"
          >
            Пути в мир
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-1 font-sans text-xs text-white/40 sm:text-sm"
          >
            Выбери регион — увидишь путь
          </motion.p>
        </div>

        {/* ── Desktop: hub buttons on the right ── */}
        <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-1.5 md:flex">
          {nonSource.map((hub) => {
            const isActive = activeHub?.id === hub.id;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => activateHub(hub)}
                className={cn(
                  "h-9 w-[9rem] border px-3 text-left font-sans text-xs font-medium transition-all duration-200",
                  isActive
                    ? "border-[#ff6b00] bg-[#ff6b00]/20 text-white shadow-lg shadow-orange-500/20"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-[#ff6b00]/50 hover:bg-[#ff6b00]/10 hover:text-white",
                )}
              >
                {hub.name}
              </button>
            );
          })}
          {activeHub && (
            <button
              type="button"
              onClick={handleClose}
              className="mt-1 h-8 w-[9rem] border border-white/10 bg-transparent px-3 text-left font-sans text-xs text-white/30 transition-colors hover:text-white/60"
            >
              ✕ Сбросить
            </button>
          )}
        </div>
      </div>

      {/* ── Category pills — shown on all screens below canvas ── */}
      <div className="flex flex-wrap justify-center gap-2 border-t border-white/5 bg-[#020810]/80 px-4 py-3 md:py-4">
        {CATEGORIES.map((cat) => {
          const hubId  = CATEGORY_HUB_MAP[cat];
          const isActive = activeHub?.id === hubId;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={cn(
                "h-9 min-h-[2.25rem] px-4 font-sans text-xs font-medium transition-all duration-200",
                isActive
                  ? "bg-[#ff6b00] text-white shadow-md shadow-orange-500/30"
                  : "border border-white/10 bg-white/5 text-white/60 hover:border-[#ff6b00]/40 hover:bg-[#ff6b00]/10 hover:text-white",
              )}
            >
              {cat}
            </button>
          );
        })}
        {/* Mobile hub buttons in pill row */}
        <div className="flex w-full gap-2 overflow-x-auto pb-1 scrollbar-hide md:hidden">
          {nonSource.map((hub) => {
            const isActive = activeHub?.id === hub.id;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => activateHub(hub)}
                className={cn(
                  "h-8 shrink-0 rounded-full px-3 font-sans text-[11px] font-medium transition-all",
                  isActive
                    ? "bg-[#ff6b00] text-white"
                    : "border border-white/10 bg-white/5 text-white/50",
                )}
              >
                {hub.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Mobile: bottom sheet popup ── */}
      <AnimatePresence>
        {isMobile && showSheet && activePath && activeHub && (
          <>
            {/* Scrim */}
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 z-10 bg-black/40"
            />
            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="absolute inset-x-0 bottom-0 z-20 bg-[#0a1428] px-5 pb-10 pt-4"
              style={{ borderTop: "1px solid rgba(255,107,0,0.3)" }}
            >
              {/* Drag handle */}
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-[#ff6b00]/30 bg-[#ff6b00]/15 font-sans text-xl font-bold text-[#ff8800]">
                  {activePath.speakerData.name.charAt(0)}
                </div>

                <div className="min-w-0">
                  <p className="font-sans text-base font-semibold text-white">
                    {activePath.speakerData.name}
                  </p>
                  <p className="mt-0.5 font-sans text-sm text-[#ff8800]">
                    {activePath.speakerData.university}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="bg-[#ff6b00]/20 px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide text-[#ff8800]">
                      {activePath.category}
                    </span>
                    <span className="font-sans text-xs text-white/40">
                      Бишкек → {activeHub.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={handleClose}
                aria-label="Закрыть"
                className="absolute right-4 top-4 p-1 text-white/30 hover:text-white"
              >
                ✕
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
