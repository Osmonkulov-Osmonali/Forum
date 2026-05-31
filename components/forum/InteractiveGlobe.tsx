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

// Light premium palette
const C_LINE = "#3B6E8F"; // deep teal-blue — primary continent strokes
const C_LINE_SOFT = "#8ECAE6"; // pastel blue — grid / accents
const C_HALO = "#A2D2FF"; // pastel atmosphere glow

// Lightweight world coastline (Natural Earth 110m) — thin vector outlines.
// raw.githubusercontent serves with `access-control-allow-origin: *`.
const COASTLINE_URL =
  "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/physical/ne_110m_coastline.json";

// Pre-computed camera position facing Bishkek (lat=42.87, lon=74.59)
function latLonToCam(lat: number, lon: number, d: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
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
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

/** Spherical-linear interpolation between two points on a sphere of radius r. */
function slerpPoint(a: THREE.Vector3, b: THREE.Vector3, t: number, r: number): THREE.Vector3 {
  const an = a.clone().normalize();
  const bn = b.clone().normalize();
  const dot = Math.max(-1, Math.min(1, an.dot(bn)));
  const theta = Math.acos(dot);
  if (theta < 1e-4) return an.multiplyScalar(r);
  const sinT = Math.sin(theta);
  const w1 = Math.sin((1 - t) * theta) / sinT;
  const w2 = Math.sin(t * theta) / sinT;
  return an.multiplyScalar(w1).add(bn.multiplyScalar(w2)).multiplyScalar(r);
}

// ─── Continents (GeoJSON coastline → thin line outlines) ───────────────────────

type LonLat = [number, number];

function Continents() {
  const [positions, setPositions] = useState<Float32Array | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(COASTLINE_URL, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();

        const segs: number[] = [];
        const R = GLOBE_R + 0.004;
        const STEPS = 6; // sub-divide each segment to hug the sphere

        const addLine = (coords: LonLat[]) => {
          let prev: THREE.Vector3 | null = null;
          for (const [lon, lat] of coords) {
            const cur = latLonToVec3(lat, lon, R);
            if (prev) {
              let last = prev;
              for (let s = 1; s <= STEPS; s++) {
                const p = slerpPoint(prev, cur, s / STEPS, R);
                segs.push(last.x, last.y, last.z, p.x, p.y, p.z);
                last = p;
              }
            }
            prev = cur;
          }
        };

        type Geometry =
          | { type: "LineString"; coordinates: LonLat[] }
          | { type: "MultiLineString"; coordinates: LonLat[][] }
          | { type: "Polygon"; coordinates: LonLat[][] }
          | { type: "MultiPolygon"; coordinates: LonLat[][][] };

        for (const feature of data.features as { geometry: Geometry | null }[]) {
          const g = feature.geometry;
          if (!g) continue;
          if (g.type === "LineString") addLine(g.coordinates);
          else if (g.type === "MultiLineString") g.coordinates.forEach(addLine);
          else if (g.type === "Polygon") g.coordinates.forEach(addLine);
          else if (g.type === "MultiPolygon")
            g.coordinates.forEach((poly) => poly.forEach(addLine));
        }

        setPositions(new Float32Array(segs));
      } catch {
        // Network/parse failure — graceful fallback to the graticule grid only.
      }
    })();

    return () => controller.abort();
  }, []);

  const geometry = useMemo(() => {
    if (!positions) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useEffect(() => () => geometry?.dispose(), [geometry]);

  if (!geometry) return null;

  return (
    <lineSegments geometry={geometry} renderOrder={3}>
      <lineBasicMaterial color={C_LINE} transparent opacity={0.85} depthWrite={false} />
    </lineSegments>
  );
}

// ─── Globe sphere — matte, semi-transparent white (frosted glass look) ─────────

function GlobeMesh() {
  return (
    <mesh renderOrder={0}>
      <sphereGeometry args={[GLOBE_R, 64, 64]} />
      <meshStandardMaterial
        color="#FFFFFF"
        roughness={0.85}
        metalness={0}
        transparent
        opacity={0.42}
      />
    </mesh>
  );
}

// Subtle lat/lon graticule — thin pastel grid that reads as the globe surface.
function Graticule() {
  return (
    <mesh renderOrder={1}>
      <sphereGeometry args={[GLOBE_R + 0.001, 36, 24]} />
      <meshBasicMaterial
        color={C_LINE_SOFT}
        wireframe
        transparent
        opacity={0.12}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Atmosphere — soft pastel inner + outer glow (no additive, light-bg safe) ──

function Atmosphere() {
  return (
    <>
      {/* Outer halo — BackSide sphere renders a colored rim around the silhouette */}
      <mesh renderOrder={-1}>
        <sphereGeometry args={[GLOBE_R * 1.28, 48, 48]} />
        <meshBasicMaterial
          color={C_HALO}
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* Mid halo — tighter, slightly stronger */}
      <mesh renderOrder={-1}>
        <sphereGeometry args={[GLOBE_R * 1.1, 48, 48]} />
        <meshBasicMaterial
          color={C_LINE_SOFT}
          transparent
          opacity={0.14}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* Inner sheen — faint front tint hugging the surface */}
      <mesh renderOrder={2}>
        <sphereGeometry args={[GLOBE_R * 1.004, 48, 48]} />
        <meshBasicMaterial
          color={C_LINE_SOFT}
          transparent
          opacity={0.06}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

// ─── Orbital rings — thin, tilted, counter-rotating against the globe ──────────

const RING_DEFS = [
  { r: 1.42, tiltX: Math.PI / 2 + 0.42, tiltZ: 0.32, color: C_LINE_SOFT, opacity: 0.22 },
  { r: 1.68, tiltX: Math.PI / 2 + 0.18, tiltZ: -0.2, color: C_LINE, opacity: 0.18 },
  { r: 1.95, tiltX: Math.PI / 2 - 0.3, tiltZ: 0.5, color: C_LINE_SOFT, opacity: 0.12 },
];

function OrbitalRings({ isMobile }: { isMobile: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * 0.05; // opposite to the globe
  });

  return (
    <group ref={ref} rotation={[0.4, 0, 0.25]}>
      {RING_DEFS.map((ring) => (
        <mesh key={ring.r} rotation={[ring.tiltX, 0, ring.tiltZ]}>
          <torusGeometry args={[ring.r, isMobile ? 0.0035 : 0.0045, 8, 180]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={ring.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Hub markers ──────────────────────────────────────────────────────────────

interface HubDotProps {
  hub: Hub;
  isSource: boolean;
  isActive: boolean;
  onClick: (hub: Hub) => void;
  isMobile: boolean;
}

function HubDot({ hub, isSource, isActive, onClick, isMobile }: HubDotProps) {
  const pos = useMemo(() => latLonToVec3(hub.lat, hub.lon, GLOBE_R + 0.012), [hub]);
  const dotSize = isSource ? 0.026 : isMobile ? 0.013 : 0.017;

  const color = isSource ? "#0F172A" : isActive ? C_LINE : C_LINE_SOFT;

  return (
    <group position={pos}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (!isSource) onClick(hub);
        }}
        onPointerOver={() => {
          if (!isSource) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[dotSize, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Soft halo ring (source / active) */}
      {(isSource || isActive) && (
        <mesh>
          <sphereGeometry args={[dotSize * 2.4, 16, 16]} />
          <meshBasicMaterial
            color={isSource ? C_LINE : C_LINE_SOFT}
            transparent
            opacity={0.2}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

// ─── Animated arc ─────────────────────────────────────────────────────────────

interface ArcProps {
  sourceHub: Hub;
  targetHub: Hub;
  isMobile: boolean;
  onComplete: () => void;
}

function GlobeArc({ sourceHub, targetHub, isMobile, onComplete }: ArcProps) {
  const progressRef = useRef(0);
  const completedRef = useRef(false);
  const [pts, setPts] = useState<[number, number, number][]>(() => {
    const s = latLonToVec3(sourceHub.lat, sourceHub.lon, GLOBE_R + 0.012);
    return [
      [s.x, s.y, s.z],
      [s.x, s.y, s.z],
    ];
  });

  const { allPts } = useMemo(() => {
    const start = latLonToVec3(sourceHub.lat, sourceHub.lon, GLOBE_R + 0.012);
    const end = latLonToVec3(targetHub.lat, targetHub.lon, GLOBE_R + 0.012);
    const arcH = GLOBE_R + (isMobile ? 0.45 : 0.65);
    const mid = start.clone().add(end).normalize().multiplyScalar(arcH);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const all = curve.getPoints(100).map((p) => [p.x, p.y, p.z] as [number, number, number]);
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
      {/* Core line */}
      <Line points={pts} color={C_LINE} lineWidth={isMobile ? 1.5 : 2.5} transparent opacity={0.95} />
      {/* Wide glow halo */}
      <Line points={pts} color={C_LINE_SOFT} lineWidth={isMobile ? 4 : 8} transparent opacity={0.22} />
    </>
  );
}

// ─── 3-D popup card (desktop only) ───────────────────────────────────────────

function SpeakerCard3D({ hub, path }: { hub: Hub; path: SpeakerPath }) {
  const pos = useMemo(() => latLonToVec3(hub.lat, hub.lon, GLOBE_R + 0.18), [hub]);

  return (
    <Html position={[pos.x, pos.y, pos.z]} distanceFactor={3.5} center>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="
          pointer-events-none w-44 rounded-xl
          border border-[#8ECAE6]/60 bg-white/80 p-3
          shadow-xl shadow-[#3B6E8F]/15 backdrop-blur-md
        "
      >
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#8ECAE6]/50 bg-[#8ECAE6]/20 font-sans text-sm font-bold text-[#3B6E8F]">
            {path.speakerData.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-sans text-[11px] font-semibold leading-tight text-slate-900">
              {path.speakerData.name}
            </p>
            <p className="truncate font-sans text-[10px] leading-tight text-[#3B6E8F]">
              {path.speakerData.university}
            </p>
          </div>
        </div>
        <div className="mt-2 border-t border-[#8ECAE6]/30 pt-1.5">
          <p className="font-sans text-[9px] uppercase tracking-widest text-slate-400">
            {hub.name} · {path.category}
          </p>
        </div>
      </motion.div>
    </Html>
  );
}

// ─── Auto-rotate group ────────────────────────────────────────────────────────

function RotatingGlobe({
  children,
  paused,
  isMobile,
}: {
  children: React.ReactNode;
  paused: boolean;
  isMobile: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current || paused) return;
    groupRef.current.rotation.y += delta * (isMobile ? 0.1 : 0.05);
  });

  return <group ref={groupRef}>{children}</group>;
}

// ─── Full scene (inside Canvas) ───────────────────────────────────────────────

interface SceneProps {
  activeHub: Hub | null;
  activePath: SpeakerPath | null;
  arcDone: boolean;
  isMobile: boolean;
  onHubClick: (hub: Hub) => void;
  onArcComplete: () => void;
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
      {/* Lighting — bright, soft, light-mode */}
      <ambientLight intensity={1.05} />
      <directionalLight position={[3, 4, 5]} intensity={0.7} color="#ffffff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.25} color={C_HALO} />

      <Atmosphere />
      <OrbitalRings isMobile={isMobile} />

      <RotatingGlobe paused={!!activeHub} isMobile={isMobile}>
        <GlobeMesh />
        <Graticule />
        <Continents />

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

      {/*
        Controls (desktop only).
        SCROLL-FIX: enableZoom={false} → OrbitControls no longer hijacks the
        mouse wheel, so wheeling over the globe scrolls the PAGE. The globe
        reacts only to click-drag (rotate). Combined with `touch-action: pan-y`
        on the canvas, vertical touch scroll also passes straight through.
      */}
      {!isMobile && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate
          autoRotate={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.6}
          makeDefault
        />
      )}
    </>
  );
}

// ─── Category filter pills ────────────────────────────────────────────────────

const CATEGORY_HUB_MAP: Record<PathCategory, string> = {
  Азия: "tokyo",
  "Северная Америка": "newyork",
  Европа: "london",
  "Ближний Восток": "dubai",
};

// ─── Main exported component ──────────────────────────────────────────────────

export function InteractiveGlobe() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeHub, setActiveHub] = useState<Hub | null>(null);
  const [activePath, setActivePath] = useState<SpeakerPath | null>(null);
  const [arcDone, setArcDone] = useState(false);
  const [showSheet, setShowSheet] = useState(false);

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

  const handleCategoryClick = useCallback(
    (cat: PathCategory) => {
      const hubId = CATEGORY_HUB_MAP[cat];
      const hub = HUBS.find((h) => h.id === hubId);
      if (hub) activateHub(hub);
    },
    [activateHub],
  );

  const nonSource = HUBS.filter((h) => h.id !== "bishkek");

  return (
    <section
      id="globe"
      className="relative overflow-hidden bg-transparent"
      aria-label="Интерактивная карта спикеров"
    >
      {/* ── 3-D Canvas ── */}
      <div className="relative h-[440px] md:h-[640px]">
        <Canvas
          camera={{ position: INITIAL_CAM, fov: 42, near: 0.1, far: 100 }}
          gl={{ antialias: !isMobile, alpha: true }}
          dpr={[1, isMobile ? 1.2 : 2]}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          // Transparent background + let vertical scroll/touch pass through.
          style={{ background: "transparent", touchAction: "pan-y" }}
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
            className="block font-sans text-xs font-medium uppercase tracking-[0.22em] text-[#3B6E8F]"
          >
            Карта выпускников
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-1 font-sans text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl md:text-3xl"
          >
            Пути в мир
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-1 font-sans text-xs text-slate-500 sm:text-sm"
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
                  "h-9 w-[9rem] rounded-lg border px-3 text-left font-sans text-xs font-medium backdrop-blur-md transition-all duration-200",
                  isActive
                    ? "border-[#3B6E8F] bg-[#8ECAE6]/30 text-slate-900 shadow-md shadow-[#3B6E8F]/15"
                    : "border-white/60 bg-white/40 text-slate-600 hover:border-[#8ECAE6] hover:bg-white/60 hover:text-slate-900",
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
              className="mt-1 h-8 w-[9rem] rounded-lg border border-white/60 bg-white/30 px-3 text-left font-sans text-xs text-slate-400 backdrop-blur-md transition-colors hover:text-slate-700"
            >
              ✕ Сбросить
            </button>
          )}
        </div>
      </div>

      {/* ── Category pills — shown on all screens below canvas ── */}
      <div className="flex flex-wrap justify-center gap-2 border-t border-slate-200/70 bg-white/60 px-4 py-3 backdrop-blur-md md:py-4">
        {CATEGORIES.map((cat) => {
          const hubId = CATEGORY_HUB_MAP[cat];
          const isActive = activeHub?.id === hubId;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={cn(
                "h-9 min-h-[2.25rem] rounded-full px-4 font-sans text-xs font-medium transition-all duration-200",
                isActive
                  ? "bg-[#3B6E8F] text-white shadow-md shadow-[#3B6E8F]/25"
                  : "border border-slate-200 bg-white/70 text-slate-600 hover:border-[#8ECAE6] hover:bg-[#8ECAE6]/10 hover:text-slate-900",
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
                    ? "bg-[#3B6E8F] text-white"
                    : "border border-slate-200 bg-white/70 text-slate-500",
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
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 z-10 bg-slate-900/20 backdrop-blur-sm"
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="absolute inset-x-0 bottom-0 z-20 rounded-t-2xl bg-white px-5 pb-10 pt-4 shadow-2xl"
              style={{ borderTop: "1px solid rgba(142,202,230,0.6)" }}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-[#8ECAE6]/50 bg-[#8ECAE6]/20 font-sans text-xl font-bold text-[#3B6E8F]">
                  {activePath.speakerData.name.charAt(0)}
                </div>

                <div className="min-w-0">
                  <p className="font-sans text-base font-semibold text-slate-900">
                    {activePath.speakerData.name}
                  </p>
                  <p className="mt-0.5 font-sans text-sm text-[#3B6E8F]">
                    {activePath.speakerData.university}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-[#8ECAE6]/25 px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide text-[#3B6E8F]">
                      {activePath.category}
                    </span>
                    <span className="font-sans text-xs text-slate-400">
                      Бишкек → {activeHub.name}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                aria-label="Закрыть"
                className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-700"
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
