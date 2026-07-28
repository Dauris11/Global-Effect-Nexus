/**
 * Dock — riel de iconos con ampliación al acercar el puntero.
 *
 * Adaptación del dock de ibelick (21st.dev) a este sistema. Tres cambios de
 * fondo respecto al original:
 *
 * 1. **Vertical.** El original es horizontal (dock de macOS). Aquí el eje es la
 *    Y y lo que crece es el alto: el portal ya organiza la navegación en
 *    columna y un riel horizontal pelearía con esa lectura.
 * 2. **`motion`, no `framer-motion`.** Es la misma biblioteca con el nombre
 *    nuevo y ya está en el proyecto; añadir `framer-motion` habría metido una
 *    segunda copia. Se usa `LazyMotion + m` como exige el estándar (§7): el
 *    motor completo son ~34 kB que no hacen falta.
 * 3. **Sin `cloneElement`.** El original inyectaba props en los hijos clonando
 *    elementos, lo que obliga a castear a `any` y rompe si alguien envuelve un
 *    hijo. Aquí el ítem publica su estado por contexto y cada pieza lo lee.
 *
 * Accesibilidad: la ampliación es decorativa —el objetivo táctil real nunca
 * baja de 40px— y con `prefers-reduced-motion` se desactiva por completo, así
 * que el riel queda como una lista de iconos normal. La etiqueta sale también
 * con el foco de teclado, no solo al pasar el ratón.
 */
"use client";

import * as React from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
  type SpringOptions,
} from "motion/react";
import { cn } from "@/lib/utils";

/** Tamaño en reposo del icono, en píxeles. Es el objetivo táctil mínimo (§8). */
const BASE = 44;
/** Tamaño del icono justo bajo el puntero. */
const AMPLIADO = 72;
/** Radio de influencia del puntero, en píxeles. */
const DISTANCIA = 140;

const MUELLE: SpringOptions = { mass: 0.1, stiffness: 150, damping: 12 };

interface ContextoDock {
  punteroY: MotionValue<number>;
  ampliado: number;
  distancia: number;
  reducido: boolean;
}
const DockContext = React.createContext<ContextoDock | null>(null);

function useDock(): ContextoDock {
  const ctx = React.useContext(DockContext);
  if (!ctx) throw new Error("DockItem debe usarse dentro de <Dock>");
  return ctx;
}

/** Estado que el ítem publica a su icono y a su etiqueta. */
interface ContextoItem {
  tamano: MotionValue<number>;
  activo: boolean;
}
const ItemContext = React.createContext<ContextoItem | null>(null);

function useItem(): ContextoItem {
  const ctx = React.useContext(ItemContext);
  if (!ctx) throw new Error("DockIcon y DockLabel deben usarse dentro de <DockItem>");
  return ctx;
}

// ---------------------------------------------------------------------------

export function Dock({
  children,
  className,
  ampliado = AMPLIADO,
  distancia = DISTANCIA,
}: {
  children: React.ReactNode;
  className?: string;
  ampliado?: number;
  distancia?: number;
}) {
  const punteroY = useMotionValue(Infinity);
  const reducido = useReducedMotion() ?? false;

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        onPointerMove={(e) => !reducido && punteroY.set(e.clientY)}
        onPointerLeave={() => punteroY.set(Infinity)}
        role="toolbar"
        aria-orientation="vertical"
        className={cn(
          "flex w-fit flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-2",
          className,
        )}
      >
        <DockContext.Provider value={{ punteroY, ampliado, distancia, reducido }}>
          {children}
        </DockContext.Provider>
      </m.div>
    </LazyMotion>
  );
}

export function DockItem({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { punteroY, ampliado, distancia, reducido } = useDock();
  const [activo, setActivo] = React.useState(false);

  /** Distancia vertical del puntero al centro del ítem. */
  const separacion = useTransform(punteroY, (y) => {
    const caja = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return y - caja.y - caja.height / 2;
  });

  const objetivo = useTransform(
    separacion,
    [-distancia, 0, distancia],
    [BASE, ampliado, BASE],
  );
  const conMuelle = useSpring(objetivo, MUELLE);
  // Con movimiento reducido el tamaño es constante: nada se mueve.
  const constante = useMotionValue(BASE);
  const tamano = reducido ? constante : conMuelle;

  return (
    <m.div
      ref={ref}
      style={{ width: tamano, height: tamano }}
      onHoverStart={() => setActivo(true)}
      onHoverEnd={() => setActivo(false)}
      onFocus={() => setActivo(true)}
      onBlur={() => setActivo(false)}
      className={cn("relative flex shrink-0 items-center justify-center", className)}
      {...(props as React.ComponentProps<typeof m.div>)}
    >
      <ItemContext.Provider value={{ tamano, activo }}>{children}</ItemContext.Provider>
    </m.div>
  );
}

export function DockIcon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { tamano } = useItem();
  // El glifo ocupa la mitad del ítem: crece con él sin tocar los bordes.
  const lado = useTransform(tamano, (v) => v / 2);

  return (
    <m.div
      style={{ width: lado, height: lado }}
      className={cn("flex items-center justify-center [&_svg]:size-full", className)}
    >
      {children}
    </m.div>
  );
}

/**
 * Etiqueta flotante. Sale a la derecha —no arriba— porque el riel es vertical:
 * encima taparía al vecino de arriba.
 */
export function DockLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { activo } = useItem();

  return (
    <AnimatePresence>
      {activo && (
        <m.span
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -4 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute left-full top-1/2 z-20 ml-3 -translate-y-1/2",
            "whitespace-nowrap rounded-md border border-border bg-surface-raised px-2 py-1",
            "text-xs font-medium text-foreground shadow-flotante",
            className,
          )}
        >
          {children}
        </m.span>
      )}
    </AnimatePresence>
  );
}
