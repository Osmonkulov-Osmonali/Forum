"use client";

import { GraduationCap, MapPin, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { AppStudent } from "@/components/forum/appStudents";

interface StudentBottomSheetProps {
  student: AppStudent | null;
  open: boolean;
  onClose: () => void;
}

export function StudentBottomSheet({ student, open, onClose }: StudentBottomSheetProps) {
  return (
    <AnimatePresence>
      {open && student && (
        <>
          <motion.button
            type="button"
            aria-label="Закрыть карточку студента"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#0F172A]/25 sm:hidden"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-sheet-name"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="
              fixed bottom-0 left-0 right-0 z-50
              rounded-t-3xl bg-white p-5 pb-8 shadow-2xl
              sm:hidden
            "
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />

            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={student.avatarUrl}
                  alt=""
                  className="size-20 shrink-0 rounded-full border border-slate-200 bg-slate-50 object-cover"
                />
                <div className="min-w-0">
                  <h3
                    id="student-sheet-name"
                    className="font-heading text-xl font-semibold text-[#0F172A]"
                  >
                    {student.name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-[#3B6E8F]">
                    <GraduationCap className="size-4 shrink-0" />
                    <span className="truncate">{student.university}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="size-3.5 shrink-0 text-[#8ECAE6]" />
                    {student.city}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
                className="
                  flex size-9 shrink-0 items-center justify-center rounded-full
                  border border-slate-200 bg-slate-50 text-slate-600
                  transition-colors hover:bg-slate-100
                "
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-pretty text-sm leading-relaxed text-slate-600">
              {student.message}
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
