"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types & data ──────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  name: string;
  university: string;
  city: string;
  /** [latitude, longitude] — used by the 3-D globe */
  lat: number;
  lon: number;
  initials: string;
}

/** Source hub — every arc on the globe originates here. */
export const BISHKEK = { lat: 42.87, lon: 74.59 } as const;

export const STUDENTS: Student[] = [
  { id: "tokyo",     name: "Айдана Раимова",     university: "University of Tokyo",   city: "Токио",     lat: 35.68, lon: 139.69, initials: "АР" },
  { id: "newyork",   name: "Нурлан Исаков",       university: "Columbia University",   city: "Нью-Йорк",  lat: 40.71, lon: -74.0,  initials: "НИ" },
  { id: "london",    name: "Зарина Бекова",       university: "UCL",                   city: "Лондон",    lat: 51.51, lon: -0.13,  initials: "ЗБ" },
  { id: "boston",    name: "Алия Исакова",        university: "MIT",                   city: "Бостон",    lat: 42.36, lon: -71.06, initials: "АИ" },
  { id: "singapore", name: "Айзат Кенжебаева",    university: "NUS",                   city: "Сингапур",  lat: 1.35,  lon: 103.82, initials: "АК" },
  { id: "berlin",    name: "Тилек Сатыбалдиев",   university: "TU Berlin",             city: "Берлин",    lat: 52.52, lon: 13.4,   initials: "ТС" },
  { id: "seoul",     name: "Бегайым Осмонова",    university: "Seoul National Univ.",  city: "Сеул",      lat: 37.57, lon: 126.98, initials: "БО" },
  { id: "toronto",   name: "Чолпон Эркинова",     university: "University of Toronto", city: "Торонто",   lat: 43.65, lon: -79.38, initials: "ЧЭ" },
];

// ─── Single student card ────────────────────────────────────────────────────────

interface CardProps {
  student: Student;
  active: boolean;
  onSelect: (id: string) => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}

function StudentCard({ student, active, onSelect, cardRef }: CardProps) {
  return (
    <button
      ref={cardRef}
      data-id={student.id}
      type="button"
      onClick={() => onSelect(student.id)}
      className={cn(
        "group/card relative shrink-0 snap-center text-left",
        "w-[85%] md:w-auto",
        "overflow-hidden rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 sm:p-5",
        active
          ? "border-[#3B6E8F] bg-white/75 shadow-[0_12px_36px_-18px_rgba(59,110,143,0.5)] ring-1 ring-[#8ECAE6]"
          : "border-white/60 bg-white/40 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.3)] hover:border-[#8ECAE6]/70 hover:bg-white/60",
      )}
    >
      {/* Soft accent glow when active */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-6 -top-8 size-24 rounded-full bg-[#8ECAE6]/30 blur-2xl transition-opacity duration-500",
          active ? "opacity-100" : "opacity-0 group-hover/card:opacity-60",
        )}
      />

      <div className="relative flex items-center gap-3.5">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-full font-sans text-sm font-bold transition-colors duration-300",
            active
              ? "bg-gradient-to-br from-[#3B6E8F] to-[#8ECAE6] text-white"
              : "bg-[#8ECAE6]/20 text-[#3B6E8F]",
          )}
        >
          {student.initials}
        </div>

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
    </button>
  );
}

// ─── Student list (responsive: bento grid ⇆ swipe carousel) ──────────────────────

interface StudentListProps {
  students: Student[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function StudentList({ students, activeId, onSelect }: StudentListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // Ignore observer-driven selection while we programmatically scroll a card
  // into view (prevents a feedback loop between globe → list → globe).
  const isProgrammaticScroll = useRef(false);

  // ── Mobile: detect the centered card and lift it as the active selection ──
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

  // ── When active changes (e.g. via globe click), center its card on mobile ──
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
    <div
      ref={containerRef}
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
    </div>
  );
}
