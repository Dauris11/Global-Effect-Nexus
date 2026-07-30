/**
 * BalanceChart — área de ingresos vs. egresos de los últimos meses (Recharts).
 * Colores de marca vía variables CSS (se adapta a claro/oscuro). El trazo se
 * dibuja con la animación por defecto de Recharts (discreta); se desactiva con
 * `prefers-reduced-motion`.
 */
"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReducedMotion } from "motion/react";
import type { PuntoBalance } from "@/server/dashboard/queries";

/**
 * Nombre corto del mes en el idioma activo.
 *
 * Antes había una lista de meses en español escrita a mano; con la interfaz en
 * dos idiomas, `Intl` lo resuelve sin diccionario propio. El día 15 evita el
 * clásico salto de mes al construir la fecha.
 */
function etiquetaMes(mes: string, locale: string) {
  const [a, m] = mes.split("-").map(Number);
  if (!a || !m) return mes;
  return new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(a, m - 1, 15));
}

export function BalanceChart({
  data,
  locale,
  textos,
}: {
  data: PuntoBalance[];
  locale: string;
  /** Nombres de las series, traducidos en el servidor. */
  textos: { ingresos: string; egresos: string };
}) {
  const reduce = useReducedMotion();
  const chartData = data.map((d) => ({ ...d, label: etiquetaMes(d.mes, locale) }));
  const fmt = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="fillIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fillEgresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-accent)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--color-brand-accent)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))}
          />
          <Tooltip
            formatter={(v) => fmt.format(Number(v))}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              background: "var(--color-popover)",
              color: "var(--color-popover-foreground)",
              fontSize: 12,
            }}
            cursor={{ stroke: "var(--color-border)" }}
          />
          <Area
            type="monotone"
            dataKey="ingresos"
            name={textos.ingresos}
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#fillIngresos)"
            isAnimationActive={!reduce}
            animationDuration={700}
          />
          <Area
            type="monotone"
            dataKey="egresos"
            name={textos.egresos}
            stroke="var(--color-brand-accent)"
            strokeWidth={2}
            fill="url(#fillEgresos)"
            isAnimationActive={!reduce}
            animationDuration={700}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
