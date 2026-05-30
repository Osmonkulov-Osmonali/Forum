"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SpeakerImageUpload } from "./SpeakerImageUpload";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SpeakerPayload {
  name:        string;
  position:    string;
  company:     string;
  description: string;
  imageUrl:    string;
  country:     string;
  continent:   string;
  featured:    boolean;
  visible:     boolean;
  sortOrder:   number;
}

export interface Speaker extends SpeakerPayload {
  id:        string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  speaker:  Speaker | null;         // null = "add" mode
  open:     boolean;
  onClose:  () => void;
  onSaved:  (speaker: Speaker) => void;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const CONTINENTS = [
  { value: "",        label: "Не указан"       },
  { value: "na",      label: "Северная Америка" },
  { value: "europe",  label: "Европа"           },
  { value: "asia",    label: "Азия"             },
  { value: "other",   label: "Другое"           },
] as const;

const EMPTY: SpeakerPayload = {
  name: "", position: "", company: "", description: "",
  imageUrl: "", country: "", continent: "",
  featured: false, visible: true, sortOrder: 0,
};

// ── Field helpers ──────────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block font-sans text-xs font-medium uppercase tracking-wide text-[#64748B]">
      {children}
      {required && <span className="ml-0.5 text-red-400">*</span>}
    </label>
  );
}

function Input({
  label, required, id, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean; id: string }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input
        id={id}
        required={required}
        className="
          w-full border border-[#E2E8F0] bg-white px-3 py-2.5
          font-sans text-sm text-[#0F172A] placeholder:text-[#CBD5E1]
          outline-none transition-colors focus:border-[#8ECAE6]
          disabled:opacity-60
        "
        {...props}
      />
    </div>
  );
}

// ── Toggle switch ──────────────────────────────────────────────────────────────

function Toggle({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-[#8ECAE6]" : "bg-[#CBD5E1]"
        )}
      >
        <span
          className={cn(
            "inline-block size-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </button>
      <span className="font-sans text-sm text-[#0F172A]">{label}</span>
    </label>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function SpeakerForm({ speaker, open, onClose, onSaved }: Props) {
  const isEdit = !!speaker;

  const [form,    setForm]    = useState<SpeakerPayload>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Populate form when speaker changes (edit mode)
  useEffect(() => {
    setForm(
      speaker
        ? {
            name:        speaker.name,
            position:    speaker.position,
            company:     speaker.company     ?? "",
            description: speaker.description,
            imageUrl:    speaker.imageUrl,
            country:     speaker.country     ?? "",
            continent:   speaker.continent   ?? "",
            featured:    speaker.featured,
            visible:     speaker.visible,
            sortOrder:   speaker.sortOrder,
          }
        : EMPTY
    );
    setError("");
  }, [speaker, open]);

  function set<K extends keyof SpeakerPayload>(key: K, value: SpeakerPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!form.imageUrl) {
      setError("Загрузите фото спикера.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const url    = isEdit ? `/api/speakers/${speaker!.id}` : "/api/speakers";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Ошибка сохранения."); return; }

      onSaved(data as Speaker);
      onClose();
    } catch {
      setError("Нет соединения.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto rounded-none p-0">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-4">
          <DialogHeader>
            <DialogTitle className="font-sans text-base font-semibold text-[#0F172A]">
              {isEdit ? `Редактировать: ${speaker!.name}` : "Добавить спикера"}
            </DialogTitle>
          </DialogHeader>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="text-[#94A3B8] transition-colors hover:text-[#0F172A]"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-5">

          {/* Photo */}
          <SpeakerImageUpload
            value={form.imageUrl}
            onChange={(url) => set("imageUrl", url)}
            disabled={loading}
          />

          {/* Name + Position */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="sp-name"
              label="Имя"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Айбек Жолдошев"
              disabled={loading}
            />
            <Input
              id="sp-position"
              label="Должность / Статус"
              required
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
              placeholder="Студент MIT"
              disabled={loading}
            />
          </div>

          {/* Company + Country */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="sp-company"
              label="Компания / Университет"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="MIT (опционально)"
              disabled={loading}
            />
            <Input
              id="sp-country"
              label="Страна"
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              placeholder="Кыргызстан"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <Label required>Описание</Label>
            <textarea
              id="sp-description"
              required
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Краткая биография спикера..."
              disabled={loading}
              className="
                w-full resize-y border border-[#E2E8F0] bg-white px-3 py-2.5
                font-sans text-sm text-[#0F172A] placeholder:text-[#CBD5E1]
                outline-none transition-colors focus:border-[#8ECAE6]
                disabled:opacity-60
              "
            />
          </div>

          {/* Continent + Sort order */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Континент</Label>
              <select
                value={form.continent}
                onChange={(e) => set("continent", e.target.value)}
                disabled={loading}
                className="
                  w-full border border-[#E2E8F0] bg-white px-3 py-2.5
                  font-sans text-sm text-[#0F172A]
                  outline-none transition-colors focus:border-[#8ECAE6]
                  disabled:opacity-60
                "
              >
                {CONTINENTS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <Input
              id="sp-sort"
              label="Порядок"
              type="number"
              min={0}
              value={String(form.sortOrder)}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
              placeholder="0"
              disabled={loading}
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3 border-t border-[#E2E8F0] pt-4">
            <Toggle
              checked={form.visible}
              onChange={(v) => set("visible", v)}
              label="Показывать на сайте"
            />
            <Toggle
              checked={form.featured}
              onChange={(v) => set("featured", v)}
              label="Отмечен как избранный"
            />
          </div>

          {/* Error */}
          {error && (
            <p role="alert" className="font-sans text-xs text-red-500">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 border-t border-[#E2E8F0] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                flex h-11 flex-1 items-center justify-center
                border border-[#E2E8F0] bg-white
                font-sans text-sm font-medium text-[#0F172A]
                transition-colors hover:bg-[#F8FAFC]
                disabled:opacity-50
              "
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="
                flex h-11 flex-1 items-center justify-center gap-2
                bg-[#0F172A]
                font-sans text-sm font-medium text-white
                transition-opacity hover:opacity-90
                disabled:opacity-60
              "
            >
              {loading && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
              {isEdit ? "Сохранить" : "Добавить"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
