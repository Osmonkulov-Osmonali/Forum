"use client";

import dynamic from "next/dynamic";
import { StudentListPlaceholder } from "@/components/StudentListPlaceholder";

// ─── Globe loading skeleton ───────────────────────────────────────────────────

function GlobeSkeleton() {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#F8FAFC] to-[#EFF6FB]"
      aria-hidden
    >
      <div className="size-[240px] animate-pulse rounded-full bg-[#8ECAE6]/15 md:size-[380px]" />
    </div>
  );
}

// ─── Dynamic Globe import (ssr:false required — Three.js) ────────────────────

const GlobeEmbed = dynamic(
  () =>
    import("@/components/forum/InteractiveGlobe").then((m) => ({
      default: m.InteractiveGlobe,
    })),
  {
    ssr: false,
    loading: () => <GlobeSkeleton />,
  },
);

// ─── Main section ─────────────────────────────────────────────────────────────

/**
 * GlobeSplitSection
 *
 * Desktop (md+):  Two-column sticky split.
 *   Left  — light Three.js globe (transparent canvas), sticky so it stays in
 *            view while the right column scrolls.
 *   Right — white scrollable student list with continent filters.
 *
 * Mobile:  Vertical stack — globe (h-[50vh]) followed by the student list.
 */
export function GlobeSplitSection() {
  return (
    <section
      id="globe-students"
      aria-label="Интерактивный глобус и список студентов"
      className="bg-white"
    >
      {/* ── Desktop layout: sticky split ── */}
      <div className="hidden md:flex">
        {/* Left column — sticky globe (light premium backdrop) */}
        <div
          className="sticky top-0 h-[90vh] w-1/2 shrink-0 overflow-hidden bg-gradient-to-b from-[#F8FAFC] via-white to-[#EFF6FB]"
          aria-hidden="false"
        >
          {/*
            InteractiveGlobe renders a <section> with a fixed-height canvas
            (640px on desktop). We let it overflow naturally inside the dark
            container; the sticky wrapper clips anything that exceeds 90vh.
          */}
          <GlobeEmbed />
        </div>

        {/* Right column — scrollable student list */}
        <div className="min-h-[90vh] w-1/2 overflow-y-auto bg-white px-8 py-16 md:px-10 md:py-20">
          <StudentListPlaceholder />
        </div>
      </div>

      {/* ── Mobile layout: vertical stack ── */}
      <div className="flex flex-col md:hidden">
        {/* Globe — half the viewport height */}
        <div className="h-[50vh] overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-[#EFF6FB]">
          <GlobeEmbed />
        </div>

        {/* Student list — takes remaining space */}
        <div className="flex-1 bg-white px-4 py-10">
          <StudentListPlaceholder />
        </div>
      </div>
    </section>
  );
}
