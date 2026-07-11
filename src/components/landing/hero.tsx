/**
 * Hero editorial (Impact Editorial). Asimétrico: titular Fraunces con la
 * última palabra subrayada por el trazo de marcador (firma) + descripción y
 * CTAs a la izquierda; foto dúotono enmarcada con chips de datos (mono) a la
 * derecha. Rota entre diapositivas (BD o por defecto) con crossfade. Accesible
 * (ARIA, reduced-motion pausa el autoplay).
 */
"use client";

import { useEffect, useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Marker } from "@/components/brand/marker";

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

export interface HeroChip {
  value: string;
  label: string;
}

const INTERVALO = 6500;

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
    "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition duration-200 ease-out active:scale-[0.97]";
  const style =
    variant === "primary"
      ? "bg-brand-teal text-white shadow-lg shadow-brand-teal/25 hover:bg-brand-teal-dark"
      : "border border-foreground/15 text-foreground hover:bg-foreground/5";
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

/** Titular con la última palabra subrayada por el marcador. */
function Titular({ text }: { text: string }) {
  const words = text.trim().split(" ");
  const last = words.pop() ?? "";
  return (
    <h1 className="font-display text-[clamp(2.4rem,6vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-foreground">
      {words.join(" ")}{" "}
      <span className="relative inline-block whitespace-nowrap">
        {last}
        <Marker className="absolute -bottom-1 left-0 h-4 w-full" />
      </span>
    </h1>
  );
}

export function Hero({ slides, chips }: { slides: HeroSlide[]; chips: HeroChip[] }) {
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

  return (
    <section className="relative overflow-hidden">
      {/* Atmósfera: halo teal suave arriba-derecha */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(42rem 30rem at 88% -8%, rgba(32,150,186,.10), transparent 60%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:gap-14 md:py-24">
        <LazyMotion features={domAnimation}>
          {/* Columna de texto */}
          <div>
            <AnimatePresence mode="wait">
              <m.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
              >
                <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-brand-teal">
                  {s.tag ?? "Fundación Global Effect"}
                </p>
                <Titular text={s.titulo} />
                {s.texto && (
                  <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
                    {s.texto}
                  </p>
                )}
                <div className="mt-9 flex flex-wrap gap-3">
                  {s.ctaLabel && s.ctaHref && (
                    <Cta href={s.ctaHref} variant="primary">
                      {s.ctaLabel}
                      <ArrowRight className="size-4" />
                    </Cta>
                  )}
                  {s.cta2Label && s.cta2Href && (
                    <Cta href={s.cta2Href} variant="secondary">
                      {s.cta2Label}
                    </Cta>
                  )}
                </div>
              </m.div>
            </AnimatePresence>

            {items.length > 1 && (
              <div className="mt-10 flex items-center gap-4">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => go(idx - 1)}
                    aria-label="Anterior"
                    className="flex size-9 items-center justify-center rounded-full border border-foreground/15 text-foreground/70 transition hover:bg-foreground/5"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    onClick={() => go(idx + 1)}
                    aria-label="Siguiente"
                    className="flex size-9 items-center justify-center rounded-full border border-foreground/15 text-foreground/70 transition hover:bg-foreground/5"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
                <div role="tablist" className="flex gap-1.5">
                  {items.map((it, i) => (
                    <button
                      key={it.id}
                      role="tab"
                      aria-selected={i === idx}
                      aria-label={`Diapositiva ${i + 1}`}
                      onClick={() => setIdx(i)}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        i === idx ? "w-7 bg-brand-teal" : "w-1.5 bg-foreground/20 hover:bg-foreground/40",
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna de imagen (dúotono) con chips */}
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-brand-charcoal shadow-2xl shadow-brand-charcoal/20 sm:aspect-[5/4] md:aspect-[4/5]">
              <AnimatePresence mode="wait">
                <m.div
                  key={s.id}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute inset-0"
                >
                  {s.imagen && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${s.imagen})`, filter: "grayscale(.25) contrast(1.05)" }}
                      role="img"
                      aria-label={s.titulo}
                    />
                  )}
                  {/* Dúotono teal/tinta */}
                  <div className="absolute inset-0 mix-blend-multiply" style={{ background: "linear-gradient(150deg, rgba(32,150,186,.55), rgba(15,30,46,.75))" }} />
                </m.div>
              </AnimatePresence>
            </div>

            {/* Chips de datos flotantes (mono) */}
            {chips[0] && (
              <div className="absolute -left-3 top-8 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl sm:-left-6">
                <div className="font-mono text-xl font-bold text-foreground">{chips[0].value}</div>
                <div className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{chips[0].label}</div>
              </div>
            )}
            {chips[1] && (
              <div className="absolute -right-3 bottom-8 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl sm:-right-6">
                <div className="font-mono text-xl font-bold text-brand-accent">{chips[1].value}</div>
                <div className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{chips[1].label}</div>
              </div>
            )}
          </div>
        </LazyMotion>
      </div>
    </section>
  );
}
