/**
 * Navbar sticky (Impact Editorial): papel translúcido con blur, logo (chip
 * tinta porque el logo es blanco), navegación mono al centro y a la derecha el
 * botón de comida (ámbar) + acceso al portal (teal).
 */
"use client";

import { Utensils } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";

export function Navbar() {
  const t = useTranslations("landing");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="Global Effect" className="flex items-center">
          <span className="flex items-center rounded-xl bg-brand-charcoal px-2.5 py-1.5">
            <Logo className="h-6 w-auto" priority />
          </span>
        </Link>

        <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground md:flex">
          <a href="#programas" className="transition-colors hover:text-foreground">
            {t("navPortales")}
          </a>
          <a href="#eventos" className="transition-colors hover:text-foreground">
            {t("navEventos")}
          </a>
          <a href="#footer" className="transition-colors hover:text-foreground">
            {t("navContacto")}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/comida"
            className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-3.5 py-2 text-sm font-semibold text-brand-charcoal transition duration-150 ease-out hover:brightness-95 active:scale-[0.97]"
          >
            <Utensils className="size-4" />
            <span className="hidden sm:inline">{t("foodTitle")}</span>
          </Link>
          <Link
            href="/login"
            className="hidden rounded-full bg-brand-teal px-4 py-2 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-brand-teal-dark active:scale-[0.97] sm:inline-flex"
          >
            {t("enter")}
          </Link>
        </div>
      </div>
    </header>
  );
}
