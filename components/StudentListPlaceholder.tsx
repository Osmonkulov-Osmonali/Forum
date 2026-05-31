"use client";

import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Filter options ───────────────────────────────────────────────────────────

const FILTERS = [
  { value: "all",    label: "Все регионы"  },
  { value: "na",     label: "Сев. Америка" },
  { value: "europe", label: "Европа"       },
  { value: "asia",   label: "Азия"         },
  { value: "other",  label: "Другие"       },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

// ─── Placeholder student data ─────────────────────────────────────────────────

const PLACEHOLDER_STUDENTS = [
  { initials: "АИ", name: "Алия Исакова",     university: "MIT",              region: "na"     },
  { initials: "БТ", name: "Бакыт Токтобеков", university: "Harvard University",region: "na"     },
  { initials: "ГС", name: "Гулзат Сейткали",  university: "Oxford University", region: "europe" },
  { initials: "ДА", name: "Диана Акылбекова",  university: "ETH Zurich",        region: "europe" },
  { initials: "ЭМ", name: "Эрик Мусаев",       university: "NUS Singapore",     region: "asia"   },
  { initials: "АК", name: "Айгуль Касымова",   university: "Kyoto University",  region: "asia"   },
  { initials: "МБ", name: "Мирлан Бейшенов",   university: "KAIST",             region: "asia"   },
  { initials: "НО", name: "Назгуль Осмонова",  university: "Stanford University",region: "na"    },
  { initials: "СД", name: "Санжар Джумаев",    university: "TU Berlin",         region: "europe" },
  { initials: "ЗА", name: "Зарина Абдуллаева", university: "Sorbonne",          region: "europe" },
  { initials: "КМ", name: "Канат Момунбеков",  university: "Tsinghua University",region: "asia"  },
  { initials: "ИТ", name: "Ирина Токтоматова", university: "Columbia University",region: "na"    },
] as const;

const AVATAR_COLORS = [
  "bg-orange-100 text-orange-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
];

// ─── Filter tab row ───────────────────────────────────────────────────────────

function FilterRow({
  value,
  onChange,
}: {
  value:    FilterValue;
  onChange: (v: FilterValue) => void;
}) {
  return (
    <div className="relative flex overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-slate-200 -mx-4 px-4 sm:mx-0 sm:flex-wrap sm:overflow-x-visible sm:whitespace-normal sm:px-0">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => onChange(f.value)}
          className={cn(
            "relative shrink-0 px-4 py-3 font-sans text-xs font-medium transition-colors duration-150 sm:px-5 sm:py-2.5 sm:text-sm",
            value === f.value
              ? "text-slate-900"
              : "text-slate-400 hover:text-slate-700",
          )}
        >
          {f.label}
          {value === f.value && (
            <motion.div
              layoutId="student-filter-indicator"
              className="absolute inset-x-0 -bottom-px h-0.5 bg-[#ff6b00]"
              transition={{ duration: 0.2, ease: "easeInOut" }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Student card ─────────────────────────────────────────────────────────────

function StudentCard({
  student,
  index,
}: {
  student: (typeof PLACEHOLDER_STUDENTS)[number];
  index:   number;
}) {
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 hover:border-slate-200 hover:bg-white transition-colors duration-150"
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full font-sans text-xs font-bold",
          colorClass,
        )}
      >
        {student.initials}
      </div>
      <div className="min-w-0">
        <p className="truncate font-sans text-xs font-semibold text-slate-900 sm:text-sm">
          {student.name}
        </p>
        <p className="truncate font-sans text-[11px] text-slate-400 sm:text-xs">
          {student.university}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function StudentListPlaceholder() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const filtered = PLACEHOLDER_STUDENTS.filter(
    (s) => activeFilter === "all" || s.region === activeFilter,
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-3 block font-sans text-xs font-medium uppercase tracking-[0.22em] text-[#ff6b00]"
        >
          Студенты
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          {PLACEHOLDER_STUDENTS.length} участников форума
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-2 font-sans text-sm text-slate-500"
        >
          Студенты и выпускники ведущих университетов мира — Северная Америка, Европа и Азия.
        </motion.p>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <LayoutGroup id="student-filters">
          <FilterRow value={activeFilter} onChange={setActiveFilter} />
        </LayoutGroup>
      </motion.div>

      {/* Student grid */}
      <div className="min-h-[200px]">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div
              key="grid"
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((student) => (
                  <StudentCard
                    key={student.name}
                    student={student}
                    index={PLACEHOLDER_STUDENTS.findIndex((s) => s.name === student.name)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50 px-8 py-16 text-center"
            >
              <p className="font-sans text-sm font-medium text-slate-700">
                В этом регионе участники скоро появятся
              </p>
              <p className="mt-1.5 font-sans text-xs text-slate-400">
                Попробуйте другой фильтр
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center font-sans text-xs text-slate-400"
      >
        Полный список участников будет опубликован до начала регистрации
      </motion.p>
    </div>
  );
}
