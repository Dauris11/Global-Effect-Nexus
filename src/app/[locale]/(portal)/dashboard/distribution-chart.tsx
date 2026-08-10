"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useReducedMotion } from "motion/react";

export function DistributionChart({
  becados,
  regulares,
  locale,
  textos,
}: {
  becados: number;
  regulares: number;
  locale: string;
  textos: { becados: string; regulares: string };
}) {
  const reduce = useReducedMotion();
  const data = [
    { name: textos.becados, value: becados, color: "var(--color-primary)" },
    { name: textos.regulares, value: regulares, color: "var(--color-muted-foreground, #94a3b8)" },
  ];

  return (
    <div className="h-64 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            isAnimationActive={!reduce}
            animationDuration={800}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--background)",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              color: "var(--foreground)",
              fontSize: "0.875rem",
            }}
            itemStyle={{ color: "var(--foreground)" }}
            formatter={(value: any) => {
              const val = Number(value) || 0;
              const total = becados + regulares;
              const percent = total > 0 ? Math.round((val / total) * 100) : 0;
              return [`${val} (${percent}%)`, ""];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Centro del gráfico (Donut) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold tabular-nums text-foreground">{becados + regulares}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total</span>
      </div>
    </div>
  );
}
