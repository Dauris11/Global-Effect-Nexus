"use client";

/**
 * Banner rotatorio del Portal Estudiante. Alterna entre el próximo evento de
 * la Fundación (o el saludo, si no hay ninguno), el historial académico y la
 * cita de psicología.
 *
 * Los tres destinos son rutas que el rol `estudiante` puede abrir: el catálogo
 * y el historial por sus propios permisos, y la cita de psicología porque el
 * módulo 22 solo exige sesión (el estudiante nunca entra a `/psicologia`).
 */

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Calendar, ArrowRight, Sparkles, GraduationCap, Heart } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { aFecha } from "@/lib/fechas";
import type { EventoDelPortal } from "@/server/portales/types";

const INTERVALO = 6000;

export function HeroBanner({
  eventoDestacado,
  title,
  subtitle,
}: {
  eventoDestacado?: EventoDelPortal;
  title: string;
  subtitle: string;
}) {
  const locale = useLocale();
  const t = useTranslations("studentPortal");
  const fechaLocaleFns = locale === "en" ? enUS : es;
  const reducirMovimiento = useReducedMotion();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = useMemo(() => {
    const lista = [];

    // Diapositiva 1: el próximo evento; si no hay ninguno, el saludo.
    if (eventoDestacado) {
      lista.push({
        id: "evento",
        badge: t("heroEventBadge"),
        badgeIcon: Sparkles,
        title: eventoDestacado.titulo,
        meta: (
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 font-medium text-white">
              <Calendar className="h-4 w-4" />
              {format(aFecha(eventoDestacado.fecha), "dd MMMM", { locale: fechaLocaleFns })}
            </span>
            <span className="opacity-80">{eventoDestacado.hora_inicio}</span>
            <span className="hidden opacity-80 sm:inline">•</span>
            <span className="capitalize opacity-80">{eventoDestacado.tipo}</span>
          </div>
        ),
        cta: t("heroEventCta"),
        href: "#eventos",
      });
    } else {
      lista.push({
        id: "bienvenida",
        badge: t("heroWelcomeBadge"),
        badgeIcon: Sparkles,
        title,
        meta: <p className="mb-6 text-slate-300">{subtitle}</p>,
        cta: t("viewCatalog"),
        href: "/academico/materias",
      });
    }

    lista.push({
      id: "historial",
      badge: t("heroGradesBadge"),
      badgeIcon: GraduationCap,
      title: t("heroGradesTitle"),
      meta: <p className="mb-6 text-slate-300">{t("heroGradesText")}</p>,
      cta: t("viewHistory"),
      href: "/academico/historial",
    });

    lista.push({
      id: "psicologia",
      badge: t("heroPsychologyBadge"),
      badgeIcon: Heart,
      title: t("heroPsychologyTitle"),
      meta: <p className="mb-6 text-slate-300">{t("heroPsychologyText")}</p>,
      cta: t("requestAppointment"),
      href: "/cita-psicologia",
    });

    return lista;
  }, [eventoDestacado, title, subtitle, t, fechaLocaleFns]);

  useEffect(() => {
    // Quien pide menos movimiento no debe recibir un carrusel que se adelanta
    // solo: el reset de CSS apaga la transición, no el `setInterval`.
    if (reducirMovimiento || slides.length <= 1) return;
    const timer = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % slides.length),
      INTERVALO,
    );
    return () => clearInterval(timer);
  }, [slides.length, reducirMovimiento]);

  const slide = slides[currentSlide] ?? slides[0];

  return (
    <div
      className={cn(
        "relative mb-6 flex min-h-[300px] flex-col justify-center overflow-hidden p-8 text-white md:p-10",
        "rounded-[2rem] bg-[#0a6a8a] shadow-sm dark:bg-[#0c232f]",
        "border border-white/10",
      )}
    >
      {/* Elementos decorativos estáticos */}
      <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent" />

      <div className="relative z-10 max-w-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white">
              <slide.badgeIcon className="h-3.5 w-3.5" />
              {slide.badge}
            </div>

            <h2 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
              {slide.title}
            </h2>

            {slide.meta}

            <Button
              asChild
              className="h-auto rounded-[1rem] bg-[#2096ba] px-8 py-6 font-bold text-white shadow-md shadow-[#2096ba]/20 transition-transform hover:scale-105 hover:bg-[#187a99]"
            >
              {slide.href.startsWith("#") ? (
                <a href={slide.href}>
                  {slide.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              ) : (
                <Link href={slide.href}>
                  {slide.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              )}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Círculos concéntricos (diseño turquesa institucional) */}
      <div className="pointer-events-none absolute right-0 top-1/2 flex h-[400px] w-[400px] -translate-y-1/2 items-center justify-end overflow-hidden pr-0 opacity-[0.25] md:h-[600px] md:w-[600px] md:pr-10">
        <div className="relative flex translate-x-1/4 items-center justify-center">
          {[100, 200, 300, 400, 500, 600, 700].map((d) => (
            <div
              key={d}
              className="absolute rounded-full border border-cyan-200"
              style={{ width: d, height: d }}
            />
          ))}
          <div className="absolute h-[40px] w-[40px] rounded-full bg-cyan-200 opacity-60" />
        </div>
      </div>

      {/* Controles del carrusel */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
        {slides.map((s, index) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              currentSlide === index ? "w-6 bg-primary" : "w-2 bg-white/30 hover:bg-white/50",
            )}
            aria-label={t("heroGoToSlide", { n: index + 1 })}
          />
        ))}
      </div>
    </div>
  );
}
