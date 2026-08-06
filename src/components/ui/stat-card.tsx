/**
 * StatCard — métrica destacada del dashboard. La cifra "cuenta" desde 0 al
 * montar (percepción de dato vivo), pero es una decoración: con
 * `prefers-reduced-motion` aparece directamente en su valor final. Cifras en
 * JetBrains Mono (tabulares) como marca el sistema tipográfico.
 */
"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Card } from "./card";
import { Icono } from "./icono";
import { cn } from "@/lib/utils";

/**
 * Acentos del azulejo del icono.
 *
 * `coral` y `gold` apuntaban a `bg-gold`, un token que no existe en el sistema
 * actual: las clases no generaban nada y el azulejo salía transparente. Se
 * sustituyen por los colores de estado que sí usa el resto del portal.
 */
const ACCENTS = {
  teal: "bg-primary/10 text-primary",
  esmeralda: "bg-emerald-100 text-emerald-600",
  ambar: "bg-amber-100 text-amber-600",
  rojo: "bg-red-100 text-red-500",
  neutral: "bg-muted text-muted-foreground",
} as const;

/** Conteo animado hasta `value` (ease-out, ~0.9 s). Salta al final si reduce. */
function useCountUp(value: number, enabled: boolean, duration = 900) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let start: number | null = null;
    const from = ref.current;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cúbico
      const current = from + (value - from) * eased;
      setDisplay(current); // dentro de rAF: asíncrono, no dispara render en cascada
      ref.current = current;
      if (p < 1) raf = requestAnimationFrame(step);
      else ref.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, enabled, duration]);

  // Con movimiento reducido devolvemos el valor final directamente (sin animar).
  return enabled ? display : value;
}

export function StatCard({
  label,
  value,
  format = "number",
  locale = "es",
  icon,
  accent = "teal",
  delta,
  hint,
  className,
}: {
  label: string;
  value: number;
  format?: "number" | "currency";
  locale?: string;
  /**
   * Nombre del icono en el registro (`components/ui/icono.tsx`), no el
   * componente: este es un componente cliente y React no serializa funciones
   * a través de la frontera del servidor.
   */
  icon?: string;
  accent?: keyof typeof ACCENTS;
  /** Variación respecto al periodo anterior (%). Positivo sube, negativo baja. */
  delta?: number;
  hint?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const display = useCountUp(value, !reduce);

  const fmt = new Intl.NumberFormat(locale, {
    style: format === "currency" ? "currency" : "decimal",
    currency: "DOP",
    maximumFractionDigits: format === "currency" ? 0 : 0,
  });

  const up = (delta ?? 0) >= 0;

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && (
          <span className={cn("flex size-9 items-center justify-center rounded-lg", ACCENTS[accent])}>
            <Icono nombre={icon} className="size-4" />
          </span>
        )}
      </div>
      <div className="mt-3 tabular-nums text-3xl font-semibold tabular-nums tracking-tight text-foreground">
        {fmt.format(Math.round(display))}
      </div>
      {(delta !== undefined || hint) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {delta !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                up ? "text-flujo-ingreso" : "text-flujo-egreso",
              )}
            >
              {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {Math.abs(delta)}%
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </Card>
  );
}
