/**
 * Rail — el riel de estado, firma del portal.
 *
 * Franja vertical de 3px en el borde izquierdo de una tarjeta o fila, coloreada
 * con el estado principal del registro. Permite leer el estado de veinte
 * registros recorriendo el borde con la vista, sin leer ninguno.
 *
 * Se usa de dos formas:
 *   - `railClass(estado)` → clases para aplicar al contenedor (lo habitual).
 *   - `<Rail estado="..." />` → elemento suelto, cuando el contenedor ya tiene
 *     bordes propios y no puede llevar el suyo.
 *
 * Reglas (docs/10-estandar-de-interfaz.md §5): un riel por registro, siempre a
 * la izquierda, y nunca como único portador del significado — el mismo estado
 * debe aparecer también como chip o texto.
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import { paletaDe, type EstadoDominio } from "@/lib/estados";

/** Clases del riel para aplicar directamente al contenedor del registro. */
export function railClass(estado: EstadoDominio): string {
  return cn("border-l-[3px]", paletaDe(estado).riel);
}

function Rail({
  estado,
  className,
}: {
  estado: EstadoDominio;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute inset-y-0 left-0 w-[3px] rounded-l-[inherit]",
        paletaDe(estado).solido,
        className,
      )}
    />
  );
}

export { Rail };
