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
  ArrowRight,
  ArrowDown,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Users,
  Download,
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

const INTERVALO = 7000;
const CURVA = [0.23, 1, 0.32, 1] as const;

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: CURVA, delay: 0.08 * i },
  }),
};

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
    <section className="hero-new relative overflow-hidden bg-[#080c14] min-h-screen">
      {/* Deep background: radial glow top-left purple + top-right blue */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80rem 55rem at 100% 0%, rgba(88,28,255,0.18) 0%, transparent 60%), radial-gradient(ellipse 60rem 40rem at 0% 50%, rgba(29,78,216,0.10) 0%, transparent 60%)",
        }}
      />
      {/* Dot-grid pattern on the right side */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 60% 80% at 70% 40%, black 30%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28 lg:py-32">
        <LazyMotion features={domAnimation}>
          <div className="flex flex-col-reverse items-center gap-14 md:flex-row md:gap-10 lg:gap-16">

            {/* ── LEFT COLUMN ── */}
            <div className="flex-1 text-center md:text-left">

              {/* Small greeting */}
              <m.p
                custom={0}
                variants={FADE_UP}
                initial={reduce ? false : "hidden"}
                animate="visible"
                className="mb-4 text-base font-normal text-white/55 tracking-wide"
              >
                {s.tag ?? lugar}
              </m.p>

              {/* Main title: first line white, subtitle gradient */}
              <AnimatePresence mode="wait">
                <m.div
                  key={s.id}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: CURVA }}
                >
                  <h1 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-white">
                    {s.titulo}
                  </h1>
                  {s.texto && (
                    <p className="mt-6 max-w-lg text-base leading-relaxed text-white/50 mx-auto md:mx-0">
                      {s.texto}
                    </p>
                  )}
                </m.div>
              </AnimatePresence>

              {/* CTAs */}
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
                      className="group inline-flex items-center gap-2.5 rounded-full bg-[#6C3EF4] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(108,62,244,0.45)] transition-all duration-300 hover:bg-[#7B52F5] hover:shadow-[0_0_45px_rgba(108,62,244,0.55)] active:scale-[0.97]"
                    >
                      {s.ctaLabel}
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                    </a>
                  ) : (
                    <Link
                      href={s.ctaHref}
                      className="group inline-flex items-center gap-2.5 rounded-full bg-[#6C3EF4] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(108,62,244,0.45)] transition-all duration-300 hover:bg-[#7B52F5] hover:shadow-[0_0_45px_rgba(108,62,244,0.55)] active:scale-[0.97]"
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

              {/* Social icon links */}
              <m.div
                custom={3}
                variants={FADE_UP}
                initial={reduce ? false : "hidden"}
                animate="visible"
                className="mt-8 flex items-center justify-center gap-4 md:justify-start"
              >
                {[
                  {
                    label: "GitHub",
                    href: "https://github.com/Dauris11",
                    icon: (
                      <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.49.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    ),
                  },
                  {
                    label: "LinkedIn",
                    href: "https://linkedin.com",
                    icon: (
                      <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Twitter / X",
                    href: "https://twitter.com",
                    icon: (
                      <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Correo",
                    href: "mailto:info@globaleffect.org",
                    icon: (
                      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    ),
                  },
                ].map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    aria-label={label}
                    className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-all duration-200 hover:border-white/30 hover:bg-white/10 hover:text-white hover:scale-110 active:scale-95"
                  >
                    {icon}
                  </a>
                ))}
              </m.div>

              {/* Carousel controls */}
              {items.length > 1 && (
                <m.div
                  custom={4}
                  variants={FADE_UP}
                  initial={reduce ? false : "hidden"}
                  animate="visible"
                  className="mt-8 flex items-center justify-center gap-3 md:justify-start"
                  onMouseEnter={() => setPausado(true)}
                  onMouseLeave={() => setPausado(false)}
                  onFocusCapture={() => setPausado(true)}
                  onBlurCapture={() => setPausado(false)}
                >
                  <button
                    type="button"
                    onClick={() => go(idx - 1)}
                    aria-label="Anterior"
                    className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-all hover:border-white/25 hover:text-white"
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </button>
                  <div className="flex items-center gap-1.5" role="tablist">
                    {items.map((it, i) => (
                      <button
                        key={it.id}
                        type="button"
                        role="tab"
                        aria-selected={i === idx}
                        aria-label={it.titulo}
                        onClick={() => setIdx(i)}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          i === idx
                            ? "w-8 bg-[#6C3EF4]"
                            : "w-2 bg-white/20 hover:bg-white/40",
                        )}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => go(idx + 1)}
                    aria-label="Siguiente"
                    className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-all hover:border-white/25 hover:text-white"
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </button>
                  {!reduce && (
                    <div
                      aria-hidden
                      className="ml-2 h-px w-24 overflow-hidden rounded-full bg-white/10"
                    >
                      <div
                        className="h-full bg-[#6C3EF4]/70"
                        style={{ width: `${Math.round(progreso * 100)}%` }}
                      />
                    </div>
                  )}
                </m.div>
              )}
            </div>

            {/* ── RIGHT COLUMN: Portrait or PanelVivo ── */}
            <m.div
              custom={1}
              variants={FADE_UP}
              initial={reduce ? false : "hidden"}
              animate="visible"
              className="relative flex-shrink-0 w-full max-w-[340px] sm:max-w-[400px] md:max-w-[420px] lg:max-w-[460px]"
            >
              {conFoto ? (
                <>
                  {/* Outer glow ring */}
                  <div
                    aria-hidden
                    className="absolute inset-[-5%] rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at 50% 50%, rgba(108,62,244,0.25) 0%, rgba(29,78,216,0.15) 40%, transparent 70%)",
                    }}
                  />
                  {/* Decorative thin circle outline */}
                  <div
                    aria-hidden
                    className="absolute inset-[4%] rounded-full border border-white/10 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at 30% 70%, rgba(108,62,244,0.1) 0%, transparent 60%)",
                    }}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-[10%] rounded-full border border-[#6C3EF4]/20 pointer-events-none animate-[spin_40s_linear_infinite]"
                    style={{
                      borderStyle: "dashed",
                    }}
                  />

                  {/* Photo — fills right column, fades at bottom */}
                  <div className="relative overflow-hidden rounded-full aspect-square">
                    <AnimatePresence mode="wait">
                      <m.div
                        key={s.id}
                        initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-cover bg-center bg-top"
                        style={{
                          backgroundImage: `url(${s.imagen})`,
                        }}
                        role="img"
                        aria-label={s.titulo}
                      />
                    </AnimatePresence>
                    {/* Bottom fade to blend with bg */}
                    <div
                      aria-hidden
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to top, #080c14 0%, rgba(8,12,20,0.5) 30%, transparent 60%)",
                      }}
                    />
                    {/* Right-side edge fade */}
                    <div
                      aria-hidden
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(8,12,20,0.7) 80%, #080c14 100%)",
                      }}
                    />
                  </div>

                  {/* Floating status card — bottom right */}
                  <div className="absolute -bottom-6 -right-2 sm:-right-8 z-10 w-[190px] rounded-2xl border border-white/10 bg-[#111827]/90 p-4 shadow-2xl backdrop-blur-xl transition-transform duration-300 hover:scale-[1.03]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white leading-snug">
                          {t("heroStatusOnline")}
                        </p>
                        <p className="mt-1 text-xs text-white/45 leading-relaxed">
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
                      className="mt-3 flex items-center justify-end gap-1 text-[11px] font-semibold text-[#818cf8] transition-colors hover:text-white"
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
              className="mt-20 border-t border-white/8 pt-10"
            >
              <dl className={cn(
                "grid gap-6",
                datos.length === 1
                  ? "sm:grid-cols-1"
                  : "sm:grid-cols-2 lg:grid-cols-3",
              )}>
                {datos.map((d, index) => {
                  const Icon = STAT_ICONS[index % STAT_ICONS.length];
                  return (
                    <div
                      key={d.label}
                      className="flex items-center gap-5 rounded-2xl border border-white/6 bg-white/[0.03] p-5 transition-all duration-300 hover:border-[#6C3EF4]/30 hover:bg-[#6C3EF4]/5"
                    >
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#6C3EF4]/15 text-[#818cf8]">
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
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-white/30">
                  {pieDatos}
                </p>
                <a
                  href="#acceso"
                  className="group inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[#818cf8] transition-colors hover:text-white"
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
