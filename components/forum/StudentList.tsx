"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutGroup,
  motion,
  type Variants,
} from "framer-motion";
import { MapPin, GraduationCap, Lightbulb, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppStudent } from "@/components/forum/appStudents";
import { distanceFromBishkek } from "@/components/forum/appStudents";

// ─── Animation tokens ───────────────────────────────────────────────────────────

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

const EXPAND_SPRING = {
  type: "spring" as const,
  duration: 0.4,
  bounce: 0,
};

const listGridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const expandVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: EXPAND_SPRING,
  },
};

const cardTextContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING,
  },
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
  const [ready, setReady] = useState(false);
  const sizeClass =
    size === "lg" ? "size-14" : size === "sm" ? "size-10" : "size-12";

  useEffect(() => {
    setReady(true);
  }, []);

  const frameClass = cn(
    "shrink-0 rounded-full border-2 object-cover transition-colors duration-300",
    sizeClass,
    active ? "border-[#3B6E8F] bg-white" : "border-white/80 bg-slate-100",
  );

  if (!ready) {
    return <div className={frameClass} aria-hidden />;
  }

  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={student.avatarUrl}
        alt=""
        onError={() => setFailed(true)}
        className={frameClass}
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

// ─── Expandable hints block (shared desktop + mobile) ───────────────────────────

function StudentCardExpandableContent({
  student,
  isActive,
}: {
  student: AppStudent;
  isActive: boolean;
}) {
  const km = distanceFromBishkek(student);
  const textReplayKey = isActive ? `active-${student.id}` : "inactive";

  return (
    <motion.div
      variants={expandVariants}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
      className="overflow-hidden"
    >
      <motion.div
        key={textReplayKey}
        variants={cardTextContainerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className="mt-3 space-y-3 border-t border-slate-200/70 pt-3"
      >
        <motion.p
          variants={textVariants}
          className="break-words font-sans text-sm leading-relaxed text-slate-600 whitespace-normal"
        >
          {student.message}
        </motion.p>
        <motion.div
          variants={textVariants}
          className="flex items-start gap-2 rounded-xl border border-dashed border-[#8ECAE6]/40 bg-[#8ECAE6]/8 px-3 py-2.5"
        >
          <Lightbulb
            className="mt-0.5 size-3.5 shrink-0 text-[#3B6E8F]"
            aria-hidden
          />
          <p className="min-w-0 break-words font-sans text-xs leading-relaxed text-slate-600 whitespace-normal">
            {student.tip}
          </p>
        </motion.div>
        <motion.div
          variants={textVariants}
          className="flex items-center justify-between gap-2 pt-1"
        >
          <span className="flex items-center gap-1.5 font-sans text-xs text-slate-500">
            <Route className="size-3.5 shrink-0 text-[#8ECAE6]" aria-hidden />
            Бишкек → {student.city}
          </span>
          <span className="rounded-full bg-[#8ECAE6]/15 px-2.5 py-0.5 font-sans text-[11px] font-medium tabular-nums text-[#3B6E8F]">
            ~{km.toLocaleString("ru-RU")} км
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ActiveMapBadge({ isActive }: { isActive: boolean }) {
  return (
    <motion.span
      variants={badgeVariants}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
      className="shrink-0 rounded-full bg-[#3B6E8F] px-2.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide text-white"
    >
      На карте
    </motion.span>
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
      layout="position"
      animate={{ scale: isActive ? 1.02 : 1, opacity: isActive ? 1 : 0.86 }}
      transition={SPRING}
      className={cn("min-w-0 origin-center", isActive && "relative z-10")}
    >
      <motion.button
        type="button"
        onClick={() => onSelect(student.id)}
        whileTap={{ scale: 0.985 }}
        transition={SPRING}
        className={cn(
          "group/card relative w-full rounded-2xl border text-left backdrop-blur-md transition-shadow duration-300",
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

        <div className="relative flex items-start gap-3.5">
          <StudentAvatar
            student={student}
            active={isActive}
            size={isActive ? "lg" : "md"}
          />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "break-words font-sans font-semibold leading-snug text-slate-900 whitespace-normal",
                isActive ? "text-base" : "text-sm",
              )}
            >
              {student.name}
            </p>
            <p className="mt-0.5 flex items-start gap-1.5 font-sans text-xs leading-snug text-[#3B6E8F]">
              <GraduationCap className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span className="min-w-0 break-words whitespace-normal">
                {student.university}
              </span>
            </p>
            {!isActive && (
              <p className="mt-1 flex items-start gap-1 font-sans text-[11px] leading-snug text-slate-500">
                <MapPin className="mt-0.5 size-3 shrink-0 text-[#8ECAE6]" aria-hidden />
                <span className="break-words whitespace-normal">{student.city}</span>
              </p>
            )}
          </div>
          {isActive && <ActiveMapBadge isActive={isActive} />}
        </div>

        <StudentCardExpandableContent student={student} isActive={isActive} />
      </motion.button>
    </motion.div>
  );
}

// ─── Mobile carousel tokens ─────────────────────────────────────────────────────

/** Fixed slide width — identical for every card so snap/scroll math stays stable. */
const MOBILE_SLIDE_WIDTH =
  "w-[calc(100vw-32px)] max-w-[340px] shrink-0 snap-center";

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
    <div ref={cardRef} data-id={student.id} className={MOBILE_SLIDE_WIDTH}>
      <motion.div
        animate={{
          scale: isActive ? 1 : 0.94,
          opacity: isActive ? 1 : 0.72,
        }}
        transition={SPRING}
        className="w-full origin-center"
      >
        <button
          type="button"
          onClick={() => onSelect(student.id)}
          className={cn(
            "w-full rounded-2xl border text-left backdrop-blur-md transition-colors duration-300",
            isActive
              ? "border-[#3B6E8F] bg-white/85 p-5 shadow-[0_16px_40px_-16px_rgba(59,110,143,0.45)] ring-1 ring-[#8ECAE6]/80"
              : "border-white/60 bg-white/50 p-4 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.25)]",
          )}
        >
          <div className="relative flex items-start gap-3.5">
            <StudentAvatar
              student={student}
              active={isActive}
              size={isActive ? "lg" : "md"}
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "break-words font-sans font-semibold leading-snug text-slate-900 whitespace-normal",
                  isActive ? "text-base" : "text-sm",
                )}
              >
                {student.name}
              </p>
              <p className="mt-0.5 flex items-start gap-1.5 font-sans text-xs leading-snug text-[#3B6E8F]">
                <GraduationCap className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <span className="min-w-0 break-words whitespace-normal">
                  {student.university}
                </span>
              </p>
              {!isActive && (
                <p className="mt-1 flex items-start gap-1 font-sans text-[11px] leading-snug text-slate-500">
                  <MapPin className="mt-0.5 size-3 shrink-0 text-[#8ECAE6]" aria-hidden />
                  <span className="break-words whitespace-normal">{student.city}</span>
                </p>
              )}
            </div>
            {isActive && <ActiveMapBadge isActive={isActive} />}
          </div>

          <StudentCardExpandableContent student={student} isActive={isActive} />
        </button>
      </motion.div>
    </div>
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
    const target = el.offsetLeft - (root.clientWidth - el.offsetWidth) / 2;
    root.scrollTo({ left: Math.max(0, target), behavior: smooth ? "smooth" : "auto" });

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

  // Re-center when the active card grows/shrinks (expanded description)
  useEffect(() => {
    if (!activeId) return;
    const el = cardRefs.current[activeId];
    const root = containerRef.current;
    if (!el || !root) return;

    const recenter = () => {
      const target = el.offsetLeft - (root.clientWidth - el.offsetWidth) / 2;
      root.scrollTo({ left: Math.max(0, target), behavior: "auto" });
    };

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(recenter);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeId]);

  return (
    <div className="md:hidden">
      <div
        ref={containerRef}
        className="
          flex items-start gap-3 overflow-x-auto overflow-y-visible
          overscroll-x-contain scroll-px-4 px-4 pb-2
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
        initial={false}
        whileInView="show"
        viewport={{ once: false, amount: 0.2 }}
        className="hidden md:flex md:flex-col md:gap-4"
      >
        <div className="grid grid-cols-2 items-start gap-4">
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
        </div>
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
