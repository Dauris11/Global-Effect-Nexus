/**
 * Evolución del GPA por cuatrimestre — ClickUp S5 · #208.
 *
 * Una línea, no barras: lo que importa aquí es la tendencia de una persona a lo
 * largo del tiempo, y la línea es la forma que lee eso de un vistazo.
 *
 * Cada punto lleva el color de SU banda (excelente/buena/riesgo/crítica), así
 * que un cuatrimestre en el que el joven cayó a riesgo se ve rojo aunque el
 * resto de la línea vaya bien. El trazo se queda en el azul del sistema para
 * no competir con esa señal.
 *
 * El eje Y va fijo de 0 a 4 —la escala real del GPA— y no ajustado a los datos:
 * con eje automático, pasar de 3.9 a 3.8 dibujaría un desplome, y eso miente.
 */
"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReducedMotion } from "motion/react";
import { bandaDeGpa, variableDe } from "@/lib/estados";
import type { PuntoHistorial } from "@/server/estudiantes/types";

/** Umbral de prueba académica: GPA 2.0 sobre 4. */
const UMBRAL_RIESGO = 2;

export function GraficoGpa({
  datos,
  textos,
}: {
  datos: PuntoHistorial[];
  /** `subjects` es solo el sustantivo ("materias"); la cifra la pone el gráfico. */
  textos: { gpa: string; subjects: string; threshold: string };
}) {
  const reduce = useReducedMotion();

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="cuatrimestre"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          />
          <YAxis
            domain={[0, 4]}
            ticks={[0, 1, 2, 3, 4]}
            tickLine={false}
            axisLine={false}
            width={40}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          />

          {/* La línea de prueba académica: sin ella, un 2.1 y un 1.9 se ven
              igual de bien en el gráfico, y no lo son. */}
          <ReferenceLine
            y={UMBRAL_RIESGO}
            stroke={variableDe("nota-riesgo")}
            strokeDasharray="4 4"
            label={{
              value: textos.threshold,
              position: "insideBottomLeft",
              fill: "var(--color-muted-foreground)",
              fontSize: 10,
            }}
          />

          <Tooltip
            formatter={(v, _n, item) => [
              `${Number(v).toFixed(2)} · ${
                (item?.payload as PuntoHistorial | undefined)?.materias ?? 0
              } ${textos.subjects}`,
              textos.gpa,
            ]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              background: "var(--color-popover)",
              color: "var(--color-popover-foreground)",
              fontSize: 12,
            }}
            cursor={{ stroke: "var(--color-border)" }}
          />

          <Line
            type="monotone"
            dataKey="gpa"
            name={textos.gpa}
            stroke="var(--color-primary)"
            strokeWidth={2}
            isAnimationActive={!reduce}
            animationDuration={700}
            // El punto se pinta con la banda de su propio valor.
            dot={({ cx, cy, payload, index }) => (
              <circle
                key={index}
                cx={cx}
                cy={cy}
                r={4}
                fill={variableDe(bandaDeGpa((payload as PuntoHistorial).gpa))}
                stroke="var(--color-surface)"
                strokeWidth={2}
              />
            )}
            activeDot={{ r: 6, stroke: "var(--color-surface)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
