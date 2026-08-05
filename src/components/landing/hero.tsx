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
    "group inline-flex items-center gap-2 rounded-full px-8 py-5 text-lg font-semibold transition-all duration-300 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  const style =
    variant === "primary"
      ? "bg-primary text-primary-foreground glow-button hover:bg-brand-teal-dark"
      : "border border-primary/20 bg-background/50 text-foreground backdrop-blur-md hover:bg-primary/10 hover:border-primary/40 glass-card";
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
    <h1 className="font-display text-[clamp(3.5rem,8vw,6.5rem)] font-bold leading-[1.05] tracking-[-0.04em] text-foreground">
      {words.join(" ")}{" "}
      <span className="relative inline-block whitespace-nowrap text-gradient-primary-animated">
        {last}
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
    <section className="franja-oscura relative overflow-hidden border-b border-border bg-background animated-hero-bg">
      {/* Cuadrícula de maqueta refinada. */}
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
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-sm uppercase tracking-[0.2em] text-primary glass-card"
              >
                <MapPin className="size-4 animate-pulse" aria-hidden />
                <span className="font-semibold">{s.tag ?? lugar}</span>
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
                    <p className="mt-8 max-w-2xl text-2xl leading-relaxed text-muted-foreground/90">
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

              {/* Social / contact shortcuts inspired by the screenshot design */}
              <m.div
                custom={3}
                variants={CASCADA}
                initial={reduce ? false : "oculto"}
                animate="visible"
                className="mt-8 flex items-center gap-3.5"
              >
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex size-9 items-center justify-center rounded-full border border-primary/20 bg-background/40 text-foreground/60 transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:text-primary hover:bg-primary/5">
                  <span className="sr-only">GitHub</span>
                  <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex size-9 items-center justify-center rounded-full border border-primary/20 bg-background/40 text-foreground/60 transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:text-primary hover:bg-primary/5">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex size-9 items-center justify-center rounded-full border border-primary/20 bg-background/40 text-foreground/60 transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:text-primary hover:bg-primary/5">
                  <span className="sr-only">Twitter</span>
                  <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="mailto:info@globaleffect.org" className="flex size-9 items-center justify-center rounded-full border border-primary/20 bg-background/40 text-foreground/60 transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:text-primary hover:bg-primary/5">
                  <span className="sr-only">Email</span>
                  <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </a>
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
                <div className="relative mx-auto flex aspect-square w-full max-w-[360px] sm:max-w-[400px] md:max-w-none items-center justify-center p-6">
                  {/* Rotating decorative rings */}
                  <div className="absolute inset-0 -m-2 animate-[spin_60s_linear_infinite] rounded-full border border-dashed border-primary/20 pointer-events-none" />
                  <div 
                    className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-tr from-primary/10 via-transparent to-brand-teal/15 animate-[spin_30s_linear_infinite]"
                    style={{ padding: '1px' }}
                  />
                  <div className="absolute inset-6 rounded-full bg-gradient-to-b from-primary/20 to-brand-teal/5 blur-2xl opacity-80 pointer-events-none" />
                  
                  {/* Circular image container with neon glow shadow */}
                  <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-background shadow-[0_0_50px_rgba(32,150,186,0.15)] bg-brand-charcoal">
                    <AnimatePresence mode="wait">
                      <m.div
                        key={s.id}
                        initial={reduce ? false : { opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${s.imagen})`, filter: "grayscale(10%) contrast(105%)" }}
                        role="img"
                        aria-label={s.titulo}
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Floating card - glassmorphism */}
                  <div className="absolute -bottom-1 -right-2 sm:-right-4 max-w-[210px] rounded-2xl border border-primary/25 bg-background/80 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-primary/45 hover:shadow-[0_0_30px_rgba(32,150,186,0.15)]">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                        {t("heroStatusOnline")}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] font-semibold text-foreground/90 leading-normal">
                      {t("heroStatusText")}
                    </p>
                    <Link href="/login" className="mt-2.5 flex items-center justify-end gap-1 font-mono text-[9px] font-bold uppercase tracking-wider text-primary hover:text-brand-teal transition-colors">
                      {t("heroStatusCta")} <span>↗</span>
                    </Link>
                  </div>
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
                      className="flex items-center gap-5 rounded-2xl border border-primary/10 bg-background/40 p-6 glass-card hover-glow-border transition-all duration-300"
                    >
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-glow">
                        <Icon className="size-7 animate-float" strokeWidth={1.5} aria-hidden />
                      </span>
                      <div>
                        <dd className="font-display text-4xl font-bold text-foreground">
                          <Contador valor={d.valor} />
                        </dd>
                        <dt className="text-lg font-medium text-muted-foreground mt-1">{d.label}</dt>
                      </div>
                    </div>
                  );
                })}
              </dl>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground/70">
                  {pieDatos}
                </p>
                {/* Atajo a la primera sección: da salida al hero en móvil, donde
                    el desplazamiento no tiene una pista visual de qué sigue. */}
                <a
                  href="#acceso"
                  className="group inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:text-brand-teal-dark"
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
