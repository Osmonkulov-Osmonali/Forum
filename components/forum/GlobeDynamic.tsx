"use client";

import dynamic from "next/dynamic";

// `ssr: false` is only allowed inside Client Components in Next.js 16+.
// This thin wrapper satisfies that requirement while keeping page.tsx a Server Component.
const Globe = dynamic(
  () =>
    import("@/components/forum/InteractiveGlobe").then((m) => ({
      default: m.InteractiveGlobe,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="relative h-[440px] overflow-hidden bg-[#020810] md:h-[640px]"
        aria-hidden
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-[280px] animate-pulse rounded-full bg-[#ff6b00]/5 md:size-[420px]" />
        </div>
        <div className="absolute left-4 top-6 space-y-2 sm:left-8">
          <div className="h-3 w-28 animate-pulse bg-[#ff6b00]/20" />
          <div className="h-6 w-40 animate-pulse bg-white/10" />
        </div>
      </div>
    ),
  }
);

export function GlobeDynamic() {
  return <Globe />;
}
