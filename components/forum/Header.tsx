"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "О событии",   href: "#about" },
  { label: "Спикеры",    href: "#speakers" },
  { label: "Программа",  href: "#schedule" },
  { label: "Билеты",     href: "#tickets" },
  { label: "Команда",    href: "#team" },
];

const MOBILE_NAV_ID = "mobile-nav";

export function Header() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close menu and let the browser follow the anchor
  function handleNavClick() {
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

          {/* Logo — href="/" so screen readers announce it as "home" */}
          <a
            href="/"
            onClick={handleNavClick}
            className="
              font-heading text-base font-semibold tracking-tight text-foreground-dark select-none
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2
              md:text-lg
            "
            aria-label="Grant Circle Central Asia — главная"
          >
            Grant Circle Central Asia
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Основная навигация">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="
                  text-sm font-medium text-muted-foreground transition-colors duration-200
                  [@media(hover:hover)]:hover:text-foreground
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:rounded-sm
                "
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* CTA — hidden on xs, shown sm+ */}
            <a
              href="#registration"
              onClick={handleNavClick}
              className="
                hidden sm:inline-flex items-center
                border border-foreground px-4 py-1.5 text-xs font-medium text-foreground
                transition-colors duration-200
                [@media(hover:hover)]:hover:bg-foreground [@media(hover:hover)]:hover:text-background
                active:bg-foreground active:text-background
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2
                md:px-5 md:py-2 md:text-sm
              "
            >
              Регистрация
            </a>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={menuOpen}
              aria-controls={MOBILE_NAV_ID}
              onClick={() => setMenuOpen((o) => !o)}
              className="
                flex md:hidden items-center justify-center rounded-sm p-2 text-foreground
                transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2
              "
            >
              {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              id={MOBILE_NAV_ID}
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden border-t border-[#E2E8F0] bg-white/95 backdrop-blur-md md:hidden"
              aria-label="Мобильное меню"
            >
              <ul className="flex flex-col px-4 py-4" role="list">
                {NAV_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      onClick={handleNavClick}
                      className="
                        flex min-h-12 items-center py-3 text-base font-medium text-foreground
                        transition-colors
                        [@media(hover:hover)]:hover:text-accent-primary
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:rounded-sm
                      "
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
