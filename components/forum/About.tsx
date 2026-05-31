"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useSpring,
  type Variants,
} from "framer-motion";

const revealItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const letterVariant: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const headingContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.028 } },
};

const SCROLL_IN_VIEW = { once: false, amount: 0.2 } as const;

function AboutArticle({
  title,
  children,
  staggerDelay = 0,
}: {
  title: string;
  children: ReactNode;
  staggerDelay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, SCROLL_IN_VIEW);

  return (
    <motion.article
      ref={ref}
      className="space-y-5"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.12,
            delayChildren: staggerDelay,
          },
        },
      }}
    >
      <motion.h3
        variants={headingContainer}
        className="text-xl font-semibold text-foreground lg:text-2xl"
      >
        {title.split("").map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            variants={letterVariant}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.h3>
      <motion.div
        variants={revealItem}
        className="h-px w-12 origin-left bg-accent-secondary"
      />
      <motion.div variants={revealItem}>{children}</motion.div>
    </motion.article>
  );
}

type CounterProps = {
  value: number;
  suffix?: string;
};

function Counter({ value, suffix = "" }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, SCROLL_IN_VIEW);
  const spring = useSpring(0, { stiffness: 60, damping: 24 });
  const [display, setDisplay] = useState(0);

  /**
   * MotionConfig reducedMotion="user" only stops motion.* component
   * transitions — it does NOT stop useSpring. We must guard manually.
   */
  const reducedMotionRef = useRef(false);
  useEffect(() => {
    reducedMotionRef.current =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  useEffect(() => {
    if (!isInView) {
      if (reducedMotionRef.current) {
        setDisplay(0);
      } else {
        spring.set(0);
      }
      return;
    }
    if (reducedMotionRef.current) {
      setDisplay(value);
    } else {
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
  { value: 500, suffix: "+", label: "участников offline" },
  { value: 500, suffix: "+", label: "зрителей онлайн" },
  { value: 12,  suffix: "",  label: "спикеров" },
  { value: 7,   suffix: "",  label: "часов контента" },
];

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, SCROLL_IN_VIEW);

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
            О событии
          </span>
          <h2 className="mb-8 max-w-3xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:mb-16 lg:text-5xl">
            Один день, который открывает двери в лучшие университеты мира
          </h2>

          <div className="grid gap-8 md:gap-16 lg:grid-cols-2 lg:gap-24">
            <AboutArticle title="Для кого">
              <p className="text-base leading-relaxed text-muted-foreground lg:text-lg">
                Study free forum — масштабное событие для{" "}
                <strong className="font-medium text-foreground">
                  школьников и студентов 11–19 лет
                </strong>{" "}
                и их родителей. Мы собираем тех, кто уже думает о своём будущем
                и хочет поступить в топовые университеты мира: MIT, Oxford, ETH
                Zurich, NUS и другие.
              </p>
            </AboutArticle>

            <AboutArticle title="Что внутри" staggerDelay={0.18}>
              <p className="text-base leading-relaxed text-muted-foreground lg:text-lg">
                12 спикеров — студенты и выпускники ведущих университетов
                планеты — поделятся личным опытом поступления, жизни за рубежом
                и построения карьеры. Практические воркшопы, разбор эссе,
                нетворкинг и Zoom-трансляция для участников из KG, KZ и UZ.
              </p>
            </AboutArticle>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="grid grid-cols-2 gap-4 border-t border-border pt-8 sm:grid-cols-4 sm:gap-6 md:gap-12 md:pt-16 lg:gap-16 lg:pt-20"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mb-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-6xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
