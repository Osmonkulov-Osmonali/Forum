"use client";

import { MotionConfig } from "framer-motion";

/**
 * App-level motion configuration.
 * reducedMotion="user" automatically reads the OS preference
 * (prefers-reduced-motion: reduce) and disables ALL framer-motion
 * animations site-wide — zero per-component boilerplate needed.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
