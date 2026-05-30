"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";

interface Props {
  value:    string;               // current imageUrl (persisted URL)
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function SpeakerImageUpload({ value, onChange, disabled }: Props) {
  const inputRef     = useRef<HTMLInputElement>(null);
  const localBlobRef = useRef<string>("");

  const [localPreview, setLocalPreview] = useState<string>("");
  const [uploading,    setUploading]    = useState(false);
  const [uploadError,  setUploadError]  = useState("");

  // Revoke local blob URL on unmount
  useEffect(() => {
    return () => {
      if (localBlobRef.current) URL.revokeObjectURL(localBlobRef.current);
    };
  }, []);

  const displayUrl = localPreview || value;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");

    // Revoke previous local preview
    if (localBlobRef.current) {
      URL.revokeObjectURL(localBlobRef.current);
    }
    const blobUrl = URL.createObjectURL(file);
    localBlobRef.current = blobUrl;
    setLocalPreview(blobUrl);

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error ?? "Ошибка загрузки.");
        setLocalPreview("");
        return;
      }

      // Swap blob preview for the real CDN URL
      onChange(data.url);
      URL.revokeObjectURL(blobUrl);
      localBlobRef.current = "";
      setLocalPreview("");
    } catch {
      setUploadError("Ошибка сети при загрузке фото.");
      setLocalPreview("");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    if (localBlobRef.current) {
      URL.revokeObjectURL(localBlobRef.current);
      localBlobRef.current = "";
    }
    setLocalPreview("");
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-1.5">
      <p className="font-sans text-xs font-medium uppercase tracking-wide text-[#64748B]">
        Фото <span className="text-red-400">*</span>
      </p>

      {/* Drop zone */}
      <div
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        className="
          group relative flex cursor-pointer items-center gap-4
          border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4
          transition-colors
          hover:border-[#8ECAE6] hover:bg-[#F0F9FF]
          data-[has-image=true]:border-[#8ECAE6]
        "
        data-has-image={!!displayUrl}
        aria-label="Загрузить фото"
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        {/* Preview or placeholder */}
        <div className="relative size-20 shrink-0 overflow-hidden bg-[#E2E8F0]">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Превью"
              fill
              className="object-cover"
              sizes="80px"
              unoptimized={displayUrl.startsWith("blob:")}
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageIcon className="size-8 text-[#94A3B8]" />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="size-5 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm font-medium text-[#0F172A]">
            {uploading ? "Загрузка…" : displayUrl ? "Сменить фото" : "Выберите файл"}
          </p>
          <p className="mt-0.5 font-sans text-xs text-[#64748B]">
            JPEG, PNG, WebP — до 4 МБ
          </p>
        </div>

        <Upload className="size-4 shrink-0 text-[#94A3B8] group-hover:text-[#8ECAE6]" aria-hidden />

        {/* Clear button */}
        {displayUrl && !uploading && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Удалить фото"
            className="
              absolute right-2 top-2 flex size-5 items-center justify-center
              rounded-full bg-[#1E293B]/60 text-white
              transition-opacity hover:bg-[#1E293B]
            "
          >
            <X className="size-3" aria-hidden />
          </button>
        )}
      </div>

      {uploadError && (
        <p className="font-sans text-xs text-red-500">{uploadError}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />
    </div>
  );
}
