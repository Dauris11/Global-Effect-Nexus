/**
 * Badge — etiqueta compacta de estado. Incluye las variantes semánticas del
 * dominio (calificaciones y finanzas, ver docs/09-guia-de-diseno.md §3) para
 * que tablas y listas usen siempre el mismo código de color.
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
        accent: "border-transparent bg-brand-accent/12 text-brand-accent",
        // Semánticos — calificaciones
        success: "border-transparent bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
        info: "border-transparent bg-sky-500/12 text-sky-600 dark:text-sky-400",
        warning: "border-transparent bg-amber-500/14 text-amber-600 dark:text-amber-400",
        danger: "border-transparent bg-destructive/12 text-destructive",
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
