"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, Line, OrbitControls } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, MapPin, Route } from "lucide-react";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import {
  BISHKEK,
  distanceFromBishkek,
  studentLatLon,
  type AppStudent,
} from "@/components/forum/appStudents";

// ─── Palette (light premium) ────────────────────────────────────────────────────

const GLOBE_R = 1;
const C_LINE = "#3B6E8F";
const C_LINE_SOFT = "#8ECAE6";
const C_HALO = "#A2D2FF";

const COASTLINE_URL =
  "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/physical/ne_110m_coastline.json";

// Camera sits slightly above the equator.
const CAM: [number, number, number] = [0, 0.35, 2.85];

// ─── Geo helpers ────────────────────────────────────────────────────────────────

function latLonToVec3(lat: number, lon: number, r = GLOBE_R): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

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

// ─── Continents (lightweight GeoJSON coastline → thin line outlines) ─────────────

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
        const STEPS = 6;

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
        // graceful fallback — graticule stays visible
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

// ─── Sphere + graticule ──────────────────────────────────────────────────────────

function GlobeMesh() {
  return (
    <mesh renderOrder={0}>
      <sphereGeometry args={[GLOBE_R, 64, 64]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.85} metalness={0} transparent opacity={0.42} />
    </mesh>
  );
}

function Graticule() {
  return (
    <mesh renderOrder={1}>
      <sphereGeometry args={[GLOBE_R + 0.001, 36, 24]} />
      <meshBasicMaterial color={C_LINE_SOFT} wireframe transparent opacity={0.12} depthWrite={false} />
    </mesh>
  );
}

// ─── Atmosphere glow ──────────────────────────────────────────────────────────────

function Atmosphere() {
  return (
    <>
      <mesh renderOrder={-1}>
        <sphereGeometry args={[GLOBE_R * 1.28, 48, 48]} />
        <meshBasicMaterial color={C_HALO} transparent opacity={0.16} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh renderOrder={-1}>
        <sphereGeometry args={[GLOBE_R * 1.1, 48, 48]} />
        <meshBasicMaterial color={C_LINE_SOFT} transparent opacity={0.14} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh renderOrder={2}>
        <sphereGeometry args={[GLOBE_R * 1.004, 48, 48]} />
        <meshBasicMaterial color={C_LINE_SOFT} transparent opacity={0.06} side={THREE.FrontSide} depthWrite={false} />
      </mesh>
    </>
  );
}

// ─── Orbital rings (counter-rotating) ─────────────────────────────────────────────

const RING_DEFS = [
  { r: 1.42, tiltX: Math.PI / 2 + 0.42, tiltZ: 0.32, color: C_LINE_SOFT, opacity: 0.22 },
  { r: 1.68, tiltX: Math.PI / 2 + 0.18, tiltZ: -0.2, color: C_LINE, opacity: 0.18 },
  { r: 1.95, tiltX: Math.PI / 2 - 0.3, tiltZ: 0.5, color: C_LINE_SOFT, opacity: 0.12 },
];

function OrbitalRings() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * 0.05;
  });
  return (
    <group ref={ref} rotation={[0.4, 0, 0.25]}>
      {RING_DEFS.map((ring) => (
        <mesh key={ring.r} rotation={[ring.tiltX, 0, ring.tiltZ]}>
          <torusGeometry args={[ring.r, 0.0045, 8, 180]} />
          <meshBasicMaterial color={ring.color} transparent opacity={ring.opacity} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Active student badge (fixed 2D overlay — avoids Html scaling glitches) ─────

function ActiveStudentGlobeBadge({ student }: { student: AppStudent }) {
  const km = distanceFromBishkek(student);

  return (
    <motion.div
      key={student.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="
        pointer-events-none absolute bottom-6 left-4 right-4 z-10
        mx-auto max-w-[280px] rounded-2xl border border-white/50
        bg-white/80 p-3 shadow-[0_12px_32px_-12px_rgba(59,110,143,0.35)]
        backdrop-blur-lg sm:left-6 sm:max-w-[300px]
      "
    >
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={student.avatarUrl}
          alt=""
          className="size-10 shrink-0 rounded-full border-2 border-[#8ECAE6]/60 bg-slate-100 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-sm font-semibold text-slate-900">
            {student.name}
          </p>
          <p className="mt-0.5 flex items-center gap-1 truncate font-sans text-xs text-[#3B6E8F]">
            <GraduationCap className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{student.university}</span>
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-200/60 pt-2.5">
        <span className="flex items-center gap-1 font-sans text-[11px] text-slate-500">
          <Route className="size-3 shrink-0 text-[#8ECAE6]" aria-hidden />
          Бишкек → {student.city}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-[#8ECAE6]/15 px-2 py-0.5 font-sans text-[10px] font-medium tabular-nums text-[#3B6E8F]">
          <MapPin className="size-2.5 shrink-0" aria-hidden />
          {km.toLocaleString("ru-RU")} км
        </span>
      </div>
    </motion.div>
  );
}

// ─── Markers ──────────────────────────────────────────────────────────────────────

type MarkerKind = "source" | "active" | "default";

function Marker({
  lat,
  lon,
  kind,
  onClick,
}: {
  lat: number;
  lon: number;
  kind: MarkerKind;
  onClick?: () => void;
}) {
  const pos = useMemo(() => latLonToVec3(lat, lon, GLOBE_R + 0.012), [lat, lon]);
  const size = kind === "source" ? 0.026 : kind === "active" ? 0.022 : 0.015;
  const color = kind === "source" ? "#0F172A" : kind === "active" ? C_LINE : C_LINE_SOFT;

  return (
    <group position={pos}>
      <mesh
        onClick={
          onClick
            ? (e) => {
                e.stopPropagation();
                onClick();
              }
            : undefined
        }
        onPointerOver={
          onClick
            ? () => {
                document.body.style.cursor = "pointer";
              }
            : undefined
        }
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {kind !== "default" && (
        <mesh>
          <sphereGeometry args={[size * 2.4, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// ─── Animated bezier arc (Bishkek → student) ──────────────────────────────────────

function GlobeArc({
  source,
  target,
}: {
  source: { lat: number; lon: number };
  target: { lat: number; lon: number };
}) {
  const progressRef = useRef(0);
  const [pts, setPts] = useState<[number, number, number][]>(() => {
    const s = latLonToVec3(source.lat, source.lon, GLOBE_R + 0.012);
    return [
      [s.x, s.y, s.z],
      [s.x, s.y, s.z],
    ];
  });

  const allPts = useMemo(() => {
    const start = latLonToVec3(source.lat, source.lon, GLOBE_R + 0.012);
    const end = latLonToVec3(target.lat, target.lon, GLOBE_R + 0.012);
    const mid = start.clone().add(end).normalize().multiplyScalar(GLOBE_R + 0.55);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(100).map((p) => [p.x, p.y, p.z] as [number, number, number]);
  }, [source, target]);

  useFrame((_, delta) => {
    if (progressRef.current >= 1) return;
    progressRef.current = Math.min(1, progressRef.current + delta * 0.8);
    const n = Math.max(2, Math.floor(allPts.length * progressRef.current));
    setPts(allPts.slice(0, n));
  });

  return (
    <>
      <Line points={pts} color={C_LINE} lineWidth={2.5} transparent opacity={0.95} />
      <Line points={pts} color={C_LINE_SOFT} lineWidth={7} transparent opacity={0.22} />
    </>
  );
}

// ─── Rotating globe group — lerps toward the active coordinates ───────────────────

function GlobeGroup({
  students,
  activeId,
  onSelect,
}: {
  students: AppStudent[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const active = useMemo(
    () => students.find((s) => s.id === activeId) ?? null,
    [students, activeId],
  );

  return (
    <group>
      <GlobeMesh />
      <Graticule />
      <Continents />

      {/* Source hub */}
      <Marker lat={BISHKEK.lat} lon={BISHKEK.lon} kind="source" />

      {/* Student markers */}
      {students.map((s) => {
        const { lat, lon } = studentLatLon(s);
        const isActive = s.id === activeId;
        return (
          <Marker
            key={s.id}
            lat={lat}
            lon={lon}
            kind={isActive ? "active" : "default"}
            onClick={() => onSelect(s.id)}
          />
        );
      })}

      {/* Active arc */}
      {active && (
        <GlobeArc
          key={active.id}
          source={BISHKEK}
          target={studentLatLon(active)}
        />
      )}
    </group>
  );
}

// ─── Exported canvas wrapper ──────────────────────────────────────────────────────

interface StudentGlobeProps {
  students: AppStudent[];
  activeId: string | null;
  showDesktopTooltip?: boolean;
  onSelect: (id: string) => void;
  className?: string;
}

export function StudentGlobe({
  students,
  activeId,
  showDesktopTooltip = true,
  onSelect,
  className,
}: StudentGlobeProps) {
  const active = useMemo(
    () => students.find((s) => s.id === activeId) ?? null,
    [students, activeId],
  );

  return (
    <div className={cn("relative h-full w-full bg-transparent", className)}>
      <Canvas
        className="h-full w-full bg-transparent shadow-none"
        camera={{ position: CAM, fov: 40, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        style={{ background: "transparent", touchAction: "none" }}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        <ambientLight intensity={1.05} />
        <directionalLight position={[3, 4, 5]} intensity={0.7} color="#ffffff" />
        <directionalLight position={[-4, -2, -3]} intensity={0.25} color={C_HALO} />

        <Atmosphere />
        <OrbitalRings />
        <GlobeGroup
          students={students}
          activeId={activeId}
          onSelect={onSelect}
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate
          autoRotate={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.65}
          makeDefault
        />
      </Canvas>

      <AnimatePresence mode="wait">
        {active && showDesktopTooltip && (
          <ActiveStudentGlobeBadge key={active.id} student={active} />
        )}
      </AnimatePresence>
    </div>
  );
}
