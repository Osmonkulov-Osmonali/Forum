"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth scroll — only active on pointer (non-touch) devices that
 * don't prefer reduced motion.
 *
 * On mobile:
 *  - Native momentum scroll is smooth and battery-efficient.
 *  - Running Lenis' rAF loop on mobile wastes CPU and hurts Lighthouse TBT.
 *
 * With prefers-reduced-motion: reduce:
 *  - Any inertia-based scroll can cause nausea; disable entirely.
 */
export function SmoothScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // hover:none → primary input is touch → mobile / tablet
    const isTouch = window.matchMedia("(hover: none)").matches;

    if (prefersReduced || isTouch) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
