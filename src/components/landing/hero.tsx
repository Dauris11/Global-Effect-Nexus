/**
 * Hero de la landing — "Impact Editorial".
 *
 * Mejoras:
 * - Titular con firma Marker en turquesa de marca.
 * - Tarjetas de métricas del sistema verificables con iconos e indicadores tabulares.
 * - Controles interactivos de diapositivas con barra de progreso responsiva.
 * - Animaciones de entrada fluidas y veladura atmosférica.
 */
"use client";

import { useEffect, useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Users, HeartHandshake, BookOpen, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Marker } from "@/components/brand/marker";
import { LienzoTrazo } from "@/components/ui/lienzo-trazo";

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
  value: string;
  label: string;
}

const INTERVALO = 7000;

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
    "inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  const style =
    variant === "primary"
      ? "bg-primary text-primary-foreground shadow-sm hover:bg-brand-teal-dark hover:shadow"
      : "border border-foreground/15 bg-card/80 text-foreground backdrop-blur-sm hover:bg-accent hover:border-foreground/25";
  return href.startsWith("http") ? (
    <a href={href} className={cn(base, style)}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cn(base, style)}>
      {children}
    </Link>
  );
}

function Titular({ text }: { text: string }) {
  const words = text.trim().split(" ");
  const last = words.pop() ?? "";
  return (
    <h1 className="font-display text-[clamp(2.6rem,5.6vw,4.4rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-foreground">
      {words.join(" ")}{" "}
      <span className="relative inline-block whitespace-nowrap">
        {last}
        <Marker className="absolute -bottom-1 left-0 h-4 w-full text-primary" />
      </span>
    </h1>
  );
}

const STAT_ICONS = [Users, HeartHandshake, BookOpen];

export function Hero({
  slides,
  datos,
  lugar,
  pieDatos,
}: {
  slides: HeroSlide[];
  datos: HeroDato[];
  lugar: string;
  pieDatos: string;
}) {
  const items = slides;
  const [idx, setIdx] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (items.length < 2 || reduce) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % items.length), INTERVALO);
    return () => clearInterval(t);
  }, [items.length, reduce]);

  if (items.length === 0) return null;
  const s = items[idx];
  const go = (n: number) => setIdx((n + items.length) % items.length);
  const conFoto = Boolean(s.imagen);

  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-background to-accent/20">
      {/* Atmosphere background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(48rem 36rem at 88% -10%, rgba(29,95,212,.08), transparent 65%)",
        }}
      />

      <LienzoTrazo />

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
        <LazyMotion features={domAnimation}>
          <div
            className={cn(
              "grid items-center gap-12",
              conFoto && "md:grid-cols-[1.1fr_0.9fr] md:gap-16",
            )}
          >
            {/* Main Text Content */}
            <div className={cn(!conFoto && "max-w-3xl")}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-primary">
                <MapPin className="size-3" aria-hidden />
                <span>{s.tag ?? lugar}</span>
              </div>

              <AnimatePresence mode="wait">
                <m.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
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

              {/* Call to Actions */}
              <div className="mt-9 flex flex-wrap gap-3.5">
                {s.ctaLabel && s.ctaHref && (
                  <Cta href={s.ctaHref} variant="primary">
                    {s.ctaLabel}
                    <ArrowRight className="size-4" aria-hidden />
                  </Cta>
                )}
                {s.cta2Label && s.cta2Href && (
                  <Cta href={s.cta2Href} variant="secondary">
                    {s.cta2Label}
                  </Cta>
                )}
              </div>

              {/* Slide Controls */}
              {items.length > 1 && (
                <div className="mt-10 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => go(idx - 1)}
                    aria-label="Anterior"
                    className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(idx + 1)}
                    aria-label="Siguiente"
                    className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </button>
                  <div role="tablist" className="ml-2 flex gap-2">
                    {items.map((it, i) => (
                      <button
                        key={it.id}
                        type="button"
                        role="tab"
                        aria-selected={i === idx}
                        aria-label={it.titulo}
                        onClick={() => setIdx(i)}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-200",
                          i === idx
                            ? "w-8 bg-primary"
                            : "w-2 bg-foreground/20 hover:bg-foreground/40",
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Photo Column */}
            {conFoto && (
              <div className="relative">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-brand-charcoal shadow-lg">
                  <AnimatePresence mode="wait">
                    <m.div
                      key={s.id}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45 }}
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${s.imagen})` }}
                      role="img"
                      aria-label={s.titulo}
                    />
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* System Data Cards */}
          {datos.length > 0 && (
            <div className="mt-16 border-t border-border pt-8">
              <div className="grid gap-4 sm:grid-cols-3">
                {datos.map((d, index) => {
                  const Icon = STAT_ICONS[index % STAT_ICONS.length];
                  return (
                    <div
                      key={d.label}
                      className="flex items-center gap-4 rounded-xl border border-border bg-card/80 p-5 shadow-xs transition-colors hover:bg-card"
                    >
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-6" aria-hidden />
                      </div>
                      <div>
                        <dd className="font-mono text-2xl font-semibold tabular-nums text-foreground">
                          {d.value}
                        </dd>
                        <dt className="text-sm font-medium text-muted-foreground">{d.label}</dt>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
                {pieDatos}
              </p>
            </div>
          )}
        </LazyMotion>
      </div>
    </section>
  );
}
