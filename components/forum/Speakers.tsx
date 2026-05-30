"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Speaker = {
  id: number;
  name: string;
  role: string;
  university: string;
  topic: string;
  bio: string;
};

const speakers: Speaker[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Спикер ${i + 1}`,
  role: "Студент топового университета мира",
  university: "Скоро",
  topic: "Тема выступления будет объявлена",
  bio: "Информация о спикере будет опубликована ближе к дате события. Следите за анонсами — каждый из 12 спикеров является студентом или выпускником одного из ведущих университетов мира.",
}));

// Slightly varied placeholder shades for visual rhythm
const PLACEHOLDER_SHADES = [
  "bg-slate-200",
  "bg-slate-150",
  "bg-zinc-200",
  "bg-slate-200",
  "bg-stone-200",
  "bg-slate-200",
  "bg-zinc-150",
  "bg-slate-200",
  "bg-stone-150",
  "bg-slate-200",
  "bg-zinc-200",
  "bg-slate-200",
];

function PlaceholderPhoto({ index }: { index: number }) {
  const shade = PLACEHOLDER_SHADES[index % PLACEHOLDER_SHADES.length];
  return (
    <div className={`size-full ${shade} flex items-center justify-center`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-10 text-slate-400 opacity-60"
      >
        <circle cx="24" cy="17" r="8" stroke="currentColor" strokeWidth="2" />
        <path
          d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function Speakers() {
  const [selected, setSelected] = useState<Speaker | null>(null);

  return (
    <section id="speakers" className="bg-background px-4 py-12 md:px-8 md:py-24 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 md:mb-12 lg:mb-16">
          <span className="mb-4 block text-sm font-medium uppercase tracking-wider text-accent-primary">
            Спикеры
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-5xl">
            12 экспертов по поступлению
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Студенты и выпускники MIT, Oxford, ETH Zurich, NUS и других
            университетов мирового класса. Список будет объявлен скоро.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-4">
          {speakers.map((speaker, i) => (
            <button
              key={speaker.id}
              type="button"
              onClick={() => setSelected(speaker)}
              className="group cursor-pointer bg-background text-left transition-colors hover:bg-background-secondary"
            >
              <div className="aspect-square overflow-hidden">
                <PlaceholderPhoto index={i} />
              </div>
              <div className="border-t border-border p-3 sm:p-4">
                <h3 className="mb-0.5 text-xs font-semibold text-muted-foreground sm:text-sm">
                  {speaker.name}
                </h3>
                <p className="text-[11px] text-muted-foreground/70 sm:text-xs">
                  {speaker.role}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Скоро */}
        <p className="mt-8 text-center text-xs text-muted-foreground/60 sm:text-sm">
          Полный список спикеров будет объявлен до начала регистрации
        </p>
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        {selected && (
          <DialogContent className="max-w-sm rounded-none sm:max-w-md">
            <div className="aspect-square overflow-hidden">
              <PlaceholderPhoto index={selected.id - 1} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {selected.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {selected.role}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-accent-primary">
                  Тема
                </p>
                <p className="text-sm text-foreground">{selected.topic}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-accent-primary">
                  О спикере
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {selected.bio}
                </p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
