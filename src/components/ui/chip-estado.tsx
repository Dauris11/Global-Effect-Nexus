/**
 * ChipEstado — etiqueta de estado del dominio.
 *
 * Acompaña siempre al riel: el color solo nunca comunica un estado, porque el
 * sistema muestra decisiones sobre notas y becas y hay usuarios con daltonismo.
 *
 * El texto llega ya traducido desde la pantalla que lo usa; este componente no
 * conoce los diccionarios de i18n.
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import { paletaDe, type EstadoDominio } from "@/lib/estados";

interface ChipEstadoProps extends React.ComponentProps<"span"> {
  estado: EstadoDominio;
  /** Muestra un punto sólido antes del texto (útil en tarjetas densas). */
  punto?: boolean;
}

function ChipEstado({
  estado,
  punto = false,
  className,
  children,
  ...props
}: ChipEstadoProps) {
  const p = paletaDe(estado);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        p.fondo,
        p.texto,
        className,
      )}
      {...props}
    >
      {punto && <span aria-hidden className={cn("size-1.5 rounded-full", p.solido)} />}
      {children}
    </span>
  );
}

export { ChipEstado };
