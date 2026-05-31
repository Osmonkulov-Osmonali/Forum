"use client";

import { memo, useCallback, useRef, useState } from "react";
import Image from "next/image";
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

export type Continent = "na" | "europe" | "asia" | "other";

export type Speaker = {
  id:          string;
  name:        string;
  position:    string;
  company?:    string | null;
  description: string;
  imageUrl:    string;
  country?:    string | null;
  continent?:  string | null;
  featured:    boolean;
};

// ─── Filter options ───────────────────────────────────────────────────────────

const CONTINENT_FILTERS: { value: Continent | "all"; label: string }[] = [
  { value: "all",    label: "Все регионы"      },
  { value: "na",     label: "Сев. Америка"     },
  { value: "europe", label: "Европа"           },
  { value: "asia",   label: "Азия"             },
  { value: "other",  label: "Другие"           },
];

const CONTINENT_LABEL: Record<string, string> = {
  na:     "Северная Америка",
  europe: "Европа",
  asia:   "Азия",
  other:  "Другое",
};

// ─── Placeholder photo ────────────────────────────────────────────────────────

const PHOTO_BG = [
  "bg-slate-100", "bg-zinc-100", "bg-stone-100", "bg-slate-200",
  "bg-zinc-200",  "bg-slate-100", "bg-stone-200", "bg-zinc-100",
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
    <div
      className="
        relative flex overflow-x-auto whitespace-nowrap scrollbar-hide
        border-b border-[#E2E8F0]
        -mx-4 px-4
        sm:mx-0 sm:flex-wrap sm:overflow-x-visible sm:whitespace-normal sm:px-0
      "
    >
      {options.map((opt) => (
        <motion.button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          whileTap={{ scale: 0.96 }}
          className={cn(
            "relative shrink-0 px-4 py-3 font-sans text-xs font-medium transition-colors duration-150 sm:px-5 sm:py-2.5 sm:text-sm",
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
        </motion.button>
      ))}
    </div>
  );
}

// ─── Speaker card ─────────────────────────────────────────────────────────────

const SpeakerCard = memo(
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
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        whileTap={{ scale: 0.96 }}
      >
        <button
          type="button"
          onClick={onClick}
          aria-label={`Открыть профиль: ${speaker.name}, ${speaker.position}`}
          className="
            group w-full cursor-pointer bg-background text-left
            transition-colors duration-150
            [@media(hover:hover)]:hover:bg-background-secondary
            active:ring-1 active:ring-accent-secondary/60
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-inset
          "
        >
          {/* Photo */}
          <div className="relative aspect-square w-full overflow-hidden">
            {speaker.imageUrl ? (
              <Image
                src={speaker.imageUrl}
                alt={speaker.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-cover"
              />
            ) : (
              <PlaceholderPhoto index={index} />
            )}
            {/* Featured star */}
            {speaker.featured && (
              <div className="absolute right-2 top-2 flex size-6 items-center justify-center bg-amber-400/90">
                <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5 text-white">
                  <path d="M8 1l1.85 3.74 4.15.6-3 2.93.71 4.13L8 10.5l-3.71 1.9.71-4.13L2 5.34l4.15-.6z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="border-t border-[#E2E8F0] p-3 sm:p-4">
            <p className="font-sans text-xs font-semibold leading-snug text-foreground sm:text-sm">
              {speaker.name}
            </p>
            <p className="mt-0.5 font-sans text-[11px] text-muted-foreground sm:text-xs">
              {speaker.position}
            </p>
            {speaker.company && (
              <p className="mt-0.5 font-sans text-[11px] text-muted-foreground/60 sm:text-xs">
                {speaker.company}
              </p>
            )}
            {speaker.country && (
              <p className="mt-1 font-sans text-[10px] text-muted-foreground/50">
                {speaker.country}
              </p>
            )}
          </div>
        </button>
      </motion.div>
    );
  },
  (prev, next) =>
    prev.speaker.id === next.speaker.id &&
    prev.index      === next.index
);

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-px bg-[#E2E8F0] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-background">
          <div className="aspect-square w-full animate-pulse bg-slate-100" />
          <div className="border-t border-[#E2E8F0] p-3 sm:p-4 space-y-2">
            <div className="h-4 w-28 animate-pulse bg-slate-100" />
            <div className="h-3 w-24 animate-pulse bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  /** Pre-fetched server data — no client-side fetch needed */
  initialSpeakers: Speaker[];
}

export function Speakers({ initialSpeakers }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: "-80px" });

  const [continentFilter, setContinentFilter] = useState<Continent | "all">("all");
  const [selected,        setSelected]        = useState<Speaker | null>(null);

  const filtered = initialSpeakers.filter(
    (s) => continentFilter === "all" || s.continent === continentFilter
  );

  const handleSelect = useCallback((speaker: Speaker) => {
    setSelected(speaker);
  }, []);

  const selectedIndex = selected
    ? initialSpeakers.findIndex((s) => s.id === selected.id)
    : 0;

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
            {initialSpeakers.length > 0
              ? `${initialSpeakers.length} эксперт${declension(initialSpeakers.length)} форума`
              : "Спикеры скоро будут объявлены"}
          </h2>
          <p className="font-sans text-sm text-muted-foreground sm:text-base">
            Студенты и выпускники ведущих университетов мира — Северная Америка, Европа и Азия.
          </p>
        </motion.div>

        {/* ── Filters ── */}
        {initialSpeakers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
            className="mb-6 md:mb-8"
          >
            <LayoutGroup id="speakers-filters">
              <FilterRow
                layoutId="continent-indicator"
                options={CONTINENT_FILTERS}
                value={continentFilter}
                onChange={(v) => setContinentFilter(v)}
              />
            </LayoutGroup>
          </motion.div>
        )}

        {/* ── Grid / Empty state ── */}
        <div className="min-h-[200px]">
          {initialSpeakers.length === 0 ? (
            <SkeletonGrid />
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                <motion.div
                  key="grid"
                  className="grid grid-cols-1 gap-px bg-[#E2E8F0] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  <AnimatePresence mode="popLayout">
                    {filtered.map((speaker) => (
                      <SpeakerCard
                        key={speaker.id}
                        speaker={speaker}
                        index={initialSpeakers.findIndex((s) => s.id === speaker.id)}
                        onClick={() => handleSelect(speaker)}
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
                    В этом регионе спикеры появятся скоро
                  </p>
                  <p className="mt-1.5 font-sans text-xs text-muted-foreground">
                    Попробуйте другой фильтр
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
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

      {/* ── Speaker detail dialog ── */}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
      >
        {selected && (
          <DialogContent className="max-w-sm rounded-none p-0 sm:max-w-md">
            {/* Photo */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F1F5F9]">
              {selected.imageUrl ? (
                <Image
                  src={selected.imageUrl}
                  alt={selected.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 448px"
                  className="object-cover"
                />
              ) : (
                <PlaceholderPhoto index={selectedIndex} large />
              )}
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6">
              <DialogHeader>
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  {selected.featured && (
                    <span className="bg-amber-100 px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide text-amber-700">
                      Избранный
                    </span>
                  )}
                  {selected.continent && (
                    <span className="font-sans text-[10px] text-muted-foreground">
                      {CONTINENT_LABEL[selected.continent] ?? selected.continent}
                    </span>
                  )}
                </div>

                <DialogTitle className="font-sans text-xl font-semibold">
                  {selected.name}
                </DialogTitle>
                <DialogDescription className="font-sans text-sm text-muted-foreground">
                  {selected.position}
                  {selected.company && ` · ${selected.company}`}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-3">
                {selected.country && (
                  <div>
                    <p className="mb-0.5 font-sans text-xs font-medium uppercase tracking-wide text-accent-primary">
                      Страна
                    </p>
                    <p className="font-sans text-sm text-foreground">{selected.country}</p>
                  </div>
                )}
                {selected.company && (
                  <div>
                    <p className="mb-0.5 font-sans text-xs font-medium uppercase tracking-wide text-accent-primary">
                      Организация
                    </p>
                    <p className="font-sans text-sm text-foreground">{selected.company}</p>
                  </div>
                )}
                <div>
                  <p className="mb-0.5 font-sans text-xs font-medium uppercase tracking-wide text-accent-primary">
                    О спикере
                  </p>
                  <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                    {selected.description || "Информация о спикере будет опубликована ближе к дате события."}
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function declension(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return "а";
  return "ов";
}
