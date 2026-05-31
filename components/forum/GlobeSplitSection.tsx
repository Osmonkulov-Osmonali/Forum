"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { APP_STUDENTS } from "@/components/forum/appStudents";
import { StudentList } from "@/components/forum/StudentList";
import { StudentBottomSheet } from "@/components/forum/StudentBottomSheet";

export { APP_STUDENTS, type AppStudent } from "@/components/forum/appStudents";

// ─── Globe loading skeleton ───────────────────────────────────────────────────

function GlobeSkeleton() {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-transparent"
      aria-hidden
    >
      <div className="size-[200px] animate-pulse rounded-full bg-[#8ECAE6]/15 md:size-[340px]" />
    </div>
  );
}

// ─── Dynamic globe import (ssr:false — Three.js touches browser APIs) ──────────

const StudentGlobe = dynamic(
  () =>
    import("@/components/forum/StudentGlobe").then((m) => ({
      default: m.StudentGlobe,
    })),
  {
    ssr: false,
    loading: () => <GlobeSkeleton />,
  },
);

function useIsDesktopTooltip() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const sync = () => setIsDesktop(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return isDesktop;
}

// ─── Main section ─────────────────────────────────────────────────────────────

/**
 * GlobeSplitSection
 *
 * Controlled split section: one `selectedStudentId` drives both the 3-D globe
 * and the student list.
 *   • list click  → globe rotates toward `coordinates`, arc animates
 *   • marker click → list highlights; mobile bottom sheet opens
 *
 * Desktop (sm+): floating glass tooltip via `<Html>` beside the active marker.
 * Mobile (<sm): bottom sheet with full student details; no in-canvas tooltip.
 */
export function GlobeSplitSection() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    APP_STUDENTS[0]?.id ?? null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isDesktopTooltip = useIsDesktopTooltip();

  const selectedStudent =
    APP_STUDENTS.find((s) => s.id === selectedStudentId) ?? null;

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedStudentId(id);
      if (typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches) {
        setIsSheetOpen(true);
      }
    },
    [],
  );

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  return (
    <section
      id="globe-students"
      aria-label="Интерактивный глобус и список студентов"
      className="bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          }}
          className="mb-10 md:mb-14"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[#3B6E8F] backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-[#8ECAE6]" />
            Карта выпускников
          </span>
          <h2 className="max-w-2xl font-heading text-3xl font-semibold leading-[1.05] tracking-tight text-foreground-dark sm:text-4xl lg:text-5xl">
            Наши студенты учатся{" "}
            <span className="bg-gradient-to-r from-[#0F172A] to-[#8ECAE6] bg-clip-text text-transparent">
              по всему миру
            </span>
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-base text-slate-500 sm:text-lg">
            Выбери студента — глобус развернётся к его городу и прочертит путь из
            Бишкека. На телефоне откроется карточка снизу.
          </p>
        </motion.div>

        <div className="flex flex-col gap-8 md:grid md:h-[85vh] md:grid-cols-2 md:items-center md:gap-8">
          <div className="sticky top-16 z-10 h-[40vh] w-full bg-transparent md:static md:h-[78vh]">
            <div className="relative h-full w-full bg-transparent">
              <StudentGlobe
                students={APP_STUDENTS}
                activeId={selectedStudentId}
                showDesktopTooltip={isDesktopTooltip}
                onSelect={handleSelect}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,white_70%)]"
                aria-hidden
              />
            </div>
          </div>

          <div className="md:max-h-[85vh] md:overflow-y-auto md:pr-1 scrollbar-hide">
            <StudentList
              students={APP_STUDENTS}
              activeId={selectedStudentId}
              onSelect={handleSelect}
            />
          </div>
        </div>
      </div>

      <StudentBottomSheet
        student={selectedStudent}
        open={isSheetOpen}
        onClose={handleCloseSheet}
      />
    </section>
  );
}
