"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView, LayoutGroup } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage  = "applying" | "admitted" | "studying" | "working";
type Region = "na" | "europe" | "asia";

type Speaker = {
  id:          string;
  name:        string;
  stage:       Stage;
  region:      Region;
  university:  string;
  company?:    string;
  imageUrl:    string;
};

// ─── Filter options ───────────────────────────────────────────────────────────

const STAGE_FILTERS: { value: Stage | "all"; label: string }[] = [
  { value: "all",      label: "Все этапы" },
  { value: "applying", label: "Поступает" },
  { value: "admitted", label: "Поступил" },
  { value: "studying", label: "Учится" },
  { value: "working",  label: "Окончил и работает" },
];

const REGION_FILTERS: { value: Region | "all"; label: string }[] = [
  { value: "all",    label: "Все регионы" },
  { value: "na",     label: "Северная Америка" },
  { value: "europe", label: "Европа" },
  { value: "asia",   label: "Азия" },
];

// ─── Stage meta ───────────────────────────────────────────────────────────────

const STAGE_LABEL: Record<Stage, string> = {
  applying: "Поступает",
  admitted: "Поступил",
  studying: "Учится",
  working:  "Работает",
};

const STAGE_STYLE: Record<Stage, string> = {
  applying: "bg-[#E0F2FE] text-[#0369A1]",
  admitted: "bg-[#DCFCE7] text-[#166534]",
  studying: "bg-accent-secondary/20 text-accent-primary",
  working:  "bg-[#EDE9FE] text-[#5B21B6]",
};

// ─── Placeholder speakers (12) ─────────────────────────────────────────────────
// 4 North America · 4 Europe · 4 Asia — each with all four stages

const speakers: Speaker[] = [
  // ── North America ──────────────────────────────────────────────────────────
  {
    id: "na-1", name: "Спикер 1",  stage: "studying",  region: "na",
    university: "Harvard University",
    imageUrl: "",
  },
  {
    id: "na-2", name: "Спикер 2",  stage: "working",   region: "na",
    university: "MIT",   company: "Google",
    imageUrl: "",
  },
  {
    id: "na-3", name: "Спикер 3",  stage: "admitted",  region: "na",
    university: "Yale University",
    imageUrl: "",
  },
  {
    id: "na-4", name: "Спикер 4",  stage: "applying",  region: "na",
    university: "Princeton University",
    imageUrl: "",
  },

  // ── Europe ─────────────────────────────────────────────────────────────────
  {
    id: "eu-1", name: "Спикер 5",  stage: "studying",  region: "europe",
    university: "University of Oxford",
    imageUrl: "",
  },
  {
    id: "eu-2", name: "Спикер 6",  stage: "working",   region: "europe",
    university: "ETH Zurich",  company: "McKinsey",
    imageUrl: "",
  },
  {
    id: "eu-3", name: "Спикер 7",  stage: "admitted",  region: "europe",
    university: "University of Cambridge",
    imageUrl: "",
  },
  {
    id: "eu-4", name: "Спикер 8",  stage: "applying",  region: "europe",
    university: "TU Munich",
    imageUrl: "",
  },

  // ── Asia ───────────────────────────────────────────────────────────────────
  {
    id: "as-1", name: "Спикер 9",  stage: "studying",  region: "asia",
    university: "NUS Singapore",
    imageUrl: "",
  },
  {
    id: "as-2", name: "Спикер 10", stage: "working",   region: "asia",
    university: "Tsinghua University",  company: "Alibaba",
    imageUrl: "",
  },
  {
    id: "as-3", name: "Спикер 11", stage: "admitted",  region: "asia",
    university: "Seoul National University",
    imageUrl: "",
  },
  {
    id: "as-4", name: "Спикер 12", stage: "applying",  region: "asia",
    university: "University of Tokyo",
    imageUrl: "",
  },
];

// ─── Placeholder photo ────────────────────────────────────────────────────────

const PHOTO_BG = [
  "bg-slate-100", "bg-zinc-100", "bg-stone-100", "bg-slate-200",
  "bg-zinc-200",  "bg-slate-100", "bg-stone-200", "bg-zinc-100",
  "bg-slate-200", "bg-stone-100", "bg-zinc-200",  "bg-slate-100",
];

function PlaceholderPhoto({ index, large }: { index: number; large?: boolean }) {
  return (
    <div className={cn("size-full flex items-center justify-center", PHOTO_BG[index % PHOTO_BG.length])}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className={cn(large ? "size-14" : "size-10", "text-slate-400 opacity-50")}
      >
        <circle cx="24" cy="17" r="8" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// ─── Filter tab row ───────────────────────────────────────────────────────────

function FilterRow<T extends string>({
  layoutId,
  options,
  value,
  onChange,
}: {
  layoutId: string;
  options:  { value: T; label: string }[];
  value:    T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-0 border-b border-[#E2E8F0]">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "relative px-4 py-2.5 font-sans text-xs font-medium transition-colors duration-150 sm:px-5 sm:text-sm",
            value === opt.value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
          {value === opt.value && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-x-0 -bottom-px h-0.5 bg-accent-secondary"
              transition={{ duration: 0.2, ease: "easeInOut" }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Speaker card ─────────────────────────────────────────────────────────────

function SpeakerCard({
  speaker,
  index,
  onClick,
}: {
  speaker: Speaker;
  index:   number;
  onClick: () => void;
}) {
  return (
    <motion.div
      layout
      key={speaker.id}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <button
        type="button"
        onClick={onClick}
        className="group w-full cursor-pointer bg-background text-left transition-colors duration-150 hover:bg-background-secondary"
      >
        {/* Photo */}
        <div className="aspect-square w-full overflow-hidden">
          {speaker.imageUrl ? (
            <img
              src={speaker.imageUrl}
              alt={speaker.name}
              className="size-full object-cover"
            />
          ) : (
            <PlaceholderPhoto index={index} />
          )}
        </div>

        {/* Info */}
        <div className="border-t border-[#E2E8F0] p-3 sm:p-4">
          {/* Stage badge */}
          <span
            className={cn(
              "mb-2 inline-block font-sans text-[10px] font-medium uppercase tracking-wide px-2 py-0.5",
              STAGE_STYLE[speaker.stage]
            )}
          >
            {STAGE_LABEL[speaker.stage]}
          </span>

          <p className="font-sans text-xs font-semibold leading-snug text-foreground sm:text-sm">
            {speaker.name}
          </p>
          <p className="mt-0.5 font-sans text-[11px] text-muted-foreground sm:text-xs">
            {speaker.university}
          </p>
          {speaker.company && (
            <p className="mt-0.5 font-sans text-[11px] text-muted-foreground/60 sm:text-xs">
              {speaker.company}
            </p>
          )}
        </div>
      </button>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Speakers() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: "-80px" });

  const [stageFilter,  setStageFilter]  = useState<Stage  | "all">("all");
  const [regionFilter, setRegionFilter] = useState<Region | "all">("all");
  const [selected,     setSelected]     = useState<Speaker | null>(null);

  const filtered = speakers.filter((s) => {
    const stageOk  = stageFilter  === "all" || s.stage  === stageFilter;
    const regionOk = regionFilter === "all" || s.region === regionFilter;
    return stageOk && regionOk;
  });

  const selectedIndex = selected ? speakers.findIndex((s) => s.id === selected.id) : 0;

  return (
    <section
      id="speakers"
      ref={sectionRef}
      className="bg-background px-4 py-12 md:px-8 md:py-24 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-8 md:mb-12"
        >
          <span className="mb-4 block font-sans text-sm font-medium uppercase tracking-[0.2em] text-accent-primary">
            Спикеры
          </span>
          <h2 className="mb-3 font-sans text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-5xl">
            12 экспертов по поступлению
          </h2>
          <p className="font-sans text-sm text-muted-foreground sm:text-base">
            Студенты и выпускники ведущих университетов мира — Северная Америка, Европа и Азия.
          </p>
        </motion.div>

        {/* ── Filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
          className="mb-6 space-y-0 md:mb-8"
        >
          <LayoutGroup id="speakers-filters">
            {/* Stage filter */}
            <FilterRow
              layoutId="stage-indicator"
              options={STAGE_FILTERS}
              value={stageFilter}
              onChange={(v) => setStageFilter(v)}
            />
            {/* Region filter */}
            <FilterRow
              layoutId="region-indicator"
              options={REGION_FILTERS}
              value={regionFilter}
              onChange={(v) => setRegionFilter(v)}
            />
          </LayoutGroup>
        </motion.div>

        {/* ── Grid / Empty state ── */}
        <div className="min-h-[200px]">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div
                key="grid"
                className="grid grid-cols-2 gap-px bg-[#E2E8F0] sm:grid-cols-3 lg:grid-cols-4"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((speaker, i) => (
                    <SpeakerCard
                      key={speaker.id}
                      speaker={speaker}
                      index={speakers.findIndex((s) => s.id === speaker.id)}
                      onClick={() => setSelected(speaker)}
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
                className="flex flex-col items-center justify-center border border-[#E2E8F0] bg-background-secondary px-8 py-16 text-center"
              >
                <div className="mb-3 text-2xl">🔎</div>
                <p className="font-sans text-sm font-medium text-foreground">
                  В этой категории спикеры появятся совсем скоро
                </p>
                <p className="mt-1.5 font-sans text-xs text-muted-foreground">
                  Попробуйте другую комбинацию фильтров
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer note ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="mt-6 text-center font-sans text-xs text-muted-foreground/60 sm:text-sm"
        >
          Полный список спикеров будет объявлен до начала регистрации
        </motion.p>
      </div>

      {/* ── Speaker dialog ── */}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
      >
        {selected && (
          <DialogContent className="max-w-sm rounded-none p-0 sm:max-w-md">
            {/* Photo */}
            <div className="aspect-[4/3] w-full overflow-hidden">
              {selected.imageUrl ? (
                <img
                  src={selected.imageUrl}
                  alt={selected.name}
                  className="size-full object-cover"
                />
              ) : (
                <PlaceholderPhoto index={selectedIndex} large />
              )}
            </div>

            <div className="p-5 sm:p-6">
              <DialogHeader>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "font-sans text-[10px] font-medium uppercase tracking-wide px-2 py-0.5",
                      STAGE_STYLE[selected.stage]
                    )}
                  >
                    {STAGE_LABEL[selected.stage]}
                  </span>
                  <span className="font-sans text-[10px] text-muted-foreground">
                    {REGION_FILTERS.find((r) => r.value === selected.region)?.label}
                  </span>
                </div>
                <DialogTitle className="font-sans text-xl font-semibold">
                  {selected.name}
                </DialogTitle>
                <DialogDescription className="font-sans text-sm text-muted-foreground">
                  {selected.university}
                  {selected.company && ` · ${selected.company}`}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="mb-1 font-sans text-xs font-medium uppercase tracking-wide text-accent-primary">
                    Университет
                  </p>
                  <p className="font-sans text-sm text-foreground">{selected.university}</p>
                </div>
                {selected.company && (
                  <div>
                    <p className="mb-1 font-sans text-xs font-medium uppercase tracking-wide text-accent-primary">
                      Место работы
                    </p>
                    <p className="font-sans text-sm text-foreground">{selected.company}</p>
                  </div>
                )}
                <div>
                  <p className="mb-1 font-sans text-xs font-medium uppercase tracking-wide text-accent-primary">
                    О спикере
                  </p>
                  <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                    Информация о спикере будет опубликована ближе к дате события.
                    Следите за анонсами.
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
