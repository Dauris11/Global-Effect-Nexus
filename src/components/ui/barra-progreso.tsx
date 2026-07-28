/**
 * BarraProgreso — avance de 0 a 100.
 *
 * Se usa en proyectos (tareas cerradas sobre el total) y en el avance
 * académico. Expone `role="progressbar"` con sus valores ARIA para que un
 * lector de pantalla anuncie el porcentaje: la barra sola no dice nada.
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import { paletaDe, type EstadoDominio } from "@/lib/estados";

interface BarraProgresoProps {
  /** Porcentaje 0–100. Se recorta al rango si llega fuera. */
  valor: number;
  /** Color de la barra; por defecto el primario. */
  estado?: EstadoDominio;
  /** Descripción accesible: qué está avanzando. */
  etiqueta: string;
  /** Muestra el porcentaje en cifra a la derecha. */
  mostrarCifra?: boolean;
  className?: string;
}

function BarraProgreso({
  valor,
  estado,
  etiqueta,
  mostrarCifra = false,
  className,
}: BarraProgresoProps) {
  const pct = Math.max(0, Math.min(100, Math.round(valor)));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={etiqueta}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-250 ease-out",
            estado ? paletaDe(estado).solido : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {mostrarCifra && (
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
          {pct}%
        </span>
      )}
    </div>
  );
}

export { BarraProgreso };
