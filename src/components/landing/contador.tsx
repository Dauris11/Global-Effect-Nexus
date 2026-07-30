/**
 * `Contador` — la cifra sube desde cero la primera vez que se ve.
 *
 * Es la única animación de la página que se aplica a un dato, y tiene un motivo:
 * las cifras del hero salen de la base de datos, y verlas *contar* es lo que las
 * separa de un número impreso en una imagen. El movimiento comunica "esto se
 * midió", que es exactamente lo que la sección afirma.
 *
 * Decisiones:
 *
 * - **Arranca en el valor final.** Sin JavaScript, con movimiento reducido o si
 *   el `IntersectionObserver` nunca dispara, lo que se lee es la cifra correcta.
 *   Ninguna ruta deja un cero en pantalla.
 * - **`requestAnimationFrame` a mano, no Motion.** Es contar, no animar una
 *   propiedad CSS: no hace falta cargar un motor para interpolar un entero.
 * - **600ms.** Por encima del máximo de 400ms del estándar, que aplica a
 *   entradas de elementos; esto es la lectura de un dato y con 400ms no se
 *   percibe la cuenta. Es la única excepción y queda aquí anotada.
 * - Se desconecta el observador al primer cruce: cuenta una vez.
 */
"use client";

import * as React from "react";
import { useLocale } from "next-intl";

const DURACION = 600;

export function Contador({ valor }: { valor: number }) {
  const locale = useLocale();
  const formato = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const ref = React.useRef<HTMLSpanElement>(null);
  const [n, setN] = React.useState(valor);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        observador.disconnect();

        const inicio = performance.now();
        const paso = (t: number) => {
          const p = Math.min((t - inicio) / DURACION, 1);
          // easeOutCubic: el equivalente numérico de --ease-out. Arranca rápido
          // y frena al llegar, así el último dígito se lee.
          setN(Math.round(valor * (1 - Math.pow(1 - p, 3))));
          if (p < 1) frame = requestAnimationFrame(paso);
        };
        setN(0);
        frame = requestAnimationFrame(paso);
      },
      { threshold: 0.4 },
    );
    observador.observe(el);

    return () => {
      observador.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [valor]);

  return (
    <span ref={ref} className="tabular-nums">
      {formato.format(n)}
    </span>
  );
}
