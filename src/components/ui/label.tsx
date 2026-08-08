/**
 * Label — etiqueta de campo. Usa Radix para garantizar la asociación real
 * `label`/control (no un `div` que parece etiqueta), requisito del piso de
 * accesibilidad del estándar (§8).
 */
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "text-sm font-medium leading-none text-foreground",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
