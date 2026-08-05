"use client";

import { useEffect, useRef, useState } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import {
  ArrowRight,
  ArrowDown,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Users,
  Download,
  Pause,
  Play,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
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
  valor: number;
  label: string;
}

/** Cada slide dura 6 segundos. */
const INTERVALO = 6000;
const CURVA = [0.23, 1, 0.32, 1] as const;

const FADE_UP = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: CURVA, delay: 0.09 * i },
  }),
};

const STAT_ICONS = [Users, BookOpen, HeartHandshake];

/* ─── Paleta azul marino ─────────────────────────────────────── */
const NAVY = {
  /** Fondo hero */
  bg:       "#060d18",
  /** Acento principal */
  primary:  "#1d4ed8",
  /** Acento hover */
  hover:    "#2563eb",
  /** Texto/icono acento suave */
  accent:   "#60a5fa",
  /** Borde acento */
  border:   "rgba(96,165,250,0.25)",
  /** Glow btn */
  glow:     "rgba(29,78,216,0.55)",
  /** Dot-grid */
  dot:      "rgba(96,165,250,0.10)",
};

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

  const [idx, setIdx]         = useState(0);
  const [progreso, setProgreso] = useState(0);
  const [pausado, setPausado]  = useState(false);
  const reduce = useReducedMotion();

  /** Timer ref — permite reiniciarlo limpiamente al avanzar un slide. */
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const limpiar = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  /** Inicia / reinicia el intervalo de auto-avance. */
  const iniciar = () => {
    limpiar();
    if (items.length < 2 || reduce || pausado) return;
    setProgreso(0);
    const inicio = Date.now();
    timerRef.current = setInterval(() => {
      const p = (Date.now() - inicio) / INTERVALO;
      if (p >= 1) {
        setIdx((i) => (i + 1) % items.length);
      } else {
        setProgreso(p);
      }
    }, 60);
  };

  /* Arrancar/detener cuando cambian dependencias relevantes. */
  useEffect(() => {
    iniciar();
    return limpiar;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, reduce, pausado, idx]);

  if (items.length === 0) return null;
  const s = items[idx];
  const go = (n: number) => {
    limpiar();
    setIdx((n + items.length) % items.length);
  };
  const conFoto = Boolean(s.imagen);

  return (
    <section
      className="relative overflow-hidden min-h-screen"
      style={{ backgroundColor: NAVY.bg }}
    >
      {/* ── Fondos decorativos ── */}
      {/* Glow azul marino top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80rem 55rem at 100% 0%,  rgba(29,78,216,0.22) 0%, transparent 60%),
                       radial-gradient(ellipse 60rem 40rem at -5% 60%, rgba(15,40,100,0.18) 0%, transparent 60%)`,
        }}
      />
      {/* Dot-grid patrón — zona derecha */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${NAVY.dot} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 60% 80% at 70% 40%, black 30%, transparent 80%)",
        }}
      />
      {/* Línea de borde inferior */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${NAVY.border}, transparent)` }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28 lg:py-32">
        <LazyMotion features={domAnimation}>
          <div className="flex flex-col-reverse items-center gap-14 md:flex-row md:gap-10 lg:gap-16">

            {/* ── COLUMNA IZQUIERDA ── */}
            <div className="flex-1 text-center md:text-left">

              {/* Tag / lugar */}
              <m.p
                custom={0}
                variants={FADE_UP}
                initial={reduce ? false : "hidden"}
                animate="visible"
                className="mb-4 text-sm font-normal tracking-wide text-[#60a5fa]"
              >
                {s.tag ?? lugar}
              </m.p>

              {/* Título + texto — cambia por slide */}
              <AnimatePresence mode="wait">
                <m.div
                  key={s.id}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: CURVA }}
                >
                  <h1 className="font-display text-[clamp(2.6rem,6.5vw,5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-white">
                    {s.titulo}
                  </h1>
                  {s.texto && (
                    <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/50 md:mx-0">
                      {s.texto}
                    </p>
                  )}
                </m.div>
              </AnimatePresence>

              {/* CTA buttons */}
              <m.div
                custom={2}
                variants={FADE_UP}
                initial={reduce ? false : "hidden"}
                animate="visible"
                className="mt-10 flex flex-wrap items-center justify-center gap-4 md:justify-start"
              >
                {s.ctaLabel && s.ctaHref && (
                  s.ctaHref.startsWith("http") ? (
                    <a
                      href={s.ctaHref}
                      className="group inline-flex items-center gap-2.5 rounded-full bg-[#1d4ed8] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(29,78,216,0.55)] transition-all duration-300 hover:bg-[#2563eb] hover:shadow-[0_0_42px_rgba(29,78,216,0.65)] active:scale-[0.97]"
                    >
                      {s.ctaLabel}
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                    </a>
                  ) : (
                    <Link
                      href={s.ctaHref}
                      className="group inline-flex items-center gap-2.5 rounded-full bg-[#1d4ed8] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(29,78,216,0.55)] transition-all duration-300 hover:bg-[#2563eb] hover:shadow-[0_0_42px_rgba(29,78,216,0.65)] active:scale-[0.97]"
                    >
                      {s.ctaLabel}
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  )
                )}
                {s.cta2Label && s.cta2Href && (
                  s.cta2Href.startsWith("http") ? (
                    <a
                      href={s.cta2Href}
                      className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                    >
                      {s.cta2Label}
                      <Download className="size-4" aria-hidden />
                    </a>
                  ) : (
                    <Link
                      href={s.cta2Href}
                      className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                    >
                      {s.cta2Label}
                      <Download className="size-4" aria-hidden />
                    </Link>
                  )
                )}
              </m.div>

              {/* Controles del carrusel */}
              {items.length > 1 && (
                <m.div
                  custom={3}
                  variants={FADE_UP}
                  initial={reduce ? false : "hidden"}
                  animate="visible"
                  className="mt-10 flex items-center justify-center gap-3 md:justify-start"
                >
                  {/* Prev */}
                  <button
                    type="button"
                    onClick={() => go(idx - 1)}
                    aria-label="Anterior"
                    className="flex size-8 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/50 transition-all hover:border-white/25 hover:text-white"
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </button>

                  {/* Dots + progress */}
                  <div className="flex items-center gap-2" role="tablist">
                    {items.map((it, i) => (
                      <button
                        key={it.id}
                        type="button"
                        role="tab"
                        aria-selected={i === idx}
                        aria-label={it.titulo}
                        onClick={() => go(i)}
                        className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
                        style={{
                          width: i === idx ? 36 : 8,
                          backgroundColor: "rgba(255,255,255,0.15)",
                        }}
                      >
                        {/* Progress fill for the active dot */}
                        {i === idx && !reduce && (
                          <span
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                              width: `${Math.round(progreso * 100)}%`,
                              backgroundColor: "#60a5fa",
                              transition: "width 60ms linear",
                            }}
                          />
                        )}
                        {i === idx && reduce && (
                          <span
                            className="absolute inset-0 rounded-full bg-[#60a5fa]"
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() => go(idx + 1)}
                    aria-label="Siguiente"
                    className="flex size-8 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/50 transition-all hover:border-white/25 hover:text-white"
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </button>

                  {/* Pause / Play */}
                  <button
                    type="button"
                    onClick={() => setPausado((p) => !p)}
                    aria-label={pausado ? "Reanudar" : "Pausar presentación"}
                    className="flex size-8 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/40 transition-all hover:border-white/25 hover:text-white"
                  >
                    {pausado
                      ? <Play className="size-3.5" aria-hidden />
                      : <Pause className="size-3.5" aria-hidden />
                    }
                  </button>
                </m.div>
              )}
            </div>

            {/* ── COLUMNA DERECHA: foto o PanelVivo ── */}
            <m.div
              custom={1}
              variants={FADE_UP}
              initial={reduce ? false : "hidden"}
              animate="visible"
              className="relative flex-shrink-0 w-full max-w-[320px] sm:max-w-[380px] md:max-w-[400px] lg:max-w-[440px]"
            >
              {conFoto ? (
                <>
                  {/* Glow de fondo azul marino */}
                  <div
                    aria-hidden
                    className="absolute inset-[-8%] rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 50% 50%, rgba(29,78,216,0.28) 0%, rgba(15,40,100,0.18) 45%, transparent 70%)`,
                    }}
                  />
                  {/* Anillo decorativo exterior */}
                  <div
                    aria-hidden
                    className="absolute inset-[3%] rounded-full border pointer-events-none"
                    style={{ borderColor: "rgba(96,165,250,0.12)" }}
                  />
                  {/* Anillo interior girando */}
                  <div
                    aria-hidden
                    className="absolute inset-[9%] rounded-full pointer-events-none animate-[spin_45s_linear_infinite]"
                    style={{
                      borderWidth: "1px",
                      borderStyle: "dashed",
                      borderColor: "rgba(96,165,250,0.18)",
                    }}
                  />

                  {/* Foto circular con AnimatePresence */}
                  <div className="relative overflow-hidden rounded-full aspect-square">
                    <AnimatePresence mode="wait">
                      <m.div
                        key={s.id}
                        initial={reduce ? false : { opacity: 0, scale: 1.06 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.6, ease: CURVA }}
                        className="absolute inset-0 bg-cover bg-center bg-top"
                        style={{ backgroundImage: `url(${s.imagen})` }}
                        role="img"
                        aria-label={s.titulo}
                      />
                    </AnimatePresence>
                    {/* Fade inferior */}
                    <div
                      aria-hidden
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `linear-gradient(to top, ${NAVY.bg} 0%, rgba(6,13,24,0.45) 30%, transparent 60%)`,
                      }}
                    />
                    {/* Fade radial bordes */}
                    <div
                      aria-hidden
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(6,13,24,0.75) 78%, ${NAVY.bg} 100%)`,
                      }}
                    />
                  </div>

                  {/* Tarjeta flotante glassmorphism */}
                  <div
                    className="absolute -bottom-6 -right-2 sm:-right-6 z-10 w-[186px] rounded-2xl border border-white/10 p-4 shadow-2xl backdrop-blur-xl transition-transform duration-300 hover:scale-[1.04]"
                    style={{ backgroundColor: "rgba(10,20,45,0.88)" }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white leading-snug">
                          {t("heroStatusOnline")}
                        </p>
                        <p className="mt-1 text-[11px] text-white/45 leading-relaxed">
                          {t("heroStatusText")}
                        </p>
                      </div>
                      <span className="relative mt-0.5 flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </span>
                    </div>
                    <Link
                      href="/login"
                      className="mt-3 flex items-center justify-end gap-1 text-[11px] font-semibold text-[#60a5fa] transition-colors hover:text-white"
                    >
                      {t("heroStatusCta")}
                      <ArrowRight className="size-3" aria-hidden />
                    </Link>
                  </div>
                </>
              ) : (
                <PanelVivo evento={evento} />
              )}
            </m.div>
          </div>

          {/* ── STATS ROW ── */}
          {datos.length > 0 && (
            <m.div
              custom={5}
              variants={FADE_UP}
              initial={reduce ? false : "hidden"}
              animate="visible"
              className="mt-20 border-t pt-10"
              style={{ borderColor: "rgba(96,165,250,0.12)" }}
            >
              <dl
                className={cn(
                  "grid gap-5",
                  datos.length === 1
                    ? "sm:grid-cols-1"
                    : "sm:grid-cols-2 lg:grid-cols-3",
                )}
              >
                {datos.map((d, index) => {
                  const Icon = STAT_ICONS[index % STAT_ICONS.length];
                  return (
                    <div
                      key={d.label}
                      className="flex items-center gap-5 rounded-2xl border border-[#60a5fa]/10 bg-white/[0.025] p-5 transition-all duration-300 hover:border-[#60a5fa]/30 hover:bg-[#1d4ed8]/8"
                    >
                      <span
                        className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#1d4ed8]/18 text-[#60a5fa]"
                      >
                        <Icon className="size-6" strokeWidth={1.5} aria-hidden />
                      </span>
                      <div>
                        <dd className="font-display text-3xl font-bold text-white">
                          <Contador valor={d.valor} />
                        </dd>
                        <dt className="mt-0.5 text-sm text-white/45">{d.label}</dt>
                      </div>
                    </div>
                  );
                })}
              </dl>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-white/30">
                  {pieDatos}
                </p>
                <a
                  href="#acceso"
                  className="group inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#60a5fa] transition-colors hover:text-white"
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
