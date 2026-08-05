"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SelectorIdioma } from "@/components/layout/selector-idioma";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#acceso",     label: "navAccess" },
  { href: "#labor",      label: "navWork" },
  { href: "#patrocinio", label: "navSponsors" },
  { href: "#eventos",    label: "navEventos" },
  { href: "#faq",        label: "navFaq" },
] as const;

export function Navbar() {
  const t = useTranslations("landing");
  const [open, setOpen]         = useState(false);
  const [active, setActive]     = useState("");
  const [scrolled, setScrolled] = useState(false);

  /* Compact on scroll */
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  /* Active section via IntersectionObserver */
  useEffect(() => {
    const els = NAV_LINKS
      .map((l) => document.querySelector<Element>(l.href))
      .filter(Boolean) as Element[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(`#${hit.target.id}`);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.5] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/8 bg-[#080c14]/90 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6 lg:h-[72px]">

        {/* Logo */}
        <Link
          href="/"
          aria-label="Global Effect"
          className="flex shrink-0 items-center gap-2.5 group"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#6C3EF4]/20 border border-[#6C3EF4]/40 text-white font-bold text-lg tracking-tight transition-all duration-200 group-hover:bg-[#6C3EF4]/35">
            G
          </span>
          <span className="hidden text-sm font-semibold text-white/90 sm:block tracking-wide">
            Global Effect
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              aria-current={active === href ? "true" : undefined}
              className={cn(
                "relative py-1 text-sm font-medium transition-colors duration-150",
                active === href
                  ? "text-white"
                  : "text-white/55 hover:text-white/90",
              )}
            >
              {t(label)}
              {active === href && (
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 left-0 h-[2px] w-full rounded-full bg-[#6C3EF4]"
                />
              )}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <SelectorIdioma />
          <Link
            href="/login"
            className="hidden items-center gap-1.5 rounded-full border border-[#6C3EF4]/60 bg-[#6C3EF4]/15 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#6C3EF4] hover:border-[#6C3EF4] active:scale-[0.97] sm:inline-flex"
          >
            {t("enter")}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setOpen((p) => !p)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav
          id="mobile-menu"
          className="border-t border-white/8 bg-[#080c14]/95 backdrop-blur-xl px-6 pb-6 pt-4 lg:hidden"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active === href
                      ? "bg-[#6C3EF4]/20 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {t(label)}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-[#6C3EF4] py-2.5 text-sm font-semibold text-white transition hover:bg-[#7B52F5]"
              >
                {t("enter")} <ArrowRight className="size-4" />
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
