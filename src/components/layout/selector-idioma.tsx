/**
 * SelectorIdioma — cambia entre español e inglés conservando la página actual.
 *
 * Con dos idiomas no se usa un desplegable: un control segmentado de dos
 * pastillas dice a la vez cuál está activo y cuál es la alternativa, en un solo
 * gesto y sin abrir nada. Un `<select>` para dos opciones esconde la mitad de
 * la información.
 *
 * Son enlaces reales (`<Link locale>` de next-intl), no un `onChange`: así el
 * cambio de idioma es una navegación —se puede abrir en otra pestaña, se
 * guarda en el historial— y funciona sin JavaScript. Se conservan los
 * parámetros de consulta para no perder el estado de la vista (p. ej. el mes
 * del calendario en `?mes=`).
 */
"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** Nombre de cada idioma en su propio idioma: nadie busca "Inglés", busca "EN". */
const NOMBRES: Record<string, { corto: string; largo: string }> = {
  es: { corto: "ES", largo: "Español" },
  en: { corto: "EN", largo: "English" },
};

export function SelectorIdioma({
  tone = "light",
  className,
}: {
  /** `light` sobre papel (portal, landing); `dark` sobre tinta. */
  tone?: "light" | "dark";
  className?: string;
}) {
  const activo = useLocale();
  const pathname = usePathname();
  const params = useSearchParams();

  const consulta = params.toString();
  const destino = consulta ? `${pathname}?${consulta}` : pathname;

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-full p-1 bg-white dark:bg-[#18181c] border border-slate-200/80 dark:border-zinc-800 shadow-sm",
        className,
      )}
    >
      {routing.locales.map((locale) => {
        const esActivo = locale === activo;
        const nombre = NOMBRES[locale] ?? { corto: locale.toUpperCase(), largo: locale };

        return (
          <Link
            key={locale}
            href={destino}
            locale={locale}
            hrefLang={locale}
            aria-current={esActivo ? "true" : undefined}
            className={cn(
              "rounded-full px-2.5 py-1 tabular-nums text-[11px] font-bold uppercase tracking-wide transition-all",
              esActivo
                ? "bg-[#0a6a8a] text-white shadow-xs dark:bg-[#2096ba]"
                : "text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white",
            )}
          >
            <span aria-hidden>{nombre.corto}</span>
            <span className="sr-only">{nombre.largo}</span>
          </Link>
        );
      })}
    </div>
  );
}
