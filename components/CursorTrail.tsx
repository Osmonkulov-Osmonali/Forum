"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const HALF = 128; // w-64 / 2 — center blob on cursor

export function CursorTrail() {
  const cursorX = useMotionValue(-HALF);
  const cursorY = useMotionValue(-HALF);
  const springX = useSpring(cursorX, { stiffness: 50, damping: 22, mass: 0.35 });
  const springY = useSpring(cursorY, { stiffness: 50, damping: 22, mass: 0.35 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const md = window.matchMedia("(min-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setEnabled(md.matches && !reduced.matches);
    update();

    md.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      md.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    function onMove(e: MouseEvent) {
      cursorX.set(e.clientX - HALF);
      cursorY.set(e.clientY - HALF);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [cursorX, cursorY, enabled]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 hidden h-64 w-64 rounded-full bg-[#8ECAE6]/10 blur-[100px] md:block"
      style={{ x: springX, y: springY }}
    />
  );
}
