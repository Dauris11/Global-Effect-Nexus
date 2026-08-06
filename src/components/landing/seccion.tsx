/**
 * Encabezado de sección de la landing.
 *
 * Existe para que las cuatro secciones abran igual. Antes cada una repetía su
 * eyebrow y su titular a mano y las diferencias de espaciado se acumulaban:
 * una página cuyas secciones no arrancan en el mismo sitio se lee como un
 * documento, no como un diseño.
 *
 * El motivo del filete corto antes del eyebrow es el único adorno del patrón, y
 * se repite en todas: es lo que marca "aquí empieza algo" sin necesidad de una
 * línea que cruce la página entera.
 */
import { cn } from "@/lib/utils";

export function SeccionEncabezado({
  eyebrow,
  titulo,
  intro,
  /** Id del `<h2>`, para el `aria-labelledby` de la sección que lo contiene. */
  idTitulo,
  /** `claro` sobre papel; `oscuro` sobre tinta. */
  tono = "claro",
  className,
}: {
  eyebrow: string;
  titulo: string;
  intro?: string;
  idTitulo?: string;
  tono?: "claro" | "oscuro";
  className?: string;
}) {
  return (
    <header className={cn("max-w-2xl", className)}>
      <p
        className={cn(
          "flex items-center gap-3 tabular-nums text-xs uppercase tracking-[0.15em]",
          tono === "claro" ? "text-primary" : "text-white/55",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "h-px w-6 shrink-0",
            tono === "claro" ? "bg-primary" : "bg-white/40",
          )}
        />
        {eyebrow}
      </p>

      <h2
        id={idTitulo}
        className={cn(
          "mt-4 font-display text-[clamp(2.2rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.025em]",
          tono === "claro" ? "text-foreground" : "text-white",
        )}
      >
        {titulo}
      </h2>

      {intro && (
        <p
          className={cn(
            "mt-5 text-xl leading-relaxed",
            tono === "claro" ? "text-muted-foreground" : "text-white/65",
          )}
        >
          {intro}
        </p>
      )}
    </header>
  );
}
