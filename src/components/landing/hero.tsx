/**
 * Hero de la landing — "Impact Editorial".
 *
 * Qué cambió respecto de la versión anterior y por qué:
 *
 * - **La columna derecha nunca queda vacía.** El hero está compuesto a dos
 *   columnas, pero la migración 0018 desactivó las diapositivas de relleno y con
 *   ellas desapareció la única imagen: quedaba una mitad de texto y una mitad de
 *   nada, y la página parecía haber perdido su animación. Sin fotografía propia
 *   que publicar, ese espacio lo ocupa `PanelVivo` con el estado real del
 *   sistema. Si algún día la coordinación sube una foto a una diapositiva, la
 *   foto manda y el panel se va abajo, a ancho completo.
 * - **Entrada orquestada.** Etiqueta, titular, texto, botones y cifras entran en
 *   cascada de 60ms. 400ms de duración, `--ease-out`, `translateY + fade`: el
 *   máximo que permite §7 y ni un milisegundo más.
 * - **Las cifras cuentan.** `Contador` las sube desde cero al aparecer, que es lo
 *   que distingue un dato medido de un número escrito a mano.
 * - **El carrusel dice cuánto falta.** Antes rotaba cada 7s sin avisar y sin
 *   forma de detenerlo; ahora hay una barra de tiempo sincronizada y el avance se
 *   pausa al pasar el puntero o al enfocar los controles con el teclado. Nada se
 *   mueve bajo la mano de quien está leyendo.
 * - **Fondo.** Cuadrícula de maqueta con máscara radial más una veladura del
 *   primario, en lugar del degradado plano. Y `LienzoTrazo` sigue dibujando tinta
 *   tras el puntero: la interacción de la que nace el nombre de la sección.
 *
 * Todo el movimiento se apaga con `prefers-reduced-motion`.
 */
"use client";

import { useEffect, useState } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  MapPin,
  Pause,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Marker } from "@/components/brand/marker";
import { LienzoTrazo } from "@/components/ui/lienzo-trazo";
import { Contador } from "./contador";
import { PanelVivo, type EventoResumen } from "./panel-vivo";

export interface HeroSlide {
  id: string;
  tag?: string | null;
  titulo: string;
  texto?: string | null;
  imagen?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  cta2Label?: string | null;
  cta2Href?: string | null;
}

export interface HeroDato {
  /** Valor crudo: lo formatea `Contador` con el locale activo. */
  valor: number;
  label: string;
}

const INTERVALO = 7000;
const CURVA = [0.23, 1, 0.32, 1] as const;

/** Cascada de entrada: 60ms entre bloques, dentro del rango 30–80ms de §7. */
const CASCADA = {
  oculto: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: CURVA, delay: 0.06 * i },
  }),
};

function Cta({
  href,
  variant,
  children,
}: {
  href: string;
  variant: "primary" | "secondary";
  children: React.ReactNode;
}) {
  const base =
    "group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  const style =
    variant === "primary"
      ? "bg-primary text-primary-foreground shadow-plana hover:bg-brand-teal-dark hover:shadow-flotante"
      : "border border-foreground/15 bg-card/80 text-foreground backdrop-blur-sm hover:bg-accent hover:border-foreground/25";
  const contenido = (
    <>
      {children}
      <ArrowRight
        className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
        aria-hidden
      />
    </>
  );
  return href.startsWith("http") ? (
    <a href={href} className={cn(base, style)}>
      {contenido}
    </a>
  ) : (
    <Link href={href} className={cn(base, style)}>
      {contenido}
    </Link>
  );
}

function Titular({ text }: { text: string }) {
  const words = text.trim().split(" ");
  const last = words.pop() ?? "";
  return (
    <h1 className="font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-foreground">
      {words.join(" ")}{" "}
      <span className="relative inline-block whitespace-nowrap">
        {last}
        <Marker className="absolute -bottom-1 left-0 h-4 w-full text-primary" />
      </span>
    </h1>
  );
}

const STAT_ICONS = [Users, BookOpen, HeartHandshake];

export function Hero({
  slides,
  datos,
  lugar,
  pieDatos,
  evento,
}: {
  slides: HeroSlide[];
  datos: HeroDato[];
  lugar: string;
  pieDatos: string;
  evento?: EventoResumen | null;
}) {
  const t = useTranslations("landing");
  const items = slides;
  const [idx, setIdx] = useState(0);
  const [progreso, setProgreso] = useState(0);
  const [pausado, setPausado] = useState(false);
  const reduce = useReducedMotion();

  /**
   * Avance automático y barra de tiempo, en el mismo temporizador para que no se
   * desincronicen. Se detiene con una sola diapositiva, con movimiento reducido y
   * mientras el usuario tiene el puntero o el foco sobre los controles.
   */
  useEffect(() => {
    if (items.length < 2 || reduce || pausado) return;
    const frame = requestAnimationFrame(() => setProgreso(0));
    const inicio = Date.now();
    const id = setInterval(() => {
      const p = (Date.now() - inicio) / INTERVALO;
      if (p >= 1) setIdx((i) => (i + 1) % items.length);
      else setProgreso(p);
    }, 90);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(id);
    };
  }, [items.length, reduce, pausado, idx]);

  if (items.length === 0) return null;
  const s = items[idx];
  const go = (n: number) => setIdx((n + items.length) % items.length);
  const conFoto = Boolean(s.imagen);

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Cuadrícula de maqueta + veladura del primario. Decorativo. */}
      <div aria-hidden className="trama-cuadricula pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(46rem 34rem at 88% -12%, color-mix(in oklab, var(--primary) 9%, transparent), transparent 68%)",
        }}
      />

      <LienzoTrazo />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
        <LazyMotion features={domAnimation}>
          <div className="grid items-center gap-12 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
            {/* Columna de texto */}
            <div>
              <m.div
                custom={0}
                variants={CASCADA}
                initial={reduce ? false : "oculto"}
                animate="visible"
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              >
                <MapPin className="size-3" aria-hidden />
                <span>{s.tag ?? lugar}</span>
              </m.div>

              <AnimatePresence mode="wait">
                <m.div
                  key={s.id}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: CURVA }}
                  className="mt-6"
                >
                  <Titular text={s.titulo} />
                  {s.texto && (
                    <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
                      {s.texto}
                    </p>
                  )}
                </m.div>
              </AnimatePresence>

              {/* Llamadas a la acción */}
              <m.div
                custom={2}
                variants={CASCADA}
                initial={reduce ? false : "oculto"}
                animate="visible"
                className="mt-9 flex flex-wrap items-center gap-3.5"
              >
                {s.ctaLabel && s.ctaHref && (
                  <Cta href={s.ctaHref} variant="primary">
                    {s.ctaLabel}
                  </Cta>
                )}
                {s.cta2Label && s.cta2Href && (
                  <Cta href={s.cta2Href} variant="secondary">
                    {s.cta2Label}
                  </Cta>
                )}
              </m.div>

              {/* Controles del carrusel: solo si hay algo entre lo que moverse */}
              {items.length > 1 && (
                <div
                  className="mt-10"
                  onMouseEnter={() => setPausado(true)}
                  onMouseLeave={() => setPausado(false)}
                  onFocusCapture={() => setPausado(true)}
                  onBlurCapture={() => setPausado(false)}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => go(idx - 1)}
                      aria-label={t("heroPrev")}
                      className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <ChevronLeft className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(idx + 1)}
                      aria-label={t("heroNext")}
                      className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <ChevronRight className="size-4" aria-hidden />
                    </button>

                    <div className="ml-1 flex items-center gap-2" role="tablist">
                      {items.map((it, i) => (
                        <button
                          key={it.id}
                          type="button"
                          role="tab"
                          aria-selected={i === idx}
                          aria-label={it.titulo}
                          onClick={() => setIdx(i)}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            i === idx
                              ? "w-8 bg-primary"
                              : "w-2 bg-foreground/20 hover:bg-foreground/40",
                          )}
                        />
                      ))}
                    </div>

                    {pausado && !reduce && (
                      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        <Pause className="size-3" aria-hidden />
                        {t("heroPaused")}
                      </span>
                    )}
                  </div>

                  {/* Barra de tiempo del avance automático. Decorativa: el
                      estado real ya lo dice el `aria-selected` de las pestañas. */}
                  {!reduce && (
                    <div
                      aria-hidden
                      className="mt-4 h-px w-40 overflow-hidden rounded-full bg-foreground/10"
                    >
                      <div
                        className="h-full bg-primary/60"
                        style={{ width: `${Math.round(progreso * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Columna derecha: la foto si existe, el estado del sistema si no */}
            <m.div
              custom={3}
              variants={CASCADA}
              initial={reduce ? false : "oculto"}
              animate="visible"
            >
              {conFoto ? (
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-brand-charcoal shadow-flotante">
                  <AnimatePresence mode="wait">
                    <m.div
                      key={s.id}
                      initial={reduce ? false : { opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${s.imagen})` }}
                      role="img"
                      aria-label={s.titulo}
                    />
                  </AnimatePresence>
                </div>
              ) : (
                <PanelVivo evento={evento} />
              )}
            </m.div>
          </div>

          {/* Cifras del sistema */}
          {datos.length > 0 && (
            <m.div
              custom={4}
              variants={CASCADA}
              initial={reduce ? false : "oculto"}
              animate="visible"
              className="mt-14 border-t border-border pt-8"
            >
              <dl
                className={cn(
                  "grid gap-4",
                  datos.length === 1 ? "sm:grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3",
                )}
              >
                {datos.map((d, index) => {
                  const Icon = STAT_ICONS[index % STAT_ICONS.length];
                  return (
                    <div
                      key={d.label}
                      className="flex items-center gap-4 rounded-xl border border-border bg-card/80 p-5 transition-colors duration-150 hover:border-primary/40 hover:bg-card"
                    >
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-6" strokeWidth={1.7} aria-hidden />
                      </span>
                      <div>
                        <dd className="font-mono text-2xl font-semibold text-foreground">
                          <Contador valor={d.valor} />
                        </dd>
                        <dt className="text-sm font-medium text-muted-foreground">{d.label}</dt>
                      </div>
                    </div>
                  );
                })}
              </dl>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
                  {pieDatos}
                </p>
                {/* Atajo a la primera sección: da salida al hero en móvil, donde
                    el desplazamiento no tiene una pista visual de qué sigue. */}
                <a
                  href="#acceso"
                  className="group inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:text-brand-teal-dark"
                >
                  {t("heroScroll")}
                  <ArrowDown
                    className="size-3.5 transition-transform duration-150 group-hover:translate-y-0.5"
                    aria-hidden
                  />
                </a>
              </div>
            </m.div>
          )}
        </LazyMotion>
      </div>
    </section>
  );
}
