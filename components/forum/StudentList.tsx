"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  type Variants,
} from "framer-motion";
import { MapPin, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppStudent } from "@/components/forum/appStudents";

// ─── Animation tokens ───────────────────────────────────────────────────────────

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

const listGridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

// ─── Types ──────────────────────────────────────────────────────────────────────

export type Student = AppStudent;

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── Avatar ─────────────────────────────────────────────────────────────────────

function StudentAvatar({
  student,
  active,
  size = "md",
}: {
  student: AppStudent;
  active: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const sizeClass =
    size === "lg" ? "size-14" : size === "sm" ? "size-10" : "size-12";

  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={student.avatarUrl}
        alt=""
        onError={() => setFailed(true)}
        className={cn(
          "shrink-0 rounded-full border-2 object-cover transition-colors duration-300",
          sizeClass,
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
        "flex shrink-0 items-center justify-center rounded-full font-sans text-sm font-bold transition-colors duration-300",
        sizeClass,
        active
          ? "bg-gradient-to-br from-[#3B6E8F] to-[#8ECAE6] text-white"
          : "bg-[#8ECAE6]/20 text-[#3B6E8F]",
      )}
    >
      {initialsFromName(student.name)}
    </div>
  );
}

// ─── Shared card sections ───────────────────────────────────────────────────────

function StudentCardExpandedDetails({
  message,
  show,
}: {
  message: string;
  show: boolean;
}) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          key="details"
          layout
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={SPRING}
          className="overflow-hidden"
        >
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ ...SPRING, delay: 0.04 }}
            className="mt-3 border-t border-slate-200/70 pt-3 text-sm leading-relaxed text-slate-600"
          >
            {message}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StudentCardCityRow({
  city,
  isActive,
}: {
  city: string;
  isActive: boolean;
}) {
  return (
    <motion.div
      layout
      className="relative mt-3 flex items-center justify-between border-t border-slate-200/70 pt-3"
    >
      <span className="flex items-center gap-1.5 font-sans text-xs text-slate-500">
        <MapPin className="size-3.5 shrink-0 text-[#8ECAE6]" />
        {city}
      </span>
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={SPRING}
            className="rounded-full bg-[#3B6E8F] px-2.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide text-white"
          >
            На карте
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Desktop expanding card ─────────────────────────────────────────────────────

function DesktopExpandingCard({
  student,
  isActive,
  onSelect,
  cardRef,
}: {
  student: AppStudent;
  isActive: boolean;
  onSelect: (id: string) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <motion.div
      ref={cardRef}
      data-id={student.id}
      layout
      transition={SPRING}
      className="min-w-0"
    >
      <motion.button
        type="button"
        layout
        onClick={() => onSelect(student.id)}
        whileTap={{ scale: 0.985 }}
        transition={SPRING}
        className={cn(
          "group/card relative w-full overflow-hidden rounded-2xl border text-left backdrop-blur-md",
          isActive
            ? "border-[#3B6E8F] bg-white/85 p-5 shadow-[0_16px_40px_-16px_rgba(59,110,143,0.45)] ring-1 ring-[#8ECAE6]/80"
            : "border-white/60 bg-white/50 p-4 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.3)] hover:border-[#8ECAE6]/70 hover:bg-white/60",
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -right-6 -top-8 size-24 rounded-full bg-[#8ECAE6]/30 blur-2xl transition-opacity duration-500",
            isActive ? "opacity-100" : "opacity-0 group-hover/card:opacity-60",
          )}
        />

        <motion.div layout className="relative flex items-center gap-3.5">
          <StudentAvatar
            student={student}
            active={isActive}
            size={isActive ? "lg" : "md"}
          />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate font-sans font-semibold text-slate-900 transition-all duration-300",
                isActive ? "text-base" : "text-sm",
              )}
            >
              {student.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate font-sans text-xs text-[#3B6E8F]">
              <GraduationCap className="size-3.5 shrink-0" />
              <span className="truncate">{student.university}</span>
            </p>
          </div>
        </motion.div>

        <StudentCardCityRow city={student.city} isActive={isActive} />

        <StudentCardExpandedDetails message={student.message} show={isActive} />
      </motion.button>
    </motion.div>
  );
}

// ─── Mobile expanding carousel card ─────────────────────────────────────────────

function MobileExpandingCard({
  student,
  isActive,
  onSelect,
  cardRef,
}: {
  student: AppStudent;
  isActive: boolean;
  onSelect: (id: string) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <motion.div
      ref={cardRef}
      data-id={student.id}
      layout
      animate={{
        width: isActive ? "min(88vw, 340px)" : "min(72vw, 272px)",
        scale: isActive ? 1 : 0.94,
        opacity: isActive ? 1 : 0.72,
      }}
      transition={SPRING}
      className="shrink-0 snap-center"
    >
      <motion.button
        type="button"
        layout
        onClick={() => onSelect(student.id)}
        whileTap={{ scale: 0.985 }}
        transition={SPRING}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border text-left backdrop-blur-md",
          isActive
            ? "border-[#3B6E8F] bg-white/85 p-5 shadow-[0_16px_40px_-16px_rgba(59,110,143,0.45)] ring-1 ring-[#8ECAE6]/80"
            : "border-white/60 bg-white/50 p-4 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.25)]",
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-[#8ECAE6]/25 blur-2xl transition-opacity duration-500",
            isActive ? "opacity-100" : "opacity-0",
          )}
        />

        <motion.div layout className="relative flex items-center gap-3.5">
          <StudentAvatar
            student={student}
            active={isActive}
            size={isActive ? "lg" : "md"}
          />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate font-sans font-semibold text-slate-900 transition-all duration-300",
                isActive ? "text-base" : "text-sm",
              )}
            >
              {student.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate font-sans text-xs text-[#3B6E8F]">
              <GraduationCap className="size-3.5 shrink-0" />
              <span className="truncate">{student.university}</span>
            </p>
          </div>
        </motion.div>

        <StudentCardCityRow city={student.city} isActive={isActive} />

        <StudentCardExpandedDetails message={student.message} show={isActive} />
      </motion.button>
    </motion.div>
  );
}

// ─── Mobile expanding carousel card ─────────────────────────────────────────────

function MobileStudentCarousel({
  students,
  activeId,
  onSelect,
}: {
  students: AppStudent[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isProgrammaticScroll = useRef(false);
  /** Skip re-centering when activeId was set by the user's own swipe. */
  const selectionFromScroll = useRef(false);

  const activeIndex = Math.max(
    0,
    students.findIndex((s) => s.id === activeId),
  );

  const scrollToStudent = useCallback((id: string, smooth = true) => {
    const root = containerRef.current;
    const el = cardRefs.current[id];
    if (!root || !el) return;

    isProgrammaticScroll.current = true;
    const rootRect = root.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const delta =
      elRect.left -
      rootRect.left -
      (rootRect.width - elRect.width) / 2 +
      root.scrollLeft;

    root.scrollTo({ left: delta, behavior: smooth ? "smooth" : "auto" });

    window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, smooth ? 520 : 0);
  }, []);

  const selectExternal = useCallback(
    (id: string) => {
      selectionFromScroll.current = false;
      onSelect(id);
      scrollToStudent(id);
    },
    [onSelect, scrollToStudent],
  );

  // Detect centered card while the user swipes
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    let raf = 0;
    const handleScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (isProgrammaticScroll.current) return;

        const rootRect = root.getBoundingClientRect();
        const centerX = rootRect.left + rootRect.width / 2;

        let closestId: string | null = null;
        let closestDist = Infinity;

        for (const student of students) {
          const el = cardRefs.current[student.id];
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const dist = Math.abs(cardCenter - centerX);
          if (dist < closestDist) {
            closestDist = dist;
            closestId = student.id;
          }
        }

        if (closestId && closestId !== activeId) {
          selectionFromScroll.current = true;
          onSelect(closestId);
        }
      });
    };

    root.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(raf);
    };
  }, [students, activeId, onSelect]);

  // Globe tap / dot tap → center the matching card (not when user swiped)
  useEffect(() => {
    if (!activeId || selectionFromScroll.current) {
      selectionFromScroll.current = false;
      return;
    }
    scrollToStudent(activeId);
  }, [activeId, scrollToStudent]);

  return (
    <div className="md:hidden">
      <LayoutGroup id="student-carousel">
        <div
          ref={containerRef}
          className="
            flex items-start gap-3 overflow-x-auto overscroll-x-contain
            scroll-px-[6vw] px-[6vw] pb-2
            snap-x snap-mandatory scrollbar-hide
          "
        >
          {students.map((student) => (
            <MobileExpandingCard
              key={student.id}
              student={student}
              isActive={student.id === activeId}
              onSelect={selectExternal}
              cardRef={(el) => {
                cardRefs.current[student.id] = el;
              }}
            />
          ))}
        </div>
      </LayoutGroup>

      <div className="mt-4 flex items-center justify-center gap-3 px-4">
        <div className="flex items-center gap-1.5">
          {students.map((student, index) => {
            const isActive = student.id === activeId;
            return (
              <button
                key={student.id}
                type="button"
                aria-label={`Студент ${index + 1}: ${student.name}`}
                onClick={() => selectExternal(student.id)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  isActive
                    ? "h-2 w-6 bg-[#3B6E8F]"
                    : "size-2 bg-slate-300 hover:bg-[#8ECAE6]",
                )}
              />
            );
          })}
        </div>
        <span className="font-sans text-xs tabular-nums text-slate-400">
          {activeIndex + 1}/{students.length}
        </span>
      </div>
    </div>
  );
}

// ─── Desktop grid ───────────────────────────────────────────────────────────────

function DesktopStudentGrid({
  students,
  activeId,
  onSelect,
}: {
  students: AppStudent[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!activeId) return;
    const el = cardRefs.current[activeId];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeId]);

  return (
    <LayoutGroup id="student-desktop-grid">
      <motion.div
        variants={listGridVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="hidden md:grid md:grid-cols-2 md:items-start md:gap-4"
      >
        {students.map((student) => (
          <DesktopExpandingCard
            key={student.id}
            student={student}
            isActive={student.id === activeId}
            onSelect={onSelect}
            cardRef={(el) => {
              cardRefs.current[student.id] = el;
            }}
          />
        ))}
      </motion.div>
    </LayoutGroup>
  );
}

// ─── Public export ──────────────────────────────────────────────────────────────

interface StudentListProps {
  students: AppStudent[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function StudentList({ students, activeId, onSelect }: StudentListProps) {
  return (
    <>
      <MobileStudentCarousel
        students={students}
        activeId={activeId}
        onSelect={onSelect}
      />
      <DesktopStudentGrid
        students={students}
        activeId={activeId}
        onSelect={onSelect}
      />
    </>
  );
}
