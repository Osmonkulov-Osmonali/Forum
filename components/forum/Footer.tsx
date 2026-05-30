"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

const SOCIAL = [
  {
    id: "telegram",
    label: "Telegram",
    href: "https://t.me/forum2026",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
        <path d="M11.944 0A12 12 0 1 0 24 12 12 12 0 0 0 11.944 0zm5.992 8.17-2.04 9.608c-.15.67-.54.833-1.093.518l-3.017-2.222-1.456 1.4c-.16.16-.297.295-.61.295l.217-3.075 5.6-5.055c.243-.217-.054-.337-.375-.12L7.36 14.27l-2.97-.927c-.644-.2-.658-.644.135-.953l11.635-4.486c.537-.195 1.007.13.835.952l.001.314z" />
      </svg>
    ),
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://instagram.com/forum2026",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: "https://wa.me/74951234567",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
  {
    id: "email",
    label: "hello@forum2026.ru",
    href: "mailto:hello@forum2026.ru",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-4">
        <rect x="2" y="4" width="20" height="16" rx="1" />
        <path d="m2 7 10 7 10-7" />
      </svg>
    ),
  },
];

const LEGAL = [
  { label: "Политика конфиденциальности", href: "/privacy" },
  { label: "Пользовательское соглашение",  href: "/terms"   },
  { label: "Оферта",                        href: "/offer"   },
];

type FormStatus = "idle" | "loading" | "success" | "error";

export function Footer() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data: { ok?: boolean; message?: string; error?: string } = await res.json();

      if (res.ok && data.ok) {
        setStatus("success");
        setMessage(data.message ?? "Вы успешно подписались!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Что-то пошло не так. Попробуйте снова.");
      }
    } catch {
      setStatus("error");
      setMessage("Нет соединения. Проверьте интернет и попробуйте снова.");
    }
  }

  return (
    <footer className="bg-background-secondary">

      {/* ── Top: newsletter ──────────────────────────────────── */}
      <div className="border-b border-[#E2E8F0] px-4 py-10 md:px-6 md:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div className="max-w-sm">
            <h3 className="mb-2 font-sans text-lg font-semibold tracking-tight text-[#1E293B] sm:text-2xl">
              Оставайтесь в курсе
            </h3>
            <p className="font-sans text-sm leading-relaxed text-muted-foreground">
              Анонсы спикеров, программа и специальные предложения — первыми в вашем&nbsp;inbox.
            </p>
          </div>

          <div className="w-full max-w-md">
            {status === "success" ? (
              <div className="flex items-start gap-3">
                {/* checkmark */}
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-primary/20">
                  <svg viewBox="0 0 12 12" className="size-3 text-accent-primary" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                  </svg>
                </span>
                <p className="font-sans text-sm font-medium text-[#1E293B]">
                  {message}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="your@email.com"
                    aria-label="Email для рассылки"
                    disabled={status === "loading"}
                    className="
                      flex-1 border border-r-0 border-[#E2E8F0] bg-background
                      px-4 py-3 font-sans text-sm text-[#1E293B]
                      placeholder:text-muted-foreground/60
                      outline-none transition-colors duration-150
                      focus:border-accent-primary
                      disabled:opacity-60
                    "
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="
                      flex shrink-0 items-center gap-2 border border-accent-primary
                      bg-transparent px-5 py-3
                      font-sans text-sm font-medium text-[#1E293B]
                      transition-colors duration-200
                      hover:bg-accent-primary
                      disabled:opacity-60 disabled:cursor-not-allowed
                    "
                  >
                    {status === "loading" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <>
                        <span className="hidden sm:inline">Подписаться</span>
                        <Send className="size-3.5" />
                      </>
                    )}
                  </button>
                </div>
                {status === "error" && (
                  <p className="mt-2 font-sans text-xs text-red-500">
                    {message}
                  </p>
                )}
              </form>
            )}
          </div>

        </div>
      </div>

      {/* ── Bottom: nav + legal ──────────────────────────────── */}
      <div className="px-4 py-8 md:px-6 md:py-10 lg:py-12">
        <div className="mx-auto max-w-6xl">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

            {/* Brand */}
            <div>
              <p className="font-sans text-base font-semibold tracking-tight text-[#1E293B]">
                FORUM 2026
              </p>
              <p className="mt-1 font-sans text-xs text-muted-foreground">
                15–16 октября · Бишкек
              </p>
            </div>

            {/* Social links */}
            <nav aria-label="Социальные сети">
              <ul className="flex flex-wrap gap-4">
                {SOCIAL.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.href}
                      target={s.id === "email" ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="
                        inline-flex items-center gap-2
                        font-sans text-sm text-[#1E293B]/60
                        transition-colors duration-150 hover:text-[#1E293B]
                      "
                    >
                      {s.icon}
                      <span className="hidden sm:inline">{s.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

          </div>

          {/* Divider */}
          <div className="my-8 h-px bg-[#E2E8F0]" />

          {/* Copyright + legal */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-sans text-xs text-muted-foreground">
              © {new Date().getFullYear()} FORUM 2026. Все права защищены.
            </p>
            <nav aria-label="Правовые документы">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {LEGAL.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="
                        font-sans text-xs text-muted-foreground
                        underline-offset-2 transition-colors duration-150
                        hover:text-[#1E293B] hover:underline
                      "
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

        </div>
      </div>

    </footer>
  );
}
