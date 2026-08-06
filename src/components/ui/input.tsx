/**
 * Input — campo de texto de una línea.
 *
 * Altura 40px (`h-10`), la del estándar para controles; la variante compacta
 * (`h-8`) se reserva para barras de herramientas densas. El anillo de foco es
 * obligatorio.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[15px]",
        "transition-[border-color,box-shadow] duration-150 ease-out",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/25",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
