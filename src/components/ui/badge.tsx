/**
 * Badge — etiqueta compacta de categoría o estado genérico.
 *
 * Para un estado del dominio (nota, flujo, prioridad, tarea) usa `ChipEstado`,
 * que sale del mapa único de `lib/estados.ts`. Este componente cubre el resto:
 * conteos, categorías y estados sin color propio en el sistema.
 *
 * Las variantes semánticas de abajo se apoyan en los tokens de dominio, no en
 * la paleta cruda de Tailwind, para que un "success" aquí sea exactamente el
 * mismo verde que un aprobado en una tabla de notas.
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        neutral: "border-border bg-muted text-muted-foreground",
        outline: "border-border text-foreground",
        accent: "border-transparent bg-gold/12 text-gold",
        // Semánticos — alineados con los tokens de dominio (capa 3).
        success: "border-transparent bg-nota-excelente-suave text-nota-excelente",
        info: "border-transparent bg-nota-buena-suave text-nota-buena",
        warning: "border-transparent bg-nota-riesgo-suave text-nota-riesgo",
        danger: "border-transparent bg-nota-critica-suave text-nota-critica",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
