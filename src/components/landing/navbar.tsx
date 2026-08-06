/**
 * Navbar del landing — barra fija superior.
 *
 * Blanca translúcida sobre el contenido que pasa por debajo, con los enlaces
 * de sección al centro y, a la derecha, el acceso a la inscripción de comida
 * (ámbar, por ser la acción abierta a cualquiera) más el indicador de estado
 * del sistema.
 */
"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";

const SECCIONES = [
  { href: "#portales", clave: "navAccess" },
  { href: "#eventos", clave: "navEventos" },
  { href: "#footer", clave: "navContact" },
] as const;

export function Navbar() {
  const t = useTranslations("landing");

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <nav
        aria-label={t("portalsLabel")}
        className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6"
      >
        <Link href="/" className="shrink-0">
          <Logo className="h-9 w-auto" tono="oscuro" priority />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {SECCIONES.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="text-sm text-slate-600 transition-colors hover:text-slate-900"
            >
              {t(s.clave)}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 sm:inline-flex">
            <span
              aria-hidden
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
            />
            {t("navSystemActive")}
          </span>

          <Link
            href="/comida"
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            {t("heroCta2")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
