/**
 * Hero del landing — carrusel de 72vh.
 *
 * Cada slide es una fotografía a sangre con un degradado oscuro encima que
 * garantiza el contraste del texto (el titular va en blanco sobre imagen, y
 * sin la capa no habría forma de asegurarlo con fotos arbitrarias).
 *
 * La rotación es de 6 segundos y se detiene cuando la persona toma el control
 * (pausa manual) o cuando el sistema pide menos movimiento.
 */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

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

const INTERVALO = 6000;

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const t = useTranslations("landing");
  const [idx, setIdx] = useState(0);
  const [pausado, setPausado] = useState(false);

  const total = slides.length;

  useEffect(() => {
    if (pausado || total <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % total), INTERVALO);
    return () => clearInterval(id);
  }, [pausado, total]);

  if (total === 0) return null;
  const slide = slides[idx];

  const ir = (delta: number) => {
    setPausado(true);
    setIdx((i) => (i + delta + total) % total);
  };

  return (
    <section
      aria-roledescription="carousel"
      className="relative isolate flex h-[72vh] min-h-[420px] items-center overflow-hidden"
    >
      {/* Se pintan todas las imágenes y se cruza la opacidad, en vez de montar
          y desmontar una sola: así el navegador no vuelve a decodificar la
          foto cada seis segundos. Solo la primera lleva `priority` —es la que
          entra en el LCP—; el resto se cargan perezosas.

          Van con `next/image` y no como `background-image` porque así se
          sirven en AVIF/WebP y redimensionadas: los PNG de origen pesan casi
          800 KB cada uno. */}
      {slides.map((s, i) =>
        s.imagen ? (
          <Image
            key={s.id}
            src={s.imagen}
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            priority={i === 0}
            loading={i === 0 ? undefined : "lazy"}
            className={`absolute inset-0 -z-10 object-cover transition-opacity duration-500 ${
              i === idx ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null,
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900/60 via-slate-900/70 to-slate-900/90"
      />

      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div key={slide.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
          {slide.tag && (
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white">
              <Sparkles aria-hidden className="h-3.5 w-3.5" />
              {slide.tag}
            </p>
          )}

          <h1
            className="font-heading max-w-3xl font-bold leading-[1.05] text-white"
            style={{ fontSize: "clamp(28px, 5.5vw, 56px)", letterSpacing: "-0.03em" }}
          >
            {slide.titulo}
          </h1>

          {slide.texto && (
            <p
              className="mt-5 max-w-xl leading-relaxed text-slate-300"
              style={{ fontSize: "clamp(14px, 2vw, 18px)" }}
            >
              {slide.texto}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {slide.ctaLabel && slide.ctaHref && (
              <Link
                href={slide.ctaHref}
                className="rounded-xl bg-[#2096BA] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#2096BA]/30 transition-all hover:-translate-y-0.5 hover:bg-[#187a99]"
              >
                {slide.ctaLabel}
              </Link>
            )}
            {slide.cta2Label && slide.cta2Href && (
              <Link
                href={slide.cta2Href}
                className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                {slide.cta2Label}
              </Link>
            )}
          </div>
        </div>

        {total > 1 && (
          <div className="mt-10 flex items-center gap-4">
            <button
              type="button"
              onClick={() => ir(-1)}
              aria-label={t("heroPrev")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <ChevronLeft aria-hidden className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => ir(1)}
              aria-label={t("heroNext")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <ChevronRight aria-hidden className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={s.titulo}
                  aria-current={i === idx}
                  onClick={() => {
                    setPausado(true);
                    setIdx(i);
                  }}
                  className={
                    i === idx
                      ? "h-2 w-8 rounded-full bg-white transition-all"
                      : "h-2 w-2 rounded-full bg-white/40 transition-all hover:bg-white/70"
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
