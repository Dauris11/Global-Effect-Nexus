/**
 * Banner de rol — la cabecera que abre cada portal interno.
 *
 * Es lo que identifica en qué portal está la persona sin tener que leer la
 * URL: el degradado y el icono cambian por rol, y los tres KPI de abajo
 * responden la primera pregunta de cada perfil ("¿cómo voy?") antes de que
 * tenga que navegar a ningún sitio.
 *
 * Los degradados llegan como clase literal completa (`from-x to-y`) porque
 * Tailwind no genera clases construidas por concatenación.
 */
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KpiBanner {
  valor: string;
  label: string;
  /** Clase de color para el valor; por defecto hereda el blanco del banner. */
  tono?: string;
}

export function BannerRol({
  icono: Icono,
  titulo,
  subtitulo,
  gradiente,
  kpis,
  eyebrow,
  iconoEyebrow: IconoEyebrow,
  insignia,
  padding = "p-5",
  kpisEnvueltos = false,
}: {
  icono: LucideIcon;
  titulo: string;
  subtitulo: string;
  gradiente: string;
  kpis: KpiBanner[];
  eyebrow?: string;
  iconoEyebrow?: LucideIcon;
  insignia?: string;
  padding?: string;
  /** Contabilidad envuelve sus KPI en vez de repartirlos con divisores. */
  kpisEnvueltos?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl text-white", gradiente, padding)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20"
          >
            <Icono className="h-5 w-5" />
          </span>

          <div>
            {eyebrow && (
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-white/70">
                {IconoEyebrow && <IconoEyebrow aria-hidden className="h-4 w-4" />}
                {eyebrow}
              </p>
            )}
            <h1 className="font-heading text-xl font-bold">{titulo}</h1>
            <p className="mt-0.5 text-sm text-white/70">{subtitulo}</p>
          </div>
        </div>

        {insignia && (
          <span className="shrink-0 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-medium">
            {insignia}
          </span>
        )}
      </div>

      <div
        className={cn(
          "mt-4 flex items-center border-t border-white/20 pt-4",
          kpisEnvueltos ? "flex-wrap gap-4" : "gap-4",
        )}
      >
        {kpis.map((k, i) => (
          <div key={k.label} className="flex items-center gap-4">
            {i > 0 && <span aria-hidden className="h-8 w-px bg-white/20" />}
            <div>
              <p className={cn("text-2xl font-bold", k.tono)}>{k.valor}</p>
              <p className="text-xs text-white/70">{k.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
