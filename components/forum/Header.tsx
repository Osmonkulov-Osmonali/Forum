"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { TICKETON_REGISTRATION_URL } from "@/config/links";

const NAV_LINKS = [
  { label: "О событии",   href: "#about" },
  { label: "Спикеры",    href: "#speakers" },
  { label: "Программа",  href: "#schedule" },
  { label: "Билеты",     href: "#tickets" },
];

const MOBILE_NAV_ID = "mobile-nav";

/* ──────────────────────────────────────────────────────────────────────────
   Mobile drawer animation — slides down from the top with a soft spring,
   then staggers the links/CTA into view.
   ────────────────────────────────────────────────────────────────────────── */

const drawerVariants: Variants = {
  hidden: { y: "-100%" },
  visible: {
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      staggerChildren: 0.07,
      delayChildren: 0.12,
    },
  },
  exit: {
    y: "-100%",
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

const drawerItemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 22 },
  },
};

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

  // Lock background scroll while the full-screen mobile drawer is open
  useEffect(() => {
    if (!menuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [menuOpen]);

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
            aria-label="Study free forum — главная"
          >
            Study free forum
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
            {/* CTA — external Ticketon registration, hidden on xs, shown sm+ */}
            <motion.a
              href={TICKETON_REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.96 }}
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
            </motion.a>

            {/* Hamburger — mobile only */}
            <motion.button
              type="button"
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={menuOpen}
              aria-controls={MOBILE_NAV_ID}
              onClick={() => setMenuOpen((o) => !o)}
              whileTap={{ scale: 0.96 }}
              className="
                flex md:hidden items-center justify-center rounded-sm p-2 text-foreground
                transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2
              "
            >
              {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </motion.button>
          </div>
        </div>

      </header>

      {/* Mobile drawer — slides down from the top on a soft spring */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id={MOBILE_NAV_ID}
            key="mobile-menu"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="
              fixed inset-x-0 top-0 z-40 flex h-[100dvh] flex-col
              bg-white/98 px-4 pb-10 pt-20 backdrop-blur-xl md:hidden
            "
            aria-label="Мобильное меню"
          >
            <ul className="flex flex-col" role="list">
              {NAV_LINKS.map(({ label, href }) => (
                <motion.li key={href} variants={drawerItemVariants}>
                  <motion.a
                    href={href}
                    onClick={handleNavClick}
                    whileTap={{ scale: 0.96 }}
                    className="
                      flex min-h-14 items-center border-b border-[#E2E8F0]/70 py-3
                      font-heading text-2xl font-semibold tracking-tight text-foreground-dark
                      transition-colors
                      [@media(hover:hover)]:hover:text-accent-primary
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:rounded-sm
                    "
                  >
                    {label}
                  </motion.a>
                </motion.li>
              ))}
            </ul>

            {/* CTA pinned to the bottom of the drawer */}
            <motion.a
              variants={drawerItemVariants}
              href={TICKETON_REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleNavClick}
              whileTap={{ scale: 0.96 }}
              className="
                mt-auto inline-flex min-h-14 w-full items-center justify-center gap-2
                rounded-full bg-[#0F172A] px-6 text-base font-semibold text-white
                shadow-[0_18px_40px_-18px_rgba(15,23,42,0.55)]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2
              "
            >
              Регистрация
            </motion.a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
