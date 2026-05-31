import dynamic             from "next/dynamic";
import { SmoothScroll }    from "@/components/SmoothScroll";
import { Header }          from "@/components/forum/Header";
import { Hero }            from "@/components/forum/Hero";
import { About }           from "@/components/forum/About";
import { GlobeSplitSection } from "@/components/forum/GlobeSplitSection";
import { Footer }          from "@/components/forum/Footer";

/*
  Below-fold sections are dynamically imported to split the JS bundle.
  This reduces Time-to-Interactive and Total Blocking Time for the
  above-fold Hero/About sections which matter most for Lighthouse LCP.

  `ssr: false` is only for components that call browser APIs at module
  load time (e.g. HeroCanvas). All other sections are SSR-safe and use
  streaming skeletons instead.
*/

// GlobeSplitSection is a Client Component that bundles the Three.js globe
// (ssr:false) and the StudentListPlaceholder in a two-column sticky layout.

const Partners = dynamic(
  () => import("@/components/forum/Partners").then((m) => ({ default: m.Partners })),
  {
    loading: () => (
      <div className="border-y border-[#E2E8F0] bg-background py-10 md:py-16" aria-hidden>
        <div className="mx-auto max-w-6xl px-6">
          <div className="h-5 w-40 animate-pulse bg-slate-100" />
        </div>
        <div className="mt-10 flex gap-6 overflow-hidden px-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 w-36 shrink-0 animate-pulse bg-slate-100" />
          ))}
        </div>
      </div>
    ),
  }
);

// SpeakersSection has been replaced by GlobeSplitSection (Globe + student list).
// Keeping the skeleton helper commented out in case it's needed again.
// function SpeakersSkeleton() { ... }

const Schedule = dynamic(
  () => import("@/components/forum/Schedule").then((m) => ({ default: m.Schedule })),
  {
    loading: () => (
      <div className="bg-background-secondary px-4 py-12 md:px-8 md:py-24" aria-hidden>
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-6 w-24 animate-pulse bg-slate-200" />
          <div className="h-8 w-52 animate-pulse bg-slate-200" />
        </div>
      </div>
    ),
  }
);

const Tickets = dynamic(
  () => import("@/components/forum/Tickets").then((m) => ({ default: m.Tickets })),
  {
    loading: () => (
      <div className="bg-background px-4 py-12 md:px-8 md:py-24" aria-hidden>
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-6 w-20 animate-pulse bg-slate-100" />
          <div className="h-8 w-44 animate-pulse bg-slate-100" />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

const Team = dynamic(
  () => import("@/components/forum/Team").then((m) => ({ default: m.Team })),
  {
    loading: () => (
      <div className="bg-background-secondary px-4 py-12 md:px-8 md:py-24" aria-hidden>
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-6 w-24 animate-pulse bg-slate-200" />
          <div className="h-8 w-48 animate-pulse bg-slate-200" />
          <div className="mt-6 grid grid-cols-2 gap-px bg-[#E2E8F0] lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-background-secondary">
                <div className="aspect-[3/4] animate-pulse bg-slate-200" />
                <div className="border-t border-[#E2E8F0] p-4 space-y-2">
                  <div className="h-4 w-28 animate-pulse bg-slate-200" />
                  <div className="h-3 w-20 animate-pulse bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

const Registration = dynamic(
  () => import("@/components/forum/Registration").then((m) => ({ default: m.Registration })),
  {
    loading: () => (
      <div className="bg-background px-4 py-12 md:px-8 md:py-24" aria-hidden>
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-40 animate-pulse bg-slate-100" />
        </div>
      </div>
    ),
  }
);

export default function ForumLanding() {
  return (
    <>
      {/* Skip navigation — appears on first Tab press for keyboard users */}
      <a href="#main-content" className="skip-nav">
        Перейти к основному контенту
      </a>

      <SmoothScroll />
      <Header />

      <main id="main-content" className="overflow-x-hidden">
        {/* Above-fold — statically imported, renders immediately */}
        <Hero />

        {/* Globe + Student list split section (replaces standalone GlobeDynamic + SpeakersSection) */}
        <GlobeSplitSection />

        <About />

        {/* Below-fold — dynamically imported, split into separate chunks */}
        <Partners />
        {/* <SpeakersSection /> — replaced by GlobeSplitSection above */}
        <Schedule />
        <Tickets />
        <Team />
        <Registration />
      </main>

      <Footer />
    </>
  );
}
