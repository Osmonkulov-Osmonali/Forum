"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit2, Trash2, Eye, EyeOff, Loader2, Star, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Speaker } from "./SpeakerForm";

const CONTINENT_LABEL: Record<string, string> = {
  na:     "Сев. Америка",
  europe: "Европа",
  asia:   "Азия",
  other:  "Другое",
};

interface Props {
  speakers:  Speaker[];
  loading:   boolean;
  onEdit:    (s: Speaker) => void;
  onDelete:  (s: Speaker) => void;
  onToggleVisible: (s: Speaker) => Promise<void>;
  onReorder: (id: string, dir: "up" | "down") => Promise<void>;
}

export function SpeakerTable({
  speakers, loading, onEdit, onDelete, onToggleVisible, onReorder,
}: Props) {
  const [togglingId,   setTogglingId]   = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  async function handleToggle(s: Speaker) {
    setTogglingId(s.id);
    await onToggleVisible(s);
    setTogglingId(null);
  }

  async function handleReorder(s: Speaker, dir: "up" | "down") {
    setReorderingId(s.id);
    await onReorder(s.id, dir);
    setReorderingId(null);
  }

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <TableHead />
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[#F1F5F9]">
                {[40, 160, 120, 80, 60, 80].map((w, j) => (
                  <td key={j} className="py-3 pr-4 first:pl-0">
                    <div
                      className="h-4 animate-pulse rounded bg-[#F1F5F9]"
                      style={{ width: w }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (speakers.length === 0) {
    return (
      <div className="border border-dashed border-[#E2E8F0] px-8 py-14 text-center">
        <p className="font-sans text-sm text-[#64748B]">
          Спикеры ещё не добавлены. Нажмите «Добавить спикера», чтобы начать.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse">
        <thead>
          <TableHead />
        </thead>
        <tbody>
          {speakers.map((s, idx) => (
            <tr
              key={s.id}
              className="border-b border-[#F1F5F9] transition-colors hover:bg-[#FAFAFA]"
            >
              {/* Sort arrows */}
              <td className="py-3 pr-2 pl-0">
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => handleReorder(s, "up")}
                    disabled={idx === 0 || reorderingId === s.id}
                    aria-label="Переместить выше"
                    className="text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-20"
                  >
                    <ChevronUp className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(s, "down")}
                    disabled={idx === speakers.length - 1 || reorderingId === s.id}
                    aria-label="Переместить ниже"
                    className="text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-20"
                  >
                    <ChevronDown className="size-4" aria-hidden />
                  </button>
                </div>
              </td>

              {/* Photo */}
              <td className="py-3 pr-4">
                <div className="relative size-10 overflow-hidden bg-[#F1F5F9]">
                  {s.imageUrl ? (
                    <Image
                      src={s.imageUrl}
                      alt={s.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-[#94A3B8]">
                      <span className="text-xs font-semibold">
                        {s.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </td>

              {/* Name + position */}
              <td className="py-3 pr-4">
                <div className="flex items-center gap-1.5">
                  <p className="font-sans text-sm font-medium text-[#0F172A]">{s.name}</p>
                  {s.featured && (
                    <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="Избранный" />
                  )}
                </div>
                <p className="font-sans text-xs text-[#94A3B8]">{s.position}</p>
              </td>

              {/* Country */}
              <td className="py-3 pr-4">
                <p className="font-sans text-sm text-[#64748B]">
                  {s.country || "—"}
                </p>
              </td>

              {/* Continent badge */}
              <td className="hidden py-3 pr-4 sm:table-cell">
                {s.continent ? (
                  <span className="inline-block bg-[#F1F5F9] px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide text-[#64748B]">
                    {CONTINENT_LABEL[s.continent] ?? s.continent}
                  </span>
                ) : (
                  <span className="text-[#CBD5E1]">—</span>
                )}
              </td>

              {/* Visible toggle */}
              <td className="py-3 pr-4">
                <button
                  type="button"
                  onClick={() => handleToggle(s)}
                  disabled={togglingId === s.id}
                  aria-label={s.visible ? "Скрыть" : "Показать"}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 font-sans text-xs font-medium transition-colors",
                    s.visible
                      ? "bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]"
                      : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                  )}
                >
                  {togglingId === s.id ? (
                    <Loader2 className="size-3 animate-spin" aria-hidden />
                  ) : s.visible ? (
                    <Eye className="size-3" aria-hidden />
                  ) : (
                    <EyeOff className="size-3" aria-hidden />
                  )}
                  {s.visible ? "Виден" : "Скрыт"}
                </button>
              </td>

              {/* Sort order badge */}
              <td className="hidden py-3 pr-4 md:table-cell">
                <span className="font-mono text-xs text-[#94A3B8]">
                  #{s.sortOrder}
                </span>
              </td>

              {/* Actions */}
              <td className="py-3 text-right">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(s)}
                    aria-label={`Редактировать: ${s.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                  >
                    <Edit2 className="size-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(s)}
                    aria-label={`Удалить: ${s.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center text-[#64748B] transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableHead() {
  return (
    <tr className="border-b border-[#E2E8F0]">
      {[
        { label: "",           cls: "w-8" },
        { label: "Фото",       cls: "" },
        { label: "Имя",        cls: "" },
        { label: "Страна",     cls: "" },
        { label: "Континент",  cls: "hidden sm:table-cell" },
        { label: "Видимость",  cls: "" },
        { label: "Порядок",    cls: "hidden md:table-cell" },
        { label: "",           cls: "" },
      ].map((col, i) => (
        <th
          key={i}
          className={cn(
            "py-2.5 pr-4 text-left font-sans text-xs font-medium uppercase tracking-wide text-[#64748B] first:pl-0",
            col.cls
          )}
        >
          {col.label}
        </th>
      ))}
    </tr>
  );
}
