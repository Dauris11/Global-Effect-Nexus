/**
 * LienzoTrazo — estela de líneas que sigue al puntero, dibujada en `<canvas>`.
 *
 * Reimplementación del efecto "canvas" de 21st.dev. Se conservó la física
 * —N líneas de muelles amortiguados que persiguen al puntero con retardo
 * creciente— y se rehízo todo lo demás, porque el original tenía problemas que
 * en esta aplicación se notarían:
 *
 * - **Nunca se detenía.** No cancelaba el `requestAnimationFrame` ni quitaba los
 *   listeners, así que seguía pintando después de desmontarse. En una SPA eso es
 *   un bucle de animación por cada visita a la página.
 * - **`blur` ponía `running = true`.** Estaba invertido: al perder el foco la
 *   pestaña seguía consumiendo CPU en lugar de pararse.
 * - **Estado global y `getElementById("canvas")`.** Dos instancias en la misma
 *   página se pisaban. Aquí todo vive en refs del componente.
 * - **Escuchaba en `document`** y bloqueaba el desplazamiento táctil con
 *   `preventDefault()`. Ahora escucha en su propio contenedor y no interfiere.
 * - **Neón aditivo** (`lighter` + `hsla(...,100%,50%)`): un arcoíris pensado
 *   para fondo negro que sobre papel se lava a blanco. Nuestra versión es tinta
 *   sobre papel: un solo color de marca, alfa muy baja, `source-over`.
 *
 * Además: respeta `prefers-reduced-motion`, se pausa cuando sale de la pantalla
 * o la pestaña se oculta, y escala por `devicePixelRatio` para no verse borroso.
 *
 * Es decoración: `aria-hidden` y `pointer-events-none`. La página funciona
 * igual sin él (docs/10-estandar-de-interfaz.md §7 y §8).
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Parámetros de la física. Los del original, que están bien calibrados. */
const FISICA = {
  lineas: 40, // el original usaba 80; con 40 se ve igual y cuesta la mitad
  nodos: 30, // nodos por línea (original: 50)
  friccion: 0.5,
  amortiguacion: 0.025,
  tension: 0.99,
  grosor: 10,
  /**
   * Opacidad de cada línea. Muy baja: el trazo nace de la acumulación de las 40.
   *
   * Estuvo en 0.035 y sobre el papel neutro (#f5f5f5) no se veía: el efecto
   * existía y nadie lo notaba, que en la práctica es no tenerlo. 0.055 es el
   * punto en el que el trazo se lee como tinta y todavía deja el titular
   * completamente legible por encima.
   */
  alfa: 0.055,
} as const;

interface Nodo {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** Una línea de la estela: cadena de nodos unidos por muelles. */
class Linea {
  nodos: Nodo[];
  muelle: number;
  friccion: number;

  constructor(muelle: number, x: number, y: number) {
    // La variación por línea es lo que abre el abanico de la estela.
    this.muelle = muelle + 0.1 * Math.random() - 0.05;
    this.friccion = FISICA.friccion + 0.01 * Math.random() - 0.005;
    this.nodos = Array.from({ length: FISICA.nodos }, () => ({ x, y, vx: 0, vy: 0 }));
  }

  actualizar(px: number, py: number) {
    let muelle = this.muelle;
    const n = this.nodos;

    // El primer nodo persigue al puntero; cada siguiente persigue al anterior.
    n[0].vx += (px - n[0].x) * muelle;
    n[0].vy += (py - n[0].y) * muelle;

    for (let i = 0; i < n.length; i++) {
      const nodo = n[i];
      if (i > 0) {
        const previo = n[i - 1];
        nodo.vx += (previo.x - nodo.x) * muelle;
        nodo.vy += (previo.y - nodo.y) * muelle;
        nodo.vx += previo.vx * FISICA.amortiguacion;
        nodo.vy += previo.vy * FISICA.amortiguacion;
      }
      nodo.vx *= this.friccion;
      nodo.vy *= this.friccion;
      nodo.x += nodo.vx;
      nodo.y += nodo.vy;
      muelle *= FISICA.tension;
    }
  }

  dibujar(ctx: CanvasRenderingContext2D) {
    const n = this.nodos;
    ctx.beginPath();
    ctx.moveTo(n[0].x, n[0].y);

    // Curvas cuadráticas entre puntos medios: la cadena se ve como un trazo.
    let i = 1;
    for (; i < n.length - 2; i++) {
      const a = n[i];
      const b = n[i + 1];
      ctx.quadraticCurveTo(a.x, a.y, 0.5 * (a.x + b.x), 0.5 * (a.y + b.y));
    }
    const a = n[i];
    const b = n[i + 1];
    ctx.quadraticCurveTo(a.x, a.y, b.x, b.y);
    ctx.stroke();
  }
}

/** Lee un token de color del tema activo y lo devuelve como `r, g, b`. */
function canalesDeToken(el: HTMLElement, token: string, respaldo: string): string {
  const valor = getComputedStyle(el).getPropertyValue(token).trim() || respaldo;
  // Los tokens del sistema son hex (#1d5fd4). Se convierten a canales para
  // poder variar el alfa sin recomponer la cadena en cada fotograma.
  const hex = valor.replace("#", "");
  if (hex.length !== 6) return "29, 95, 212";
  const n = parseInt(hex, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export function LienzoTrazo({
  className,
  /** Token de color del trazo. Por defecto, el primario del tema. */
  token = "--primary",
}: {
  className?: string;
  token?: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const contenedor = canvas?.parentElement;
    if (!canvas || !contenedor) return;

    // Sin movimiento: no se anima nada y no se registra ningún listener.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rgb = canalesDeToken(contenedor, token, "#1d5fd4");
    const puntero = { x: 0, y: 0, activo: false };
    let lineas: Linea[] = [];
    let frame = 0;
    let visible = true;

    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // 2 basta; 3 no se nota
      const { width, height } = contenedor.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const sembrar = (x: number, y: number) => {
      lineas = Array.from(
        { length: FISICA.lineas },
        (_, i) => new Linea(0.45 + (i / FISICA.lineas) * 0.025, x, y),
      );
    };

    const pintar = () => {
      if (!visible) return; // el bucle se relanza al volver a ser visible
      const { width, height } = canvas;
      const dpr = width / (canvas.clientWidth || 1);

      ctx.clearRect(0, 0, width / dpr, height / dpr);
      ctx.lineWidth = FISICA.grosor;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = `rgba(${rgb}, ${FISICA.alfa})`;

      for (const linea of lineas) {
        linea.actualizar(puntero.x, puntero.y);
        linea.dibujar(ctx);
      }

      frame = window.requestAnimationFrame(pintar);
    };

    const arrancar = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(pintar);
    };
    const parar = () => {
      if (!frame) return;
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    /** Coordenadas relativas al contenedor: el canvas no ocupa la ventana. */
    const mover = (e: PointerEvent) => {
      const caja = contenedor.getBoundingClientRect();
      puntero.x = e.clientX - caja.left;
      puntero.y = e.clientY - caja.top;
      if (!puntero.activo) {
        // Las líneas nacen donde entró el puntero, no en (0,0): así no se ve
        // un latigazo desde la esquina en el primer movimiento.
        sembrar(puntero.x, puntero.y);
        puntero.activo = true;
      }
      arrancar();
    };

    ajustar();
    sembrar(0, 0);

    // Pausa cuando el hero sale de la pantalla: pintar lo que nadie ve es gasto.
    const observadorVista = new IntersectionObserver(
      ([entrada]) => {
        visible = entrada.isIntersecting;
        if (visible && puntero.activo) arrancar();
        else parar();
      },
      { threshold: 0 },
    );
    observadorVista.observe(contenedor);

    const observadorTamano = new ResizeObserver(ajustar);
    observadorTamano.observe(contenedor);

    const alCambiarPestana = () => {
      if (document.hidden) parar();
      else if (visible && puntero.activo) arrancar();
    };

    // `pointermove` cubre ratón, lápiz y dedo con un solo listener, y no se
    // llama `preventDefault()` para no romper el desplazamiento táctil.
    contenedor.addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("visibilitychange", alCambiarPestana);

    return () => {
      parar();
      observadorVista.disconnect();
      observadorTamano.disconnect();
      contenedor.removeEventListener("pointermove", mover);
      document.removeEventListener("visibilitychange", alCambiarPestana);
    };
  }, [token]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    />
  );
}
