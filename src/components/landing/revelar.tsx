/**
 * `Revelar` — entrada de un bloque cuando llega a la pantalla.
 *
 * Existe por un problema concreto de la landing: es una página larga y, al
 * desplazarse, todo estaba ya ahí. Nada indicaba que se había llegado a una
 * sección nueva, así que las seis se leían como un solo muro. Con esto cada
 * bloque entra al aparecer y el desplazamiento gana ritmo.
 *
 * Reglas de movimiento que se respetan:
 *
 * - Entrada `translateY + fade`, nunca desde `scale(0)`.
 * - 400ms como máximo, con `--ease-out` escrito como curva de Motion.
 * - `once: true`: solo en la primera aparición. Un bloque que se re-anima cada
 *   vez que pasa por la pantalla marea y no comunica nada nuevo.
 * - El *stagger* de listas se pasa con `retardo` (30–80ms por elemento).
 * - `LazyMotion + domAnimation + m`, nunca el motor completo.
 *
 * Sobre movimiento reducido: la regla global de `globals.css` solo alcanza a CSS.
 * Motion anima desde JavaScript, así que hay que apagarlo aquí — y se apaga
 * quitando el estado inicial, no cambiando de elemento, para que el árbol que
 * hidrata sea el mismo que el que se sirvió.
 */
"use client";

import type { ReactNode } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

const CURVA = [0.23, 1, 0.32, 1] as const;

export function Revelar({
  children,
  /** Retardo en segundos. Para el stagger de una lista: 0.04 × índice. */
  retardo = 0,
  /** Desplazamiento de entrada en px. */
  y = 14,
  /** Elemento a renderizar. `li` para que el hijo siga siendo ítem de la rejilla. */
  como = "div",
  className,
}: {
  children: ReactNode;
  retardo?: number;
  y?: number;
  como?: "div" | "li";
  className?: string;
}) {
  const reducido = useReducedMotion();
  const Elemento = como === "li" ? m.li : m.div;

  return (
    <LazyMotion features={domAnimation}>
      <Elemento
        className={className}
        initial={reducido ? false : { opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.4, ease: CURVA, delay: reducido ? 0 : retardo }}
      >
        {children}
      </Elemento>
    </LazyMotion>
  );
}
