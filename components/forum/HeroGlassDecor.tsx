"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

type SphereConfig = {
  size: number;
  top: string;
  left: string;
  delay: number;
  duration: number;
  parallax: number;
  opacity?: number;
};

const SPHERES: SphereConfig[] = [
  { size: 260, top: "6%", left: "10%", delay: 0, duration: 4.2, parallax: 16 },
  { size: 170, top: "38%", left: "52%", delay: 0.6, duration: 3.8, parallax: 12 },
  { size: 210, top: "58%", left: "4%", delay: 1.1, duration: 4.6, parallax: 14 },
  { size: 110, top: "18%", left: "62%", delay: 0.3, duration: 3.5, parallax: 9 },
  { size: 85, top: "72%", left: "68%", delay: 1.5, duration: 4, parallax: 7, opacity: 0.75 },
];

function GlassSphere({
  config,
  springX,
  springY,
  reducedMotion,
}: {
  config: SphereConfig;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const { size, top, left, delay, duration, parallax, opacity = 1 } = config;

  const x = useTransform(springX, [-0.5, 0.5], [-parallax, parallax]);
  const y = useTransform(springY, [-0.5, 0.5], [-parallax * 0.55, parallax * 0.55]);

  return (
    <motion.div
      className="absolute will-change-transform"
      style={{ top, left, x, y, opacity }}
    >
      <motion.div
        className="relative rounded-full"
        style={{ width: size, height: size }}
        animate={reducedMotion ? undefined : { y: [0, -20, 0] }}
        transition={
          reducedMotion
            ? undefined
            : {
                repeat: Infinity,
                duration,
                delay,
                ease: "easeInOut",
              }
        }
      >
        {/* Outer glass shell */}
        <div
          className="
            absolute inset-0 rounded-full
            border border-white/50
            bg-gradient-to-br from-[#8ECAE6]/35 via-white/15 to-[#A2D2FF]/25
            shadow-[0_24px_64px_-28px_rgba(142,202,230,0.55),inset_0_1px_0_rgba(255,255,255,0.65)]
            backdrop-blur-2xl
          "
        />
        {/* Specular highlight */}
        <div
          aria-hidden
          className="
            absolute left-[18%] top-[14%] h-[32%] w-[38%]
            rounded-full bg-white/45 blur-md
          "
        />
        {/* Inner color depth */}
        <div
          aria-hidden
          className="
            absolute inset-[18%] rounded-full
            bg-gradient-to-tr from-[#8ECAE6]/20 to-transparent
            blur-sm
          "
        />
        {/* Soft rim glow */}
        <div
          aria-hidden
          className="
            absolute -inset-3 rounded-full
            bg-[#8ECAE6]/10 blur-2xl
          "
        />
      </motion.div>
    </motion.div>
  );
}

type Props = {
  className?: string;
};

export function HeroGlassDecor({ className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 45, damping: 18, mass: 0.4 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 18, mass: 0.4 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    function handleMouseMove(e: MouseEvent) {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set((e.clientX - centerX) / rect.width);
      mouseY.set((e.clientY - centerY) / rect.height);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, reducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={`pointer-events-none relative ${className}`}
    >
      {SPHERES.map((config, i) => (
        <GlassSphere
          key={i}
          config={config}
          springX={springX}
          springY={springY}
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
}
