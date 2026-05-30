"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "О форуме", href: "#about" },
  { label: "Программа", href: "#schedule" },
  { label: "Спикеры", href: "#speakers" },
  { label: "Тарифы", href: "#tickets" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-in-out",
          scrolled || menuOpen
            ? "bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 md:px-6">
          {/* Logo */}
          <a
            href="#"
            onClick={closeMenu}
            className="font-heading text-base font-semibold tracking-tight text-foreground-dark select-none md:text-lg"
          >
            FORUM 2026
          </a>

          {/* Desktop nav */}
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

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* CTA — always visible */}
            <a
              href="#tickets"
              onClick={closeMenu}
              className="inline-flex items-center border border-foreground px-4 py-1.5 text-xs font-medium text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background md:px-5 md:py-2 md:text-sm"
            >
              Купить билет
            </a>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="flex md:hidden items-center justify-center rounded-sm p-1 text-foreground transition-colors"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden border-t border-[#E2E8F0] bg-white/95 backdrop-blur-md md:hidden"
              aria-label="Мобильное меню"
            >
              <ul className="flex flex-col px-4 py-4">
                {NAV_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      onClick={closeMenu}
                      className="flex items-center py-3 text-base font-medium text-foreground transition-colors hover:text-accent-primary"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
