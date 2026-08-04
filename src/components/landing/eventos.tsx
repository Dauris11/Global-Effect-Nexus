/**
 * Próximos eventos — del calendario institucional, con búsqueda y filtro.
 *
 * Qué se añadió sobre la versión anterior, que solo tenía un campo de texto:
 *
 * - **Filtro por tipo.** Los tipos salen de los eventos que realmente llegaron
 *   (`academico`, `administrativo`, `social`, `reunion`, `otro` en el enum de la
 *   BD), no de una lista fija: una pestaña que al pulsarla deja la rejilla vacía
 *   es una promesa incumplida. Cada pestaña lleva su conteo.
 * - **`@formkit/auto-animate` en la rejilla.** Al filtrar, las tarjetas que se
 *   van y las que se quedan se mueven en lugar de saltar. Es el caso exacto para
 *   el que el estándar lo recomienda (§7: reordenamientos y buscadores en vivo).
 * - **Distancia en días.** "Hoy", "Mañana", "En 5 días": el dato que uno busca al
 *   mirar un calendario, y que obligaba a calcular mentalmente desde la fecha.
 *   Hoy y mañana van en ámbar porque son los que exigen algo del lector.
 * - **Estado de "sin resultados" con salida.** Antes, filtrar hasta cero dejaba
 *   una rejilla vacía sin explicación ni forma de volver.
 *
 * El estado vacío original (la base no trae eventos) se conserva: es distinto de
 * "tu búsqueda no encontró nada" y merece otro texto.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { MapPin, Search, Calendar as CalendarIcon, X } from "lucide-react";
import type { EventoPublico } from "@/server/landing/types";
import { SeccionEncabezado } from "./seccion";
import { Revelar } from "./revelar";
import { cn } from "@/lib/utils";

/** Tipos del enum de `evento.tipo`. El orden es el de la cabecera del filtro. */
const TIPOS = ["academico", "administrativo", "social", "reunion", "otro"] as const;

export function Eventos({ eventos }: { eventos: EventoPublico[] }) {
  const t = useTranslations("landing");
  const locale = useLocale();

  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState<string>("");
  const [rejilla] = useAutoAnimate<HTMLUListElement>();

  const dia = new Intl.DateTimeFormat(locale, { day: "2-digit" });
  const mes = new Intl.DateTimeFormat(locale, { month: "short" });
  const diaSemana = new Intl.DateTimeFormat(locale, { weekday: "long" });

  /** Solo los tipos presentes, con su conteo. Nada de pestañas que no filtran. */
  const pestanas = useMemo(() => {
    const conteo = new Map<string, number>();
    for (const e of eventos) conteo.set(e.tipo, (conteo.get(e.tipo) ?? 0) + 1);
    return TIPOS.filter((x) => conteo.has(x)).map((x) => ({ tipo: x, n: conteo.get(x)! }));
  }, [eventos]);

  const filtrados = eventos.filter((e) => {
    if (tipo && e.tipo !== tipo) return false;
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      e.titulo.toLowerCase().includes(q) ||
      (e.ubicacion !== null && e.ubicacion.toLowerCase().includes(q))
    );
  });

  const filtrando = busqueda.trim() !== "" || tipo !== "";
  const limpiar = () => {
    setBusqueda("");
    setTipo("");
  };

  return (
    <section
      id="eventos"
      aria-labelledby="eventos-title"
      className="franja-clara-alt border-t border-border bg-card py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Revelar>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SeccionEncabezado
              idTitulo="eventos-title"
              eyebrow={t("eyebrowCalendar")}
              titulo={t("eventsTitle")}
            />

            {eventos.length > 0 && (
              <div className="relative w-full md:w-72">
                <Search
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder={t("eventsSearchPlaceholder")}
                  aria-label={t("eventsSearchPlaceholder")}
                  className="w-full rounded-full border border-border bg-background py-2.5 pl-9 pr-4 text-sm font-medium transition-colors placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            )}
          </div>
        </Revelar>

        {/* Filtro por tipo. Solo aparece si hay más de un tipo que separar. */}
        {pestanas.length > 1 && (
          <div
            className="mt-8 flex flex-wrap items-center gap-2"
            role="group"
            aria-label={t("eventsFilterLabel")}
          >
            <Pestana activa={tipo === ""} onClick={() => setTipo("")}>
              {t("eventsFilterAll")}
              <Conteo>{eventos.length}</Conteo>
            </Pestana>
            {pestanas.map(({ tipo: x, n }) => (
              <Pestana key={x} activa={tipo === x} onClick={() => setTipo(tipo === x ? "" : x)}>
                {t(`eventType_${x}` as never)}
                <Conteo>{n}</Conteo>
              </Pestana>
            ))}
          </div>
        )}

        {eventos.length === 0 ? (
          /* La base no tiene nada agendado: estado institucional explicativo. */
          <Revelar>
            <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-border bg-background p-8 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalendarIcon className="size-7" aria-hidden />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
                {t("eventsEmptyTitle")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("eventsEmptyDesc")}
              </p>
            </div>
          </Revelar>
        ) : (
          <>
            <ul ref={rejilla} className="mt-8 grid gap-4 md:grid-cols-2">
              {filtrados.map((e) => {
                const fecha = partirFecha(e.fecha);
                if (!fecha) return null;
                const dias = diasHasta(fecha);

                return (
                  <li key={e.id}>
                    <article className="flex h-full items-center gap-5 rounded-xl border border-border bg-background p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-flotante">
                      <div
                        className="flex size-16 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-card shadow-plana"
                        aria-hidden
                      >
                        <span className="font-mono text-3xl font-bold leading-none tabular-nums text-foreground">
                          {dia.format(fecha)}
                        </span>
                        <span className="mt-1 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                          {mes.format(fecha).replace(".", "")}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="sr-only">
                          {diaSemana.format(fecha)} {dia.format(fecha)} {mes.format(fecha)}.{" "}
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-[0.1em]",
                              dias <= 1
                                ? "bg-brand-gold/15 text-brand-gold"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {dias <= 0
                              ? t("eventsToday")
                              : dias === 1
                                ? t("eventsTomorrow")
                                : t("eventsInDays", { n: dias })}
                          </span>
                          <span className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground/70">
                            {t(`eventType_${TIPOS.includes(e.tipo as never) ? e.tipo : "otro"}` as never)}
                          </span>
                        </div>

                        <h3 className="mt-1.5 truncate font-display text-xl font-semibold text-foreground">
                          {e.titulo}
                        </h3>
                        {e.ubicacion && (
                          <p className="mt-1 flex items-center gap-1.5 font-mono text-sm text-muted-foreground">
                            <MapPin className="size-3.5 shrink-0 text-primary/70" aria-hidden />
                            <span className="truncate">{e.ubicacion}</span>
                          </p>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>

            {/* Filtró hasta cero: se explica y se ofrece la salida. */}
            {filtrados.length === 0 && (
              <div className="mt-8 rounded-xl border border-dashed border-border bg-background p-8 text-center">
                <p className="text-base font-medium text-foreground">{t("eventsNoResults")}</p>
                <button
                  type="button"
                  onClick={limpiar}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <X className="size-3.5" aria-hidden />
                  {t("eventsClear")}
                </button>
              </div>
            )}

            {filtrando && filtrados.length > 0 && (
              <p
                aria-live="polite"
                className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground"
              >
                {t("eventsCount", { n: filtrados.length, total: eventos.length })}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Pestana({
  activa,
  onClick,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        activa
          ? "border-primary bg-primary text-primary-foreground shadow-plana"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Conteo({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-current/15 px-1.5 font-semibold tabular-nums">
      {children}
    </span>
  );
}

/**
 * `YYYY-MM-DD` → `Date` al mediodía local: `new Date("2026-08-12")` se lee como
 * UTC y en América retrocede un día.
 */
function partirFecha(iso: string): Date | null {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return null;
  return new Date(a, m - 1, d, 12);
}

/** Días de calendario que faltan, comparando mediodías para ignorar la hora. */
function diasHasta(fecha: Date): number {
  const hoy = new Date();
  hoy.setHours(12, 0, 0, 0);
  return Math.round((fecha.getTime() - hoy.getTime()) / 86_400_000);
}
