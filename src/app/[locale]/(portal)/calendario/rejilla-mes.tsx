/**
 * Rejilla mensual del calendario — ClickUp S9 · #453–454.
 *
 * Dos piezas en una: la vista del mes con indicadores por día (#453) y el panel
 * del día que se abre al pulsar una celda (#454).
 *
 * Decisiones:
 * - **La semana empieza en lunes** (convención de RD y de la mayoría de los
 *   locales del sistema), no en domingo.
 * - **Los días de los meses vecinos van vacíos.** La consulta trae solo el mes
 *   pedido; pintar el 30 de octubre con sus eventos ocultos diría "no hay nada"
 *   cuando sí hay. Un hueco no miente.
 * - **Los puntos son decorativos** (`aria-hidden`): lo que un lector de pantalla
 *   necesita es la fecha y cuántas cosas hay, y eso va en el `aria-label`.
 * - El panel se abre con `SidePanel` y no con un modal para que el mes siga
 *   visible detrás mientras se recorren días seguidos (estándar §6).
 */
"use client";

import * as React from "react";
import type { EntradaAgenda } from "@/server/operaciones/types";
import { paletaDe } from "@/lib/estados";
import { cn } from "@/lib/utils";
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelBody,
  SidePanelTitle,
  SidePanelDescription,
} from "@/components/ui/side-panel";
import { diasDelMes, huecosIniciales, hoyISO } from "./fechas";
import { LineaEntrada, bandaDeEntrada, type TextosEntrada } from "./linea-entrada";

/** Cuántos puntos caben en una celda antes de resumir en "+N". */
const PUNTOS_VISIBLES = 3;

export interface TextosRejilla extends TextosEntrada {
  /** Nombres de los días, de lunes a domingo. */
  dias: string[];
  hoy: string;
  /**
   * Plantilla del `aria-label` de cada celda, con los marcadores `{fecha}` y
   * `{n}`: p. ej. "lunes 9 de noviembre, 3 entradas". Llega como cadena y no
   * como función porque React no serializa funciones entre servidor y cliente.
   */
  etiquetaDia: string;
  /** Resumen del panel del día, con el marcador `{n}`: "3 entradas". */
  resumenDia: string;
  diaVacio: string;
  cerrar: string;
}

/** Sustituye `{fecha}` y `{n}` en la plantilla del `aria-label`. */
function etiquetaDe(plantilla: string, fecha: string, n: number): string {
  return plantilla.replace("{fecha}", fecha).replace("{n}", String(n));
}

export function RejillaMes({
  mes,
  entradas,
  locale,
  textos,
}: {
  /** Mes visible, `YYYY-MM`. */
  mes: string;
  entradas: EntradaAgenda[];
  locale: string;
  textos: TextosRejilla;
}) {
  const [diaAbierto, setDiaAbierto] = React.useState<string | null>(null);

  /** Índice día → entradas, para no recorrer la lista completa por celda. */
  const porDia = React.useMemo(() => {
    const mapa = new Map<string, EntradaAgenda[]>();
    for (const e of entradas) {
      const lista = mapa.get(e.fecha);
      if (lista) lista.push(e);
      else mapa.set(e.fecha, [e]);
    }
    return mapa;
  }, [entradas]);

  const total = diasDelMes(mes);
  const huecos = huecosIniciales(mes);
  const hoy = hoyISO();

  const fechaLarga = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const nombreDeDia = (iso: string) => {
    const [a, m, d] = iso.split("-").map(Number);
    return fechaLarga.format(new Date(a, m - 1, d, 12));
  };

  const delDia = diaAbierto ? (porDia.get(diaAbierto) ?? []) : [];

  return (
    <>
      {/* Cabecera de días. `gap-px` sobre fondo de borde dibuja la retícula sin
          un borde por celda, que se vería doble en los encuentros. */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-7 gap-px bg-border">
          {textos.dias.map((d) => (
            <div
              key={d}
              className="bg-surface-sunken px-2 py-2 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
            >
              <span aria-hidden>{d.slice(0, 3)}</span>
              <span className="sr-only">{d}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-border">
          {Array.from({ length: huecos }, (_, i) => (
            <div key={`hueco-${i}`} className="min-h-24 bg-surface-sunken" aria-hidden />
          ))}

          {Array.from({ length: total }, (_, i) => {
            const dia = String(i + 1).padStart(2, "0");
            const iso = `${mes}-${dia}`;
            const lista = porDia.get(iso) ?? [];
            const esHoy = iso === hoy;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setDiaAbierto(iso)}
                aria-label={etiquetaDe(textos.etiquetaDia, nombreDeDia(iso), lista.length)}
                className={cn(
                  "group flex min-h-24 flex-col items-start gap-1.5 bg-surface p-2 text-left",
                  "transition-colors duration-150 ease-out hover:bg-accent",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full font-mono text-xs tabular-nums",
                    esHoy
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {i + 1}
                  {esHoy && <span className="sr-only"> ({textos.hoy})</span>}
                </span>

                {lista.length > 0 && (
                  <span className="flex flex-wrap items-center gap-1" aria-hidden>
                    {lista.slice(0, PUNTOS_VISIBLES).map((e) => (
                      <span
                        key={e.id}
                        className={cn(
                          "size-1.5 rounded-full",
                          paletaDe(bandaDeEntrada(e)).solido,
                        )}
                      />
                    ))}
                    {lista.length > PUNTOS_VISIBLES && (
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                        +{lista.length - PUNTOS_VISIBLES}
                      </span>
                    )}
                  </span>
                )}

                {/* El título de la primera entrada, si la celda da espacio. Es
                    lo que convierte la rejilla en algo legible de un vistazo. */}
                {lista.length > 0 && (
                  <span className="hidden w-full truncate text-[11px] leading-tight text-muted-foreground lg:block">
                    {lista[0].titulo}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel del día — #454 */}
      <SidePanel
        open={diaAbierto !== null}
        onOpenChange={(v) => !v && setDiaAbierto(null)}
      >
        <SidePanelContent etiquetaCerrar={textos.cerrar}>
          <SidePanelHeader>
            <SidePanelTitle>
              {diaAbierto ? nombreDeDia(diaAbierto) : ""}
            </SidePanelTitle>
            <SidePanelDescription>
              {textos.resumenDia.replace("{n}", String(delDia.length))}
            </SidePanelDescription>
          </SidePanelHeader>

          <SidePanelBody className="space-y-2">
            {delDia.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {textos.diaVacio}
              </p>
            ) : (
              delDia.map((e) => (
                <LineaEntrada
                  key={`${e.origen}-${e.id}`}
                  entrada={e}
                  textos={textos}
                  vencida={
                    e.origen === "tarea" &&
                    e.estado !== "completada" &&
                    e.fecha < hoy
                  }
                />
              ))
            )}
          </SidePanelBody>
        </SidePanelContent>
      </SidePanel>
    </>
  );
}
