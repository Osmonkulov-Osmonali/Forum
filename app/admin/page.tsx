"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Plus, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";

import { SpeakerForm, type Speaker } from "@/components/admin/SpeakerForm";
import { SpeakerTable }             from "@/components/admin/SpeakerTable";
import { DeleteSpeakerDialog }      from "@/components/admin/DeleteSpeakerDialog";

type DialogState =
  | null
  | { mode: "add" }
  | { mode: "edit"; speaker: Speaker }
  | { mode: "delete"; speaker: Speaker };

export default function AdminPage() {
  const router = useRouter();

  const [speakers,   setSpeakers]   = useState<Speaker[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [dialog,     setDialog]     = useState<DialogState>(null);

  // ── Fetch all speakers (including hidden) ─────────────────────────────────────

  const fetchSpeakers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/speakers");
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      if (Array.isArray(data)) setSpeakers(data);
      else toast.error("Не удалось загрузить спикеров.");
    } catch {
      toast.error("Нет соединения с сервером.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchSpeakers(); }, [fetchSpeakers]);

  // ── Logout ────────────────────────────────────────────────────────────────────

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  // ── CRUD helpers ──────────────────────────────────────────────────────────────

  function handleSaved(speaker: Speaker) {
    setSpeakers((prev) => {
      const exists = prev.some((s) => s.id === speaker.id);
      return exists
        ? prev.map((s) => (s.id === speaker.id ? speaker : s))
        : [...prev, speaker];
    });
    toast.success(
      dialog?.mode === "edit"
        ? `«${speaker.name}» обновлён.`
        : `«${speaker.name}» добавлен.`
    );
  }

  function handleDeleted(id: string) {
    const name = speakers.find((s) => s.id === id)?.name ?? "";
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
    toast.success(`«${name}» удалён.`);
  }

  async function handleToggleVisible(s: Speaker) {
    try {
      const res = await fetch(`/api/speakers/${s.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ visible: !s.visible }),
      });
      const updated = await res.json();
      if (!res.ok) { toast.error(updated.error ?? "Ошибка обновления."); return; }
      setSpeakers((prev) => prev.map((sp) => (sp.id === s.id ? updated : sp)));
      toast.success(`«${s.name}» ${!s.visible ? "показан" : "скрыт"}.`);
    } catch {
      toast.error("Нет соединения.");
    }
  }

  async function handleReorder(id: string, dir: "up" | "down") {
    const sorted = [...speakers].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx    = sorted.findIndex((s) => s.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];

    try {
      await Promise.all([
        fetch(`/api/speakers/${a.id}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ sortOrder: b.sortOrder }),
        }),
        fetch(`/api/speakers/${b.id}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ sortOrder: a.sortOrder }),
        }),
      ]);
      setSpeakers((prev) =>
        prev.map((s) => {
          if (s.id === a.id) return { ...s, sortOrder: b.sortOrder };
          if (s.id === b.id) return { ...s, sortOrder: a.sortOrder };
          return s;
        })
      );
    } catch {
      toast.error("Ошибка изменения порядка.");
    }
  }

  // ── Sorted speakers ───────────────────────────────────────────────────────────

  const sorted = [...speakers].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="hidden size-8 items-center justify-center bg-[#0F172A] sm:flex">
              <Users className="size-4 text-[#8ECAE6]" aria-hidden />
            </div>
            <div>
              <p className="font-sans text-xs text-[#94A3B8]">Grant Circle Central Asia</p>
              <h1 className="font-sans text-sm font-semibold text-[#0F172A]">
                Управление спикерами
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchSpeakers}
              disabled={loading}
              aria-label="Обновить"
              title="Обновить список"
              className="
                flex h-9 w-9 items-center justify-center
                border border-[#E2E8F0] bg-white text-[#64748B]
                transition-colors hover:text-[#0F172A]
                disabled:opacity-50
              "
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="
                flex h-9 items-center gap-2 border border-[#E2E8F0] bg-white
                px-3 font-sans text-xs font-medium text-[#64748B]
                transition-colors hover:text-[#0F172A]
              "
            >
              <LogOut className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">

        {/* Section header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-sans text-xl font-semibold text-[#0F172A]">
              Спикеры
              <span className="ml-2 inline-block rounded bg-[#F1F5F9] px-2 py-0.5 font-mono text-xs font-normal text-[#64748B]">
                {speakers.length}
              </span>
            </h2>
            <p className="mt-0.5 font-sans text-sm text-[#64748B]">
              {speakers.filter((s) => s.visible).length} из {speakers.length} видны на сайте
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDialog({ mode: "add" })}
            className="
              flex h-10 min-h-[2.5rem] items-center gap-2
              bg-[#0F172A] px-4
              font-sans text-sm font-medium text-white
              transition-opacity hover:opacity-90
            "
          >
            <Plus className="size-4" aria-hidden />
            Добавить спикера
          </button>
        </div>

        {/* Table card */}
        <div className="border border-[#E2E8F0] bg-white px-4 py-4 sm:px-6">
          <SpeakerTable
            speakers={sorted}
            loading={loading}
            onEdit={(s) => setDialog({ mode: "edit", speaker: s })}
            onDelete={(s) => setDialog({ mode: "delete", speaker: s })}
            onToggleVisible={handleToggleVisible}
            onReorder={handleReorder}
          />
        </div>
      </main>

      {/* Add / Edit dialog */}
      <SpeakerForm
        open={dialog?.mode === "add" || dialog?.mode === "edit"}
        speaker={dialog?.mode === "edit" ? dialog.speaker : null}
        onClose={() => setDialog(null)}
        onSaved={handleSaved}
      />

      {/* Delete dialog */}
      <DeleteSpeakerDialog
        speaker={dialog?.mode === "delete" ? dialog.speaker : null}
        onClose={() => setDialog(null)}
        onDelete={handleDeleted}
      />
    </div>
  );
}
