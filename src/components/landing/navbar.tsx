/**
 * Navbar de la landing — "Impact Editorial".
 *
 * Características:
 * - Cristal translúcido con blur responsivo y borde inferior sutil.
 * - Barra superior informativa con estado de servicios.
 * - Menú hamburguesa accesible para dispositivos móviles.
 * - Indicadores claros de navegación e i18n switcher.
 */
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Menu, X, ArrowRight, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { SelectorIdioma } from "@/components/layout/selector-idioma";
import { cn } from "@/lib/utils";

const SECCIONES = [
  { href: "#acceso", clave: "navAccess" },
  { href: "#labor", clave: "navWork" },
  { href: "#eventos", clave: "navEventos" },
  { href: "#faq", clave: "navFaq" },
] as const;

export function Navbar() {
  const t = useTranslations("landing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (const s of SECCIONES) {
        const target = document.querySelector(s.href);
        if (target) {
          const top = (target as HTMLElement).offsetTop;
          const height = (target as HTMLElement).offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(s.href);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Banner de servicio público */}
      <div className="bg-brand-charcoal text-white/80 py-1.5 px-4 text-xs font-mono border-b border-white/10 flex items-center justify-between gap-4">
        <div className="mx-auto max-w-6xl w-full flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <Clock className="size-3.5 text-brand-gold shrink-0" aria-hidden />
            <span className="truncate">{t("mealNoticePill")}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0 text-white/50 text-[11px]">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t("systemStatusPill")}</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          {/* Logo */}
          <Link href="/" aria-label="Global Effect" className="flex shrink-0 items-center">
            <span className="flex items-center rounded-lg bg-brand-charcoal px-2.5 py-1.5 transition-opacity hover:opacity-95">
              <Logo className="h-6 w-auto" priority />
            </span>
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden items-center gap-7 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground lg:flex">
            {SECCIONES.map((s) => {
              const isActive = activeSection === s.href;
              return (
                <a
                  key={s.href}
                  href={s.href}
                  className={cn(
                    "transition-colors duration-150 relative py-1 hover:text-foreground",
                    isActive && "text-foreground font-semibold",
                  )}
                >
                  {t(s.clave)}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Acciones e i18n */}
          <div className="flex shrink-0 items-center gap-3">
            <SelectorIdioma />
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition duration-150 ease-out hover:bg-brand-teal-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t("enter")}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>

            {/* Toggle Menú Móvil */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((p) => !p)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className="flex size-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent lg:hidden"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Drawer Móvil */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-background p-6 lg:hidden animate-fade-down">
            <nav className="flex flex-col gap-4 font-mono text-xs uppercase tracking-[0.16em]">
              {SECCIONES.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-border/50 text-foreground/80 hover:text-primary transition-colors"
                >
                  {t(s.clave)}
                </a>
              ))}
              <div className="pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground"
                >
                  {t("enter")}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
