"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Icosahedron vertex + face math ───────────────────────────────────────────

const PHI = (1 + Math.sqrt(5)) / 2;

/** Unit-sphere icosahedron vertices */
const RAW_VERTICES: [number, number, number][] = [
  [-1,  PHI, 0], [ 1,  PHI, 0], [-1, -PHI, 0], [ 1, -PHI, 0],
  [ 0, -1,  PHI], [ 0,  1,  PHI], [ 0, -1, -PHI], [ 0,  1, -PHI],
  [ PHI, 0, -1], [ PHI, 0,  1], [-PHI, 0, -1], [-PHI, 0,  1],
];

function normalize([x, y, z]: [number, number, number]): [number, number, number] {
  const len = Math.sqrt(x * x + y * y + z * z);
  return [x / len, y / len, z / len];
}

const VERTICES = RAW_VERTICES.map(normalize);

/** 20 triangular faces of the icosahedron */
const FACES: [number, number, number][] = [
  [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
  [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
  [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
  [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
];

/** Unique edges derived from faces */
function buildEdges(faces: [number, number, number][]): [number, number][] {
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  for (const [a, b, c] of faces) {
    for (const [u, v] of [[a,b],[b,c],[c,a]] as [number,number][]) {
      const key = `${Math.min(u,v)}-${Math.max(u,v)}`;
      if (!seen.has(key)) { seen.add(key); edges.push([u, v]); }
    }
  }
  return edges;
}

const EDGES = buildEdges(FACES);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rotateX(v: [number,number,number], a: number): [number,number,number] {
  const [x,y,z] = v;
  return [x, y*Math.cos(a) - z*Math.sin(a), y*Math.sin(a) + z*Math.cos(a)];
}
function rotateY(v: [number,number,number], a: number): [number,number,number] {
  const [x,y,z] = v;
  return [x*Math.cos(a) + z*Math.sin(a), y, -x*Math.sin(a) + z*Math.cos(a)];
}

/** Simple perspective projection */
function project(
  v: [number,number,number],
  cx: number, cy: number,
  scale: number,
  fov = 3.5
): [number, number, number] {
  const z = v[2] + fov;
  const f = fov / z;
  return [cx + v[0] * scale * f, cy + v[1] * scale * f, v[2]];
}

// ─── HeroCanvas ───────────────────────────────────────────────────────────────

type Props = {
  /** Tailwind className to control positioning & visibility */
  className?: string;
};

export function HeroCanvas({ className = "" }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const mouseRef   = useRef({ x: 0, y: 0 });
  const rafRef     = useRef<number>(0);
  /**
   * Stores the active DPR so draw() can convert physical→CSS pixels.
   * canvas.width / canvas.height are physical pixels; ctx.scale(dpr,dpr)
   * maps them so draw calls use CSS-pixel coordinates.
   * Without this, cx/cy on Retina displays (dpr>1) would be placed outside
   * the visible canvas area, showing only a corner of the icosahedron.
   */
  const dprRef = useRef(1);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Convert physical pixels → CSS pixels for all coordinate math.
    // ctx.scale(dpr, dpr) was applied in resize(), so draw calls must use
    // CSS-pixel units (0..cssWidth × 0..cssHeight), NOT physical pixels.
    const dpr       = dprRef.current;
    const cssWidth  = canvas.width  / dpr;
    const cssHeight = canvas.height / dpr;
    const isMobile  = cssWidth < 640;

    const t = performance.now() / 1000;

    // Auto-rotation + gentle mouse parallax (desktop only)
    const mx = isMobile ? 0 : (mouseRef.current.x - 0.5) * 0.6;
    const my = isMobile ? 0 : (mouseRef.current.y - 0.5) * 0.4;

    const angleY = t * 0.22 + mx;
    const angleX = t * 0.13 + my;

    // Transform all vertices
    const transformed = VERTICES.map((v) => {
      let p = rotateX(v, angleX);
      p = rotateY(p, angleY);
      return p;
    });

    // Canvas centre + scale — use CSS dimensions
    const cx    = cssWidth  / 2;
    const cy    = cssHeight / 2;
    const scale = Math.min(cssWidth, cssHeight) * (isMobile ? 0.38 : 0.42);

    // Project to 2D
    const projected = transformed.map((v) => project(v, cx, cy, scale));

    // Clear — use CSS dimensions so we don't exceed canvas bounds
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // ── Draw edges ──
    for (const [a, b] of EDGES) {
      const [ax, ay, az] = projected[a];
      const [bx, by, bz] = projected[b];

      // Depth-based opacity: back faces dimmer
      const depth = ((az + bz) / 2 + 1) / 2; // 0..1
      const alpha = isMobile
        ? 0.15 + depth * 0.25
        : 0.2  + depth * 0.45;

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = `rgba(142,202,230,${alpha.toFixed(2)})`;
      ctx.lineWidth = isMobile ? 0.8 : 1.1;
      ctx.stroke();
    }

    // ── Draw vertices ──
    for (const [px, py, pz] of projected) {
      const depth = (pz + 1) / 2;
      const r = isMobile ? 1.2 + depth * 1.2 : 1.5 + depth * 1.8;
      const alpha = isMobile ? 0.3 + depth * 0.4 : 0.4 + depth * 0.5;

      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(162,210,255,${alpha.toFixed(2)})`;
      ctx.fill();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect OS-level motion preference — skip the rAF loop entirely
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ── Pixel ratio (capped at 2 for performance) ──
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    }

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Mouse tracking (desktop only) ──
    function onMouseMove(e: MouseEvent) {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    }
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // ── Visibility: pause when tab is hidden ──
    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(draw);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ display: "block" }}
    />
  );
}
