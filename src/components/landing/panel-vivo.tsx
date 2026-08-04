/**
 * `PanelVivo` — la columna derecha del hero cuando no hay fotografía.
 *
 * El hero se diseñó a dos columnas para una foto documental, y la Fundación
 * todavía no tiene fotos propias que publicar. La versión anterior resolvía eso
 * colapsando a una sola columna: quedaba un bloque de texto y aire, y por eso la
 * página "no se movía". Poner una foto de banco sería peor —el estándar pide
 * fotografía real (§9)—, así que la columna se llena con lo único que esta
 * página tiene y una foto no tendría: **el estado del sistema ahora mismo.**
 *
 * Es información con una decisión detrás, no un adorno:
 *
 * - **Comedor.** Es el servicio con una ventana horaria estricta (6:00–8:30) y
 *   la razón por la que la mayoría de los visitantes locales abre esta página.
 *   El panel dice si está abierto, cuánto falta para el cierre, y ofrece el
 *   enlace de inscripción solo cuando sirve de algo.
 * - **Próximo evento.** El primero del calendario institucional, con su bloque
 *   de fecha, para que "lo próximo que pasa" esté visible sin desplazarse.
 * - **Portal.** El aviso de que el acceso es por invitación, que evita el intento
 *   de registro que no existe.
 *
 * Notas técnicas:
 *
 * - **La hora se pinta solo tras montar.** El servidor y el navegador no están en
 *   el mismo reloj ni en la misma zona; renderizarla en el servidor rompe la
 *   hidratación. Hasta entonces se reserva el hueco con `--:--`.
 * - Se usa la hora **local del visitante**, que para el público de La Vega es la
 *   de la Fundación. Un visitante en otra zona ve su propio reloj, y eso es
 *   correcto: la etiqueta dice a qué hora cierra, no cuánto falta en su huso.
 * - El intervalo es de 30s y se limpia al desmontar.
 */
"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Clock, MapPin, ShieldCheck, UtensilsCrossed } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Ventana de inscripción al comedor, en minutos desde medianoche. */
const APERTURA = 6 * 60;
const CIERRE = 8 * 60 + 30;

export interface EventoResumen {
  titulo: string;
  fecha: string;
  ubicacion: string | null;
}

export function PanelVivo({ evento }: { evento?: EventoResumen | null }) {
  const t = useTranslations("landing");
  const locale = useLocale();
  const [ahora, setAhora] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setAhora(new Date()));
    const id = setInterval(() => setAhora(new Date()), 30_000);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(id);
    };
  }, []);

  const minutos = ahora ? ahora.getHours() * 60 + ahora.getMinutes() : null;
  const abierto = minutos !== null && minutos >= APERTURA && minutos < CIERRE;
  const restante = abierto && minutos !== null ? CIERRE - minutos : 0;

  const reloj = ahora
    ? new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(ahora)
    : "--:--";

  const fechaEvento = evento ? partirFecha(evento.fecha) : null;

  return (
    <div className="rounded-xl border border-border bg-card shadow-flotante">
      {/* Cabecera: reloj en vivo */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <span className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
            <span className="relative size-2 rounded-full bg-primary" />
          </span>
          {t("panelNow")}
        </span>
        <span className="font-mono text-base font-semibold tabular-nums text-foreground">
          {reloj}
        </span>
      </div>

      {/* Comedor: el dato con hora de cierre */}
      <div className="border-b border-border p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
              abierto ? "bg-brand-gold/15 text-brand-gold" : "bg-muted text-muted-foreground",
            )}
          >
            <UtensilsCrossed className="size-5" strokeWidth={1.7} aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-semibold leading-none text-foreground">
                {t("panelMeals")}
              </h3>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-[0.1em]",
                  abierto
                    ? "bg-brand-gold/15 text-brand-gold"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {ahora === null
                  ? "···"
                  : abierto
                    ? t("panelMealsOpen")
                    : t("panelMealsClosed")}
              </span>
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <Clock className="size-3.5 shrink-0" aria-hidden />
              {ahora === null
                ? t("panelMealsWindow")
                : abierto
                  ? t("panelMealsLeft", { n: restante })
                  : t("panelMealsNext")}
            </p>
          </div>
        </div>

        <Link
          href="/comida"
          className={cn(
            "group mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-base font-semibold transition duration-150 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            abierto
              ? "bg-brand-gold text-white hover:brightness-95 active:scale-[0.99]"
              : "border border-border bg-background text-foreground hover:bg-accent",
          )}
        >
          {abierto ? t("access_meals_cta") : t("panelMealsSee")}
          <ArrowRight
            className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>

      {/* Próximo evento del calendario institucional */}
      <div className="border-b border-border p-5">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {t("panelNextEvent")}
        </p>

        {evento && fechaEvento ? (
          <a href="#eventos" className="group mt-3 flex items-center gap-4">
            <span
              aria-hidden
              className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-background"
            >
              <span className="font-mono text-xl font-semibold leading-none tabular-nums text-foreground">
                {new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(fechaEvento)}
              </span>
              <span className="mt-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
                {new Intl.DateTimeFormat(locale, { month: "short" })
                  .format(fechaEvento)
                  .replace(".", "")}
              </span>
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                {evento.titulo}
              </span>
              {evento.ubicacion && (
                <span className="mt-1 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0 text-primary/70" aria-hidden />
                  <span className="truncate">{evento.ubicacion}</span>
                </span>
              )}
            </span>
          </a>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("panelNoEvent")}
          </p>
        )}
      </div>

      {/* Pie: cómo se entra */}
      <div className="flex items-center gap-2.5 rounded-b-xl bg-muted/60 px-5 py-3.5">
        <ShieldCheck className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <p className="font-mono text-xs leading-snug text-muted-foreground">
          {t("panelInviteOnly")}
        </p>
      </div>
    </div>
  );
}

/**
 * `YYYY-MM-DD` → `Date` al mediodía local.
 *
 * `new Date("2026-08-12")` se interpreta como UTC y en América retrocede un día.
 * Construirla por partes, y al mediodía, deja la fecha inmune al huso.
 */
function partirFecha(iso: string): Date | null {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return null;
  return new Date(a, m - 1, d, 12);
}
