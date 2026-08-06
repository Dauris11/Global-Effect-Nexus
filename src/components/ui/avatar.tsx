/**
 * Avatar y AvatarGroup — identidad de una persona en listas y tarjetas.
 *
 * La foto es opcional: en esta plataforma la mayoría de los usuarios no tiene
 * una, así que el respaldo por iniciales es el caso normal, no el degradado.
 * El color de fondo se deriva del nombre para que la misma persona salga
 * siempre del mismo color y se reconozca sin leer.
 */
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

/**
 * Paleta de respaldo: los seis tonos de identidad de la capa 3
 * (`--identidad-N` en globals.css). Aquí no hay ningún color escrito: el
 * componente solo nombra la familia, y el tema —claro u oscuro— resuelve el
 * valor.
 */
const TONOS = [
  "bg-identidad-1-suave text-identidad-1",
  "bg-identidad-2-suave text-identidad-2",
  "bg-identidad-3-suave text-identidad-3",
  "bg-identidad-4-suave text-identidad-4",
  "bg-identidad-5-suave text-identidad-5",
  "bg-identidad-6-suave text-identidad-6",
];

/** Hash estable del nombre → índice de tono. Misma persona, mismo color. */
function tonoDe(nombre: string): string {
  let suma = 0;
  for (let i = 0; i < nombre.length; i++) suma = (suma + nombre.charCodeAt(i)) % 997;
  return TONOS[suma % TONOS.length];
}

/** Iniciales: primera letra del nombre y del primer apellido. */
export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

const TAMANOS = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
} as const;

interface AvatarProps {
  /** Nombre completo. Genera iniciales, color y texto accesible. */
  nombre: string;
  /** URL de la foto, si existe. */
  src?: string | null;
  tamano?: keyof typeof TAMANOS;
  className?: string;
}

function Avatar({ nombre, src, tamano = "md", className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        TAMANOS[tamano],
        className,
      )}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={nombre}
          className="aspect-square size-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        delayMs={src ? 300 : 0}
        className={cn(
          "flex size-full items-center justify-center rounded-full font-semibold",
          tonoDe(nombre),
        )}
      >
        <span aria-hidden>{iniciales(nombre)}</span>
        <span className="sr-only">{nombre}</span>
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

interface AvatarGroupProps {
  personas: { nombre: string; src?: string | null }[];
  /** Cuántos se muestran antes de resumir en "+N". Asana usa 3; nosotros igual. */
  maximo?: number;
  tamano?: keyof typeof TAMANOS;
  className?: string;
}

/** Avatares apilados con resumen "+N" — patrón de asignación múltiple (§10). */
function AvatarGroup({
  personas,
  maximo = 3,
  tamano = "sm",
  className,
}: AvatarGroupProps) {
  const visibles = personas.slice(0, maximo);
  const resto = personas.length - visibles.length;

  return (
    <div className={cn("flex items-center", className)}>
      {visibles.map((p, i) => (
        <Avatar
          key={`${p.nombre}-${i}`}
          nombre={p.nombre}
          src={p.src}
          tamano={tamano}
          className={cn("ring-2 ring-surface", i > 0 && "-ml-2")}
        />
      ))}
      {resto > 0 && (
        <span
          className={cn(
            "-ml-2 flex items-center justify-center rounded-full bg-muted tabular-nums font-medium text-muted-foreground ring-2 ring-surface",
            TAMANOS[tamano],
          )}
        >
          +{resto}
        </span>
      )}
    </div>
  );
}

export { Avatar, AvatarGroup };
