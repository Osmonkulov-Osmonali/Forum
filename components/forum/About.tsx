"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useSpring,
} from "framer-motion";

type CounterProps = {
  value: number;
  suffix?: string;
};

function Counter({ value, suffix = "" }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const spring = useSpring(0, { stiffness: 60, damping: 24 });
  const [display, setDisplay] = useState(0);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString("ru-RU")}
      {suffix}
    </span>
  );
}

const stats = [
  { value: 1000, suffix: "+", label: "участников" },
  { value: 16, suffix: "+", label: "спикеров" },
  { value: 10, suffix: "", label: "часов нетворкинга" },
];

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="bg-background px-4 py-12 md:px-8 md:py-24 lg:py-36"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10 md:mb-20 lg:mb-28"
        >
          <span className="mb-5 block text-sm font-medium uppercase tracking-[0.2em] text-accent-primary">
            О форуме
          </span>
          <h2 className="mb-8 max-w-3xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:mb-16 lg:text-5xl">
            Пространство для тех, кто строит будущее
          </h2>

          <div className="grid gap-8 md:gap-16 lg:grid-cols-2 lg:gap-24">
            <article className="space-y-5">
              <h3 className="text-xl font-semibold text-foreground lg:text-2xl">
                Миссия
              </h3>
              <div className="h-px w-12 bg-accent-secondary" />
              <p className="text-lg leading-relaxed text-muted-foreground">
                FORUM 2026 создаёт среду, где бизнес и технологии встречаются
                на равных. Мы объединяем людей, которые не просто следят за
                трендами, а формируют их — через открытый диалог, обмен опытом
                и совместные проекты.
              </p>
            </article>

            <article className="space-y-5">
              <h3 className="text-xl font-semibold text-foreground lg:text-2xl">
                Для кого
              </h3>
              <div className="h-px w-12 bg-accent-secondary" />
              <p className="text-lg leading-relaxed text-muted-foreground">
                Форум для предпринимателей, руководителей продуктов, инженеров,
                инвесторов и всех, кто хочет расти вместе с индустрией. Если
                вам важны новые связи, практические инсайты и вдохновение —
                вы по адресу.
              </p>
            </article>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="grid grid-cols-3 gap-4 border-t border-border pt-8 md:gap-12 md:pt-16 lg:gap-16 lg:pt-20"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mb-3 text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
