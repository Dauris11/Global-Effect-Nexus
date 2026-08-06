/**
 * Detalle de una tarea en panel lateral — patrón Asana (estándar §10).
 *
 * Entra desde la derecha y deja el tablero visible detrás, para que revisar
 * cinco tareas seguidas no obligue a abrir y cerrar cinco veces.
 */
"use client";

import * as React from "react";
import { CalendarDays, Folder, Users } from "lucide-react";
import type { TareaTablero } from "@/server/operaciones/types";
import { bandaDePrioridad, bandaDeTarea } from "@/lib/estados";
import { ChipEstado } from "@/components/ui/chip-estado";
import { Avatar } from "@/components/ui/avatar";
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelBody,
  SidePanelTitle,
} from "@/components/ui/side-panel";
import { estadoDeVencimiento, formatearFecha, type TextosTablero } from "./tablero";
import { cn } from "@/lib/utils";

interface PanelTareaProps {
  tarea: TareaTablero | null;
  abierto: boolean;
  onCerrar: () => void;
  locale: string;
  textos: TextosTablero;
}

export function PanelTarea({
  tarea,
  abierto,
  onCerrar,
  locale,
  textos,
}: PanelTareaProps) {
  if (!tarea) return null;

  const prioridad = bandaDePrioridad(tarea.prioridad);
  const estado = bandaDeTarea(tarea.estado);
  const vencimiento = estadoDeVencimiento(tarea.fecha_limite, tarea.estado);

  return (
    <SidePanel open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <SidePanelContent etiquetaCerrar={textos.cerrar}>
        <SidePanelHeader>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <ChipEstado estado={estado} punto>
              {textos.estado[tarea.estado] ?? tarea.estado}
            </ChipEstado>
            <ChipEstado estado={prioridad} punto>
              {textos.prioridad[tarea.prioridad] ?? tarea.prioridad}
            </ChipEstado>
            <ChipEstado estado="neutral">
              {textos.visibilidad[tarea.visibilidad] ?? tarea.visibilidad}
            </ChipEstado>
          </div>
          <SidePanelTitle>{tarea.titulo}</SidePanelTitle>
        </SidePanelHeader>

        <SidePanelBody className="space-y-6">
          <Dato icono={Folder} etiqueta={textos.proyecto}>
            {tarea.proyecto_nombre ?? (
              <span className="text-muted-foreground">{textos.sinProyecto}</span>
            )}
          </Dato>

          <Dato icono={CalendarDays} etiqueta={textos.fechaLimite}>
            {tarea.fecha_limite ? (
              <span
                className={cn(
                  "tabular-nums tabular-nums",
                  vencimiento === "vencida" && "font-semibold text-destructive",
                  vencimiento === "hoy" && "font-semibold text-amber-600",
                )}
              >
                {formatearFecha(tarea.fecha_limite, locale)}
                {vencimiento === "vencida" && ` · ${textos.vencida}`}
                {vencimiento === "hoy" && ` · ${textos.hoy}`}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </Dato>

          <Dato icono={Users} etiqueta={textos.asignados}>
            {tarea.asignados.length > 0 ? (
              <ul className="space-y-2">
                {tarea.asignados.map((a) => (
                  <li key={a.id} className="flex items-center gap-2">
                    <Avatar nombre={a.nombre} tamano="sm" />
                    <span>{a.nombre}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-muted-foreground">{textos.sinAsignar}</span>
            )}
          </Dato>

          {tarea.descripcion && (
            <div className="space-y-2">
              <p className="tabular-nums text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {textos.descripcion}
              </p>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                {tarea.descripcion}
              </p>
            </div>
          )}
        </SidePanelBody>
      </SidePanelContent>
    </SidePanel>
  );
}

/** Fila etiqueta/valor del panel. */
function Dato({
  icono: Icono,
  etiqueta,
  children,
}: {
  icono: React.ComponentType<{ className?: string }>;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icono className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="tabular-nums text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          {etiqueta}
        </p>
        <div className="text-[15px] text-foreground">{children}</div>
      </div>
    </div>
  );
}
