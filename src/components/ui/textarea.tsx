/**
 * Textarea — campo de texto multilínea. Mismos estados visuales que `Input`
 * para que un formulario mixto se lea como una sola cosa.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-20 w-full rounded-md border border-input bg-surface px-3 py-2 text-[15px] leading-relaxed",
        "transition-[border-color,box-shadow] duration-150 ease-out",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/25",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
