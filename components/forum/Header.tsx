"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "О форуме", href: "#about" },
  { label: "Программа", href: "#schedule" },
  { label: "Спикеры", href: "#speakers" },
  { label: "Тарифы", href: "#tickets" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-in-out",
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Forum name — Geist Sans via font-heading */}
        <a
          href="#"
          className="font-heading text-lg font-semibold tracking-tight text-foreground-dark select-none"
        >
          FORUM 2026
        </a>

        {/* Anchor navigation — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Разделы">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA — outline / transparent */}
        <a
          href="#tickets"
          className="hidden md:inline-flex items-center border border-foreground px-5 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
        >
          Купить билет
        </a>

        {/* Hamburger placeholder for mobile */}
        <button
          type="button"
          aria-label="Меню"
          className="flex md:hidden flex-col items-center justify-center gap-1.5 p-1"
        >
          <span className="h-px w-6 bg-foreground block" />
          <span className="h-px w-6 bg-foreground block" />
          <span className="h-px w-4 bg-foreground block self-start" />
        </button>
      </div>
    </header>
  );
}
