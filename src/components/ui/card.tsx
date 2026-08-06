/**
 * Card — superficie base del portal (patrón shadcn/ui adaptado a los tokens
 * "Impact Editorial"). Fondo `card`, borde suave y esquinas redondeadas
 * (radio de marca) para la sensación cálida/suave que pide la Fundación.
 *
 * `interactive` activa una microinteracción discreta (elevación + borde teal)
 * para tarjetas que son enlaces o botones; en el resto no hay movimiento.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

function Card({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-2xl dark:rounded-[24px] border border-border dark:border-white/5 bg-card dark:bg-white/[0.03] dark:backdrop-blur-2xl text-card-foreground shadow-sm dark:shadow-lg overflow-hidden relative",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:hover:shadow-xl dark:hover:bg-white/[0.05]",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 p-5", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("font-heading text-lg font-semibold leading-tight tracking-tight", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("p-5 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-2 p-5 pt-0", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
