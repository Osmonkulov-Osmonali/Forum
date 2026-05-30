"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Speaker {
  id:   string;
  name: string;
}

interface Props {
  speaker:  Speaker | null;
  onClose:  () => void;
  onDelete: (id: string) => void;
}

export function DeleteSpeakerDialog({ speaker, onClose, onDelete }: Props) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleDelete() {
    if (!speaker || loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/speakers/${speaker.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Ошибка удаления.");
        return;
      }
      onDelete(speaker.id);
      onClose();
    } catch {
      setError("Нет соединения.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={!!speaker} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-none p-0">
        <div className="p-6">
          <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="size-5 text-red-500" aria-hidden />
          </div>

          <DialogHeader>
            <DialogTitle className="font-sans text-lg font-semibold text-[#0F172A]">
              Удалить спикера?
            </DialogTitle>
            <DialogDescription className="mt-1 font-sans text-sm text-[#64748B]">
              <span className="font-medium text-[#0F172A]">{speaker?.name}</span> будет
              безвозвратно удалён из базы данных. Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <p className="mt-3 font-sans text-xs text-red-500">{error}</p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                flex h-10 flex-1 items-center justify-center
                border border-[#E2E8F0] bg-white
                font-sans text-sm font-medium text-[#0F172A]
                transition-colors hover:bg-[#F8FAFC]
                disabled:opacity-50
              "
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="
                flex h-10 flex-1 items-center justify-center gap-2
                bg-red-600
                font-sans text-sm font-medium text-white
                transition-opacity hover:bg-red-700
                disabled:opacity-60
              "
            >
              {loading && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
              Удалить
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
