/**
 * Banda de acceso — Las tres puertas que existen de verdad.
 *
 * Características:
 * - Tarjetas claras por rol de usuario.
 * - Destacado especial en ámbar (`--brand-gold`) para la inscripción al comedor comunitario.
 * - Accesibilidad de teclado total y micro-animación en hover.
 */
import { getTranslations } from "next-intl/server";
import { ArrowRight, LogIn, Utensils, CalendarPlus, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { SeccionEncabezado } from "./seccion";

const PUERTAS = [
  { clave: "portal", href: "/login", icono: LogIn, destacado: false, tag: "Estudiantes & Personal" },
  { clave: "meals", href: "/comida", icono: Utensils, destacado: true, tag: "Comunal Activos" },
  { clave: "appointment", href: "/login", icono: CalendarPlus, destacado: false, tag: "Estudiantes Activos" },
] as const;

export async function Acceso() {
  const t = await getTranslations("landing");

  return (
    <section
      id="acceso"
      aria-labelledby="acceso-title"
      className="bg-background py-20 md:py-28 border-t border-border"
    >
      <div className="mx-auto max-w-6xl px-6">
        <SeccionEncabezado
          idTitulo="acceso-title"
          eyebrow={t("accessEyebrow")}
          titulo={t("accessTitle")}
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {PUERTAS.map(({ clave, href, icono: Icono, destacado }) => (
            <Link
              key={clave}
              href={href}
              className={cn(
                "group flex flex-col justify-between rounded-xl border bg-card p-7 transition-all duration-200 shadow-xs",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                destacado
                  ? "border-brand-gold/50 bg-brand-gold/[0.06] hover:border-brand-gold hover:bg-brand-gold/[0.12] hover:shadow-md"
                  : "border-border hover:border-primary/50 hover:bg-accent/40 hover:shadow-md",
              )}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-14 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
                      destacado
                        ? "bg-brand-gold/20 text-brand-gold"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    <Icono className="size-7" strokeWidth={1.6} aria-hidden />
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-[0.14em] rounded-full px-2.5 py-1 font-semibold",
                      destacado
                        ? "bg-brand-gold/15 text-brand-gold"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {t(`access_${clave}_tag` as never)}
                  </span>
                </div>

                <h3 className="mt-6 font-display text-xl font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                  {t(`access_${clave}_title` as never)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`access_${clave}_desc` as never)}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {t(`access_${clave}_cta` as never)}
                  <ArrowRight
                    className="size-4 transition-transform duration-150 group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
                {destacado && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-brand-gold">
                    <Clock className="size-3" />
                    <span>{t("access_meals_hours")}</span>
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
