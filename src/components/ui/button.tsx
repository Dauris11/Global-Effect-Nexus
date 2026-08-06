/**
 * Componente Button (shadcn/ui sobre Radix Slot). Botón accesible con
 * variantes y tamaños gestionados con class-variance-authority. `asChild`
 * permite renderizar otro elemento (p. ej. un enlace) conservando el estilo.
 *
 * Sistema "Esperanza": radios de 12px, sombras cálidas de baja opacidad y
 * transiciones de 150–200ms. Ningún glow.
 *
 * La variante `gold` existe para lo asociado a aporte, beca o patrocinio.
 * Lleva texto oscuro porque el dorado no alcanza contraste AA con blanco
 * (2.25); con `--gold-foreground` encima sube a 7.55.
 */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-lg text-sm font-medium",
    "transition-[color,background-color,border-color,box-shadow] duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-600 hover:shadow-sm",
        gold: "bg-gold text-gold-foreground shadow-xs hover:brightness-95 hover:shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:brightness-95",
        outline:
          "border border-border bg-card text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground hover:border-primary/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-600",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 rounded-md px-3 text-[0.8125rem]",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
        "icon-sm": "size-9 rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { Button, buttonVariants };
