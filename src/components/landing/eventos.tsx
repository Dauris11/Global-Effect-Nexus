/**
 * Eventos — calendario institucional con búsqueda y filtros.
 * Rediseño completo: tema oscuro, tarjetas con acento púrpura, sin tokens viejos.
 */
"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { MapPin, Search, Calendar as CalendarIcon, X } from "lucide-react";
import type { EventoPublico } from "@/server/landing/types";
import { cn } from "@/lib/utils";

const TIPOS = ["academico", "administrativo", "social", "reunion", "otro"] as const;

export function Eventos({ eventos }: { eventos: EventoPublico[] }) {
  const t = useTranslations("landing");
  const locale = useLocale();

  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState<string>("");
  const [rejilla] = useAutoAnimate<HTMLUListElement>();

  const fmt = {
    dia:      new Intl.DateTimeFormat(locale, { day: "2-digit" }),
    mes:      new Intl.DateTimeFormat(locale, { month: "short" }),
    semana:   new Intl.DateTimeFormat(locale, { weekday: "long" }),
  };

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
  const limpiar = () => { setBusqueda(""); setTipo(""); };

  return (
    <section
      id="eventos"
      aria-labelledby="eventos-title"
      className="relative bg-[#0a0e1a] py-24 md:py-32"
    >
      {/* Separator */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/8 to-transparent"
      />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header row */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#60a5fa]">
              {t("eyebrowCalendar")}
            </p>
            <h2
              id="eventos-title"
              className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight text-white"
            >
              {t("eventsTitle")}
            </h2>
          </div>

          {/* Search */}
          {eventos.length > 0 && (
            <div className="relative w-full md:w-72">
              <Search
                className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/30"
                aria-hidden
              />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder={t("eventsSearchPlaceholder")}
                aria-label={t("eventsSearchPlaceholder")}
                className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm font-medium text-white/80 placeholder:text-white/25 transition-colors focus-visible:border-[#1d4ed8]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4ed8]/40 focus-visible:bg-white/[0.06]"
              />
            </div>
          )}
        </div>

        {/* Filter tabs */}
        {pestanas.length > 1 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <FilterTab active={tipo === ""} onClick={() => setTipo("")}>
              {t("eventsFilterAll")} <Badge>{eventos.length}</Badge>
            </FilterTab>
            {pestanas.map(({ tipo: x, n }) => (
              <FilterTab key={x} active={tipo === x} onClick={() => setTipo(tipo === x ? "" : x)}>
                {t(`eventType_${x}` as never)} <Badge>{n}</Badge>
              </FilterTab>
            ))}
          </div>
        )}

        {/* Empty state — no events from DB */}
        {eventos.length === 0 ? (
          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-white/8 bg-white/[0.03] p-10 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#1d4ed8]/15 text-[#60a5fa]">
              <CalendarIcon className="size-7" aria-hidden />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-white">
              {t("eventsEmptyTitle")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/40">
              {t("eventsEmptyDesc")}
            </p>
          </div>
        ) : (
          <>
            <ul ref={rejilla} className="mt-8 grid gap-4 md:grid-cols-2">
              {filtrados.map((e) => {
                const fecha = partirFecha(e.fecha);
                if (!fecha) return null;
                const dias = diasHasta(fecha);
                const urgente = dias <= 1;

                return (
                  <li key={e.id}>
                    <article className="flex h-full items-center gap-5 rounded-2xl border border-white/8 bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1d4ed8]/35 hover:bg-[#1d4ed8]/[0.04] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
                      {/* Date block */}
                      <div
                        className={cn(
                          "flex size-16 shrink-0 flex-col items-center justify-center rounded-xl border",
                          urgente
                            ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                            : "border-white/10 bg-white/[0.04] text-white",
                        )}
                        aria-hidden
                      >
                        <span className="font-mono text-2xl font-bold leading-none tabular-nums">
                          {fmt.dia.format(fecha)}
                        </span>
                        <span className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#60a5fa]">
                          {fmt.mes.format(fecha).replace(".", "")}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="sr-only">
                          {fmt.semana.format(fecha)} {fmt.dia.format(fecha)} {fmt.mes.format(fecha)}.{" "}
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em]",
                              urgente
                                ? "bg-amber-400/15 text-amber-400"
                                : "bg-white/6 text-white/35",
                            )}
                          >
                            {dias <= 0
                              ? t("eventsToday")
                              : dias === 1
                                ? t("eventsTomorrow")
                                : t("eventsInDays", { n: dias })}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/25">
                            {t(`eventType_${TIPOS.includes(e.tipo as never) ? e.tipo : "otro"}` as never)}
                          </span>
                        </div>

                        <h3 className="mt-1.5 truncate font-display text-base font-semibold text-white">
                          {e.titulo}
                        </h3>
                        {e.ubicacion && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-white/35">
                            <MapPin className="size-3 shrink-0 text-[#60a5fa]" aria-hidden />
                            <span className="truncate">{e.ubicacion}</span>
                          </p>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>

            {/* Filtered to zero */}
            {filtrados.length === 0 && (
              <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                <p className="text-sm font-medium text-white/50">{t("eventsNoResults")}</p>
                <button
                  type="button"
                  onClick={limpiar}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="size-3.5" aria-hidden />
                  {t("eventsClear")}
                </button>
              </div>
            )}

            {filtrando && filtrados.length > 0 && (
              <p
                aria-live="polite"
                className="mt-6 font-mono text-[10px] uppercase tracking-[0.15em] text-white/30"
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

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4ed8]",
        active
          ? "border-[#1d4ed8] bg-[#1d4ed8] text-white shadow-[0_0_20px_rgba(29,78,216,0.35)]"
          : "border-white/10 bg-white/[0.03] text-white/40 hover:border-white/20 hover:text-white/70",
      )}
    >
      {children}
    </button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-current/15 px-1.5 font-semibold tabular-nums text-[9px]">
      {children}
    </span>
  );
}

function partirFecha(iso: string): Date | null {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return null;
  return new Date(a, m - 1, d, 12);
}

function diasHasta(fecha: Date): number {
  const hoy = new Date();
  hoy.setHours(12, 0, 0, 0);
  return Math.round((fecha.getTime() - hoy.getTime()) / 86_400_000);
}
