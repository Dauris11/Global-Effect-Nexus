/**
 * LineaEntrada — una fila del calendario: un evento o una tarea con fecha.
 *
 * La comparten el panel del día (cliente) y la agenda de 30 días (servidor),
 * así que no usa hooks ni marca `"use client"`: es presentación pura y funciona
 * a los dos lados de la frontera. Es también lo que garantiza que la misma
 * tarea se lea igual en las dos vistas.
 */
import { CalendarDays, Clock, ListChecks, MapPin, Folder } from "lucide-react";
import type { EntradaAgenda } from "@/server/operaciones/types";
import { bandaDeEvento, bandaDePrioridad, paletaDe } from "@/lib/estados";
import { cn } from "@/lib/utils";
import { ChipEstado } from "@/components/ui/chip-estado";

/** Textos que la fila necesita ya traducidos. */
export interface TextosEntrada {
  todoElDia: string;
  origenEvento: string;
  origenTarea: string;
  prioridad: Record<string, string>;
  tipoEvento: Record<string, string>;
  vencida: string;
}

/**
 * Color de la fila. Una tarea lleva el de su prioridad —el mismo de su riel en
 * el tablero, para que se reconozca entre pantallas— y un evento el de su
 * estado (§3.2 y `lib/estados.ts`).
 */
export function bandaDeEntrada(e: EntradaAgenda) {
  return e.origen === "tarea" ? bandaDePrioridad(e.categoria) : bandaDeEvento(e.estado);
}

export function LineaEntrada({
  entrada,
  textos,
  vencida = false,
  className,
}: {
  entrada: EntradaAgenda;
  textos: TextosEntrada;
  /** Marca la tarea cuya fecha límite ya pasó y sigue abierta. */
  vencida?: boolean;
  className?: string;
}) {
  const banda = bandaDeEntrada(entrada);
  const esTarea = entrada.origen === "tarea";
  const Icono = esTarea ? ListChecks : CalendarDays;

  const etiqueta = esTarea
    ? (textos.prioridad[entrada.categoria] ?? entrada.categoria)
    : (textos.tipoEvento[entrada.categoria] ?? entrada.categoria);

  return (
    <article
      className={cn(
        "rounded-md border border-border border-l-[3px] bg-surface p-3",
        paletaDe(banda).riel,
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <Icono
          className={cn("mt-0.5 size-4 shrink-0", paletaDe(banda).texto)}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-foreground">
            {entrada.titulo}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-mono text-xs tabular-nums">
              <Clock className="size-3" aria-hidden />
              {entrada.hora_inicio ?? textos.todoElDia}
            </span>

            {entrada.ubicacion && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" aria-hidden />
                {entrada.ubicacion}
              </span>
            )}

            {entrada.proyecto_nombre && (
              <span className="inline-flex items-center gap-1">
                <Folder className="size-3" aria-hidden />
                {entrada.proyecto_nombre}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <ChipEstado estado={banda} punto>
            {etiqueta}
          </ChipEstado>
          {vencida && (
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-destructive">
              {textos.vencida}
            </span>
          )}
        </div>
      </div>

      {/* Lectores de pantalla: de qué tabla viene la fila, que el icono no dice. */}
      <span className="sr-only">
        {esTarea ? textos.origenTarea : textos.origenEvento}
      </span>
    </article>
  );
}
