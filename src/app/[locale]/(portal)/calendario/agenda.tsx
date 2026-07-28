/**
 * Agenda combinada de los próximos 30 días — ClickUp S9 · #455.
 *
 * Responde a "qué me viene encima", que es una pregunta distinta a la del mes:
 * aquí el orden es cronológico y continuo, sin celdas vacías. Eventos y tareas
 * van mezclados porque al usuario le da igual de qué tabla salen.
 *
 * Es un componente de servidor: no tiene interacción, así que no viaja al
 * cliente. Los primeros dos días se nombran "Hoy" y "Mañana" en vez de por su
 * fecha, que es como los nombra la gente.
 */
import { CalendarCheck2 } from "lucide-react";
import type { EntradaAgenda } from "@/server/operaciones/types";
import { EmptyState } from "@/components/ui/empty-state";
import { hoyISO, aFecha } from "./fechas";
import { LineaEntrada, type TextosEntrada } from "./linea-entrada";

export interface TextosAgenda extends TextosEntrada {
  hoy: string;
  manana: string;
  vacio: string;
  vacioAyuda: string;
}

export function Agenda({
  entradas,
  locale,
  textos,
}: {
  entradas: EntradaAgenda[];
  locale: string;
  textos: TextosAgenda;
}) {
  if (entradas.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheck2}
        title={textos.vacio}
        description={textos.vacioAyuda}
      />
    );
  }

  // Agrupación por día conservando el orden que ya trae la consulta.
  const dias: { fecha: string; entradas: EntradaAgenda[] }[] = [];
  for (const e of entradas) {
    const ultimo = dias[dias.length - 1];
    if (ultimo && ultimo.fecha === e.fecha) ultimo.entradas.push(e);
    else dias.push({ fecha: e.fecha, entradas: [e] });
  }

  const hoy = hoyISO();
  const manana = (() => {
    const d = aFecha(hoy);
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
  })();

  const fmt = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="space-y-6">
      {dias.map((dia, i) => (
        <section key={dia.fecha} className="space-y-2">
          <h3 className="flex items-baseline gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {dia.fecha === hoy
                ? textos.hoy
                : dia.fecha === manana
                  ? textos.manana
                  : fmt.format(aFecha(dia.fecha))}
            </span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground/70">
              {dia.entradas.length}
            </span>
          </h3>

          <div
            className="animate-fade-up space-y-2"
            style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
          >
            {dia.entradas.map((e) => (
              <LineaEntrada
                key={`${e.origen}-${e.id}`}
                entrada={e}
                textos={textos}
                vencida={
                  e.origen === "tarea" && e.estado !== "completada" && e.fecha < hoy
                }
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
