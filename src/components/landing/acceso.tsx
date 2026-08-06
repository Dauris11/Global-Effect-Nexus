/**
 * Sección de acceso — las tres puertas de entrada al sistema.
 * Rediseño completo: tema oscuro, acento púrpura, glassmorphism.
 */
import { getTranslations } from "next-intl/server";
import { ArrowRight, LogIn, Utensils, CalendarPlus, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const PUERTAS = [
  { clave: "portal",      href: "/login",   icono: LogIn,       destacado: false },
  { clave: "meals",       href: "/comida",  icono: Utensils,    destacado: true  },
  { clave: "appointment", href: "/login",   icono: CalendarPlus,destacado: false },
] as const;

export async function Acceso() {
  const t = await getTranslations("landing");

  return (
    <section
      id="acceso"
      aria-labelledby="acceso-title"
      className="franja-clara relative overflow-hidden bg-background py-24 md:py-32"
    >
      {/* Blue accent top bar */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-primary"
      />

      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            {t("accessEyebrow")}
          </p>
          <h2
            id="acceso-title"
            className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight text-foreground"
          >
            {t("accessTitle")}
          </h2>
        </div>

        {/* Cards */}
        <ul className="mt-14 grid gap-5 sm:grid-cols-3">
          {PUERTAS.map(({ clave, href, icono: Icono, destacado }) => (
            <li key={clave}>
              <Link
                href={href}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-2xl border p-7 transition-all duration-300 ease-out",
                  "hover:-translate-y-1 hover:shadow-flotante",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  destacado
                    ? "border-amber-400/35 bg-amber-400/[0.06] hover:border-amber-400/60 hover:bg-amber-400/[0.12]"
                    : "border-border bg-card hover:border-primary/40 hover:bg-primary/[0.04]",
                )}
              >
                {/* Glow overlay on hover */}
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    destacado
                      ? "bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.08),transparent_60%)]"
                      : "bg-[radial-gradient(ellipse_at_top,rgba(32,150,186,0.08),transparent_60%)]",
                  )}
                />

                <div className="relative">
                  {/* Icon + tag row */}
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "flex size-14 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-110",
                        destacado
                          ? "bg-amber-400/15 text-amber-400"
                          : "bg-primary/15 text-primary",
                      )}
                    >
                      <Icono className="size-7" strokeWidth={1.5} aria-hidden />
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em]",
                        destacado
                          ? "bg-amber-400/10 text-amber-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {t(`access_${clave}_tag` as never)}
                    </span>
                  </div>

                  {/* Text */}
                  <h3
                    className={cn(
                      "mt-6 font-display text-xl font-semibold leading-snug text-foreground transition-colors duration-200",
                      destacado
                        ? "group-hover:text-amber-600"
                        : "group-hover:text-primary",
                    )}
                  >
                    {t(`access_${clave}_title` as never)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(`access_${clave}_desc` as never)}
                  </p>
                </div>

                {/* Footer CTA */}
                <div className="relative mt-7 flex items-center justify-between gap-3 border-t border-border pt-5">
                  <span
                    className={cn(
                      "flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200",
                      destacado
                        ? "text-amber-400 group-hover:text-amber-300"
                        : "text-primary group-hover:text-primary/80",
                    )}
                  >
                    {t(`access_${clave}_cta` as never)}
                    <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                  {destacado && (
                    <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-amber-400/70">
                      <Clock className="size-3" aria-hidden />
                      {t("access_meals_hours")}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
