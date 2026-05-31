"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { MapPin, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppStudent } from "@/components/forum/appStudents";

// ─── Scroll-in stagger variants ────────────────────────────────────────────────

const listGridVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const listCardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

// ─── Types (re-export for globe & list consumers) ──────────────────────────────

export type Student = AppStudent;

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── Avatar with fallback ──────────────────────────────────────────────────────

function StudentAvatar({
  student,
  active,
}: {
  student: AppStudent;
  active: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={student.avatarUrl}
        alt=""
        onError={() => setFailed(true)}
        className={cn(
          "size-12 shrink-0 rounded-full border-2 object-cover transition-colors duration-300",
          active
            ? "border-[#3B6E8F] bg-white"
            : "border-white/80 bg-slate-100",
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full font-sans text-sm font-bold transition-colors duration-300",
        active
          ? "bg-gradient-to-br from-[#3B6E8F] to-[#8ECAE6] text-white"
          : "bg-[#8ECAE6]/20 text-[#3B6E8F]",
      )}
    >
      {initialsFromName(student.name)}
    </div>
  );
}

// ─── Single student card ────────────────────────────────────────────────────────

interface CardProps {
  student: AppStudent;
  active: boolean;
  onSelect: (id: string) => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}

function StudentCard({ student, active, onSelect, cardRef }: CardProps) {
  return (
    <motion.button
      ref={cardRef}
      data-id={student.id}
      type="button"
      variants={listCardVariants}
      onClick={() => onSelect(student.id)}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "group/card relative shrink-0 snap-center text-left",
        "w-[85%] md:w-auto",
        "overflow-hidden rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 sm:p-5",
        active
          ? "border-[#3B6E8F] bg-white/75 shadow-[0_12px_36px_-18px_rgba(59,110,143,0.5)] ring-1 ring-[#8ECAE6]"
          : "border-white/60 bg-white/40 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.3)] hover:border-[#8ECAE6]/70 hover:bg-white/60",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-6 -top-8 size-24 rounded-full bg-[#8ECAE6]/30 blur-2xl transition-opacity duration-500",
          active ? "opacity-100" : "opacity-0 group-hover/card:opacity-60",
        )}
      />

      <div className="relative flex items-center gap-3.5">
        <StudentAvatar student={student} active={active} />

        <div className="min-w-0">
          <p className="truncate font-sans text-sm font-semibold text-slate-900 sm:text-base">
            {student.name}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate font-sans text-xs text-[#3B6E8F] sm:text-sm">
            <GraduationCap className="size-3.5 shrink-0" />
            <span className="truncate">{student.university}</span>
          </p>
        </div>
      </div>

      <div className="relative mt-3 flex items-center justify-between border-t border-slate-200/70 pt-3">
        <span className="flex items-center gap-1.5 font-sans text-xs text-slate-500">
          <MapPin className="size-3.5 shrink-0 text-[#8ECAE6]" />
          {student.city}
        </span>
        {active && (
          <motion.span
            layoutId="student-active-pill"
            className="rounded-full bg-[#3B6E8F] px-2.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide text-white"
          >
            На карте
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}

// ─── Student list (responsive: bento grid ⇆ swipe carousel) ──────────────────────

interface StudentListProps {
  students: AppStudent[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function StudentList({ students, activeId, onSelect }: StudentListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 767px)");
    if (!mql.matches) return;

    const root = containerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;
        let best: { id: string; ratio: number } | null = null;
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.id;
          if (!id) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { id, ratio: entry.intersectionRatio };
          }
        }
        if (best && best.ratio >= 0.6 && best.id !== activeId) {
          onSelect(best.id);
        }
      },
      { root, threshold: [0.3, 0.6, 0.9] },
    );

    Object.values(cardRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [students, activeId, onSelect]);

  useEffect(() => {
    if (typeof window === "undefined" || !activeId) return;
    const mql = window.matchMedia("(max-width: 767px)");
    if (!mql.matches) return;

    const el = cardRefs.current[activeId];
    if (!el) return;

    isProgrammaticScroll.current = true;
    el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    const t = window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 600);
    return () => window.clearTimeout(t);
  }, [activeId]);

  return (
    <motion.div
      ref={containerRef}
      variants={listGridVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="
        flex flex-row gap-4 overflow-x-auto scroll-px-[7.5%] px-[7.5%] pb-3
        snap-x snap-mandatory scrollbar-hide
        md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0
      "
    >
      {students.map((student) => (
        <StudentCard
          key={student.id}
          student={student}
          active={student.id === activeId}
          onSelect={onSelect}
          cardRef={(el) => {
            cardRefs.current[student.id] = el;
          }}
        />
      ))}
    </motion.div>
  );
}
