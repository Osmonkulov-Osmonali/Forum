"use client";

import { motion, type Variants } from "framer-motion";
import { MapPin, Clock, Monitor } from "lucide-react";

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.13,
      delayChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const META = [
  { icon: MapPin,    text: "Technopark, Bishkek" },
  { icon: Clock,     text: "12:00 – 19:00" },
  { icon: Monitor,   text: "Offline & Zoom Stream" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 pt-14 md:px-6 md:pt-16">
      {/* ── Background glow blobs ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-[#8ECAE6]/25 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-[#A2D2FF]/20 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[260px] w-[480px] -translate-x-1/2 rounded-full bg-[#8ECAE6]/15 blur-[80px]" />
      </div>

      {/* ── Content ── */}
      <motion.div
        className="mx-auto max-w-4xl text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Eyebrow */}
        <motion.p
          variants={item}
          className="mb-4 text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground"
        >
          Lead+ Youth Academy · powered by Logos.kg
        </motion.p>

        {/* Main heading */}
        <motion.h1
          variants={item}
          className="mb-5 font-heading text-[clamp(2.6rem,11vw,7.5rem)] font-semibold leading-[1.02] tracking-tight text-foreground-dark md:mb-6"
        >
          Grant Circle
          <span className="block text-[#8ECAE6]">Central Asia</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={item}
          className="mx-auto mb-8 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:mb-10 lg:text-xl"
        >
          Масштабное событие для школьников, студентов и родителей —
          <br className="hidden sm:block" />
          всё о поступлении в топовые университеты мира.
        </motion.p>

        {/* Meta badges */}
        <motion.div
          variants={item}
          className="mb-8 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-0 md:mb-12"
        >
          {META.map(({ icon: Icon, text }, i) => (
            <div key={text} className="flex items-center">
              <span className="inline-flex items-center gap-1.5 px-3 text-xs text-foreground sm:px-4 sm:text-sm md:text-base">
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
        <motion.div variants={item}>
          <a
            href="#registration"
            className="
              group inline-flex w-full items-center justify-center gap-2
              bg-[#8ECAE6] px-8 py-3.5
              text-sm font-semibold text-[#1E293B]
              transition-all duration-300
              hover:bg-[#1E293B] hover:text-[#8ECAE6]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ECAE6]
              sm:w-auto sm:px-10 sm:py-4 sm:text-base
            "
          >
            Зарегистрироваться
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4 translate-x-0 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </motion.div>

      {/* Bottom divider */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
    </section>
  );
}
