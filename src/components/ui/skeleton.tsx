/**
 * Skeleton — marcador de posición durante la carga. El barrido de brillo
 * (`.animate-shimmer`, definido en globals.css) mejora la percepción de
 * velocidad; se detiene con `prefers-reduced-motion`.
 */
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-shimmer rounded-md bg-muted/70", className)}
      {...props}
    />
  );
}

export { Skeleton };
