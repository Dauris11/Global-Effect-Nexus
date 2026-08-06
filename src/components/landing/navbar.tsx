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
        <Link href="/" className="min-w-0 shrink">
          {/* El logotipo es apaisado (2400×524): a 36px de alto ocupa unos
              165px de ancho y en móvil no deja sitio al botón de comida. */}
          <Logo className="h-7 w-auto sm:h-9" tono="oscuro" priority />
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

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 sm:inline-flex">
            <span
              aria-hidden
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
            />
            {t("navSystemActive")}
          </span>

          <Link
            href="/comida"
            className="whitespace-nowrap rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 sm:px-4"
          >
            {/* En móvil solo cabe la palabra; el destino es el mismo. */}
            <span className="sm:hidden">{t("navMealsShort")}</span>
            <span className="hidden sm:inline">{t("heroCta2")}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
