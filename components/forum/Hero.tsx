"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  type Variants,
} from "framer-motion";
import { MapPin, Clock, Monitor, ArrowRight } from "lucide-react";
import { HeroGlassDecor } from "@/components/forum/HeroGlassDecor";
import { cn } from "@/lib/utils";
import { TICKETON_REGISTRATION_URL } from "@/config/links";

/* ──────────────────────────────────────────────────────────────────────────
   Animation variants
   ────────────────────────────────────────────────────────────────────────── */

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.08,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const bentoGridVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const bentoCardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   Data
   ────────────────────────────────────────────────────────────────────────── */

const META = [
  { icon: MapPin, text: "Technopark, Bishkek" },
  { icon: Clock, text: "12:00 – 19:00" },
  { icon: Monitor, text: "Offline & Zoom Stream" },
];

const STATS = [
  { value: "500+", label: "участников", hint: "offline & online" },
  { value: "15+", label: "спикеров", hint: "со всего мира" },
  { value: "Ivy League", label: "топ-вузы", hint: "MIT · Oxford · NUS" },
];

const UNIVERSITIES = [
  "MIT",
  "Harvard",
  "Stanford",
  "Tsinghua",
  "Oxford",
  "Cambridge",
  "ETH Zürich",
  "NUS",
  "Yale",
  "Princeton",
  "UC Berkeley",
  "Caltech",
];

/* ──────────────────────────────────────────────────────────────────────────
   Magnetic CTA — slight attraction toward the cursor (hover-capable devices)
   ────────────────────────────────────────────────────────────────────────── */

function MagneticCTA() {
  const ref = useRef<HTMLAnchorElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 180, damping: 14, mass: 0.12 });
  const springY = useSpring(y, { stiffness: 180, damping: 14, mass: 0.12 });

  function handlePointerMove(e: React.PointerEvent<HTMLAnchorElement>) {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * 0.4);
    y.set(relY * 0.55);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={TICKETON_REGISTRATION_URL}
      target="_blank"
      rel="noopener noreferrer"
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.96 }}
      className="
        group relative inline-flex w-full items-center justify-center gap-2.5
        overflow-hidden rounded-full
        min-h-14 bg-[#0F172A] px-9 py-4
        text-sm font-semibold text-white
        shadow-[0_18px_40px_-18px_rgba(15,23,42,0.55)]
        transition-shadow duration-300
        [@media(hover:hover)]:hover:shadow-[0_24px_55px_-16px_rgba(142,202,230,0.65)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ECAE6] focus-visible:ring-offset-2
        sm:w-auto sm:text-base
      "
    >
      {/* Sliding gradient fill on hover */}
      <span
        aria-hidden
        className="
          absolute inset-0 -z-0 translate-y-full bg-gradient-to-r from-[#8ECAE6] to-[#A2D2FF]
          transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
          [@media(hover:hover)]:group-hover:translate-y-0
        "
      />
      <span className="relative z-10 transition-colors duration-300 [@media(hover:hover)]:group-hover:text-[#0F172A]">
        Зарегистрироваться
      </span>
      <ArrowRight
        className="
          relative z-10 size-4 shrink-0
          transition-all duration-300
          group-hover:translate-x-1
          [@media(hover:hover)]:group-hover:text-[#0F172A]
        "
      />
    </motion.a>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   University marquee — Framer Motion infinite horizontal scroll
   ────────────────────────────────────────────────────────────────────────── */

function UniversityMarquee() {
  const loop = [...UNIVERSITIES, ...UNIVERSITIES];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
      }}
    >
      <motion.div
        className="flex w-max gap-2.5"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 26, ease: "linear", repeat: Infinity }}
      >
        {loop.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="
              shrink-0 whitespace-nowrap rounded-full border border-[#0F172A]/10
              bg-white/50 px-4 py-1.5 text-xs font-medium tracking-tight text-foreground/70
              backdrop-blur-sm
            "
          >
            {name}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Bento stat card
   ────────────────────────────────────────────────────────────────────────── */

function StatCard({
  value,
  label,
  hint,
  className,
}: {
  value: string;
  label: string;
  hint: string;
  className?: string;
}) {
  return (
    <motion.div
      variants={bentoCardVariants}
      className={cn(
        "group/stat relative flex flex-col justify-between overflow-hidden rounded-2xl",
        "border border-white/60 bg-white/40 p-4 backdrop-blur-md sm:p-5",
        "shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]",
        "transition-colors duration-300 [@media(hover:hover)]:hover:border-[#8ECAE6]/60",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-8 size-20 rounded-full bg-[#8ECAE6]/20 blur-2xl transition-opacity duration-500 group-hover/stat:opacity-100 sm:opacity-70"
      />
      <span className="relative bg-gradient-to-br from-[#0F172A] to-[#8ECAE6] bg-clip-text text-2xl font-semibold leading-none tracking-tight text-transparent sm:text-3xl lg:text-[2.1rem]">
        {value}
      </span>
      <div className="relative mt-3">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Hero
   ────────────────────────────────────────────────────────────────────────── */

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-background px-4 pb-16 pt-24 md:px-6 md:pb-20 md:pt-28">
      {/* ── Background glow blobs ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-[#8ECAE6]/25 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-[#A2D2FF]/20 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[260px] w-[480px] -translate-x-1/2 rounded-full bg-[#8ECAE6]/15 blur-[80px]" />
      </div>

      {/* ── Mobile: faint glass decor as background ── */}
      <HeroGlassDecor
        className="
          absolute inset-0 z-0 scale-75 opacity-25
          md:hidden
        "
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-8 lg:gap-12">
        {/* ── Content ── */}
        <motion.div
          className="text-center md:text-left"
          variants={container}
          initial="hidden"
          animate="show"
        >
        {/* Eyebrow */}
        <motion.div
          variants={item}
          className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/60 bg-white/40 px-4 py-1.5 backdrop-blur-md"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8ECAE6] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[#8ECAE6]" />
          </span>
          <span className="text-xs font-medium tracking-[0.12em] text-foreground/80 sm:text-sm">
            Lead+ Youth Academy · powered by Logos.kg
          </span>
        </motion.div>

        {/* Main heading — large, asymmetric, gradient keywords */}
        <motion.h1
          variants={item}
          className="mb-6 font-heading text-[clamp(2.4rem,9vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-balance text-foreground-dark"
        >
          <span className="block">Study</span>
          <span className="block bg-gradient-to-r from-[#0F172A] via-[#3B6E8F] to-[#8ECAE6] bg-clip-text pb-2 text-transparent">
            free&nbsp;forum
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={item}
          className="mx-auto mb-9 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:mx-0"
        >
          Масштабное событие для школьников, студентов и родителей —
          всё о поступлении в топовые университеты мира.
        </motion.p>

        {/* Bento stat cards — cascade on scroll into view */}
        <motion.div
          variants={bentoGridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-9 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
        >
          {STATS.map((stat, i) => (
            <StatCard
              key={stat.label}
              {...stat}
              className={cn(i === 2 && "col-span-2 sm:col-span-1")}
            />
          ))}
        </motion.div>

        {/* Speakers from — moving university tags */}
        <motion.div variants={item} className="mb-9">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Спикеры из:
          </p>
          <UniversityMarquee />
        </motion.div>

        {/* Meta badges */}
        <motion.div
          variants={item}
          className="mb-10 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-0 md:justify-start"
        >
          {META.map(({ icon: Icon, text }, i) => (
            <div key={text} className="flex items-center">
              <span className="inline-flex items-center gap-1.5 px-3 text-xs text-foreground sm:px-4 sm:text-sm">
                <Icon className="size-4 shrink-0 text-[#8ECAE6]" />
                {text}
              </span>
              {i < META.length - 1 && (
                <span className="hidden h-4 w-px bg-border sm:block" />
              )}
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div variants={item} className="flex justify-center md:justify-start">
          <MagneticCTA />
        </motion.div>
        </motion.div>

        {/* ── Desktop: interactive glass spheres ── */}
        <HeroGlassDecor
          className="
            hidden h-[min(68vh,540px)] w-full
            md:block
          "
        />
      </div>

      {/* Bottom divider */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
    </section>
  );
}
