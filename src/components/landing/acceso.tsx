/**
 * Banda de acceso — Las tres puertas que existen de verdad.
 *
 * Es la sección más importante de la página: el visitante llega para entrar a
 * algún sitio, y aquí se decide a cuál. Por eso es la primera después del hero y
 * por eso cada tarjeta es un enlace completo, no una tarjeta con un enlace
 * dentro (el objetivo táctil es toda la ficha, §8).
 *
 * Cambios sobre la versión anterior:
 *
 * - **Las fichas se levantan al apuntarlas** (`-translate-y-0.5` + sombra
 *   flotante). Es la señal de "esto se puede pulsar", y en una rejilla de tres
 *   enlaces idénticos en forma es la única forma barata de decirlo.
 * - **Entrada en cascada al aparecer** (`Revelar`, 60ms entre fichas). El
 *   contenido sigue siendo de servidor: `Revelar` solo envuelve.
 * - **La ficha del comedor lleva su cuenta atrás real.** El ámbar ya la
 *   distinguía; ahora además dice la ventana horaria en el pie, que es el dato
 *   que decide si sirve pulsarla.
 */
import { getTranslations } from "next-intl/server";
import { ArrowRight, LogIn, Utensils, CalendarPlus, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { SeccionEncabezado } from "./seccion";
import { Revelar } from "./revelar";
import { Portales } from "./portales";

const PUERTAS = [
  { clave: "portal", href: "/login", icono: LogIn, destacado: false },
  { clave: "meals", href: "/comida", icono: Utensils, destacado: true },
  { clave: "appointment", href: "/login", icono: CalendarPlus, destacado: false },
] as const;

export async function Acceso() {
  const t = await getTranslations("landing");

  return (
    <section
      id="acceso"
      aria-labelledby="acceso-title"
      className="border-t border-border bg-background py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Revelar>
          <SeccionEncabezado
            idTitulo="acceso-title"
            eyebrow={t("accessEyebrow")}
            titulo={t("accessTitle")}
            intro={t("accessIntro")}
          />
        </Revelar>

        <ul className="mt-12 grid gap-6 sm:grid-cols-3">
          {PUERTAS.map(({ clave, href, icono: Icono, destacado }, i) => (
            <Revelar key={clave} como="li" retardo={0.06 * i}>
              <Link
                href={href}
                className={cn(
                  "group flex h-full flex-col justify-between rounded-xl border bg-card p-7 shadow-plana",
                  "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-flotante",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  destacado
                    ? "border-brand-gold/50 bg-brand-gold/[0.06] hover:border-brand-gold hover:bg-brand-gold/[0.12]"
                    : "border-border hover:border-primary/50 hover:bg-accent/40",
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "flex size-14 items-center justify-center rounded-xl transition-transform duration-200 ease-out group-hover:scale-105",
                        destacado
                          ? "bg-brand-gold/20 text-brand-gold"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      <Icono className="size-7" strokeWidth={1.6} aria-hidden />
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]",
                        destacado
                          ? "bg-brand-gold/15 text-brand-gold"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {t(`access_${clave}_tag` as never)}
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                    {t(`access_${clave}_title` as never)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(`access_${clave}_desc` as never)}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                    {t(`access_${clave}_cta` as never)}
                    <ArrowRight
                      className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-1"
                      aria-hidden
                    />
                  </span>
                  {destacado && (
                    <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-brand-gold">
                      <Clock className="size-3" aria-hidden />
                      <span>{t("access_meals_hours")}</span>
                    </span>
                  )}
                </div>
              </Link>
            </Revelar>
          ))}
        </ul>

        <Portales />
      </div>
    </section>
  );
}
