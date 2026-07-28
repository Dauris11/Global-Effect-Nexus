/**
 * Próximos eventos — de la base de datos con búsqueda y filtro de categoría.
 *
 * Si la base de datos no trae eventos agendados, muestra un estado institucional
 * explicativo que invita a consultar el portal.
 */
"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, Search, Calendar as CalendarIcon, Info } from "lucide-react";
import type { EventoPublico } from "@/server/landing/types";
import { SeccionEncabezado } from "./seccion";
import { cn } from "@/lib/utils";

export function Eventos({ eventos }: { eventos: EventoPublico[] }) {
  const t = useTranslations("landing");
  const locale = useLocale();

  const [busqueda, setBusqueda] = useState("");

  const dia = new Intl.DateTimeFormat(locale, { day: "2-digit" });
  const mes = new Intl.DateTimeFormat(locale, { month: "short" });
  const diaSemana = new Intl.DateTimeFormat(locale, { weekday: "long" });

  const eventosFiltrados = eventos.filter((e) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      e.titulo.toLowerCase().includes(q) ||
      (e.ubicacion && e.ubicacion.toLowerCase().includes(q))
    );
  });

  return (
    <section id="eventos" aria-labelledby="eventos-title" className="bg-card py-20 md:py-28 border-t border-border">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SeccionEncabezado
            idTitulo="eventos-title"
            eyebrow={t("eyebrowCalendar")}
            titulo={t("eventsTitle")}
          />

          {eventos.length > 0 && (
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder={t("eventsSearchPlaceholder")}
                className="w-full rounded-full border border-border bg-background pl-9 pr-4 py-2 text-xs font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}
        </div>

        {eventos.length === 0 ? (
          /* Estado Vacío Institucional */
          <div className="mt-12 rounded-xl border border-border bg-background p-8 text-center max-w-2xl mx-auto">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarIcon className="size-7" aria-hidden />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
              {t("eventsEmptyTitle")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {t("eventsEmptyDesc")}
            </p>
          </div>
        ) : (
          <ul className="mt-12 grid gap-4 md:grid-cols-2">
            {eventosFiltrados.map((e) => {
              const [a, m, d] = e.fecha.split("-").map(Number);
              const fecha = new Date(a, m - 1, d, 12);

              return (
                <li key={e.id}>
                  <article className="flex h-full items-center gap-5 rounded-xl border border-border bg-background p-5 transition-all duration-200 ease-out hover:border-primary/40 hover:shadow-xs">
                    <div
                      className="flex size-16 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-card shadow-2xs"
                      aria-hidden
                    >
                      <span className="font-mono text-2xl font-semibold leading-none tabular-nums text-foreground">
                        {dia.format(fecha)}
                      </span>
                      <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary font-semibold">
                        {mes.format(fecha).replace(".", "")}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <span className="sr-only">
                        {diaSemana.format(fecha)} {dia.format(fecha)} {mes.format(fecha)}.{" "}
                      </span>
                      <h3 className="truncate font-display font-semibold text-lg text-foreground">{e.titulo}</h3>
                      {e.ubicacion && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
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
        )}
      </div>
    </section>
  );
}
