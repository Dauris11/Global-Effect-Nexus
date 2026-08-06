"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Sparkles, GraduationCap, LineChart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type { EventoDelPortal } from "@/server/portales/types";

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
  const fechaLocale = locale === "en" ? enUS : es;
  const [currentSlide, setCurrentSlide] = useState(0);

  // Definir las diapositivas (slides)
  const slides = [];

  // Slide 1: Próximo Evento (si existe)
  if (eventoDestacado) {
    slides.push({
      id: "evento",
      badge: "PRÓXIMO EVENTO",
      badgeColor: "bg-red-500/20 text-red-400",
      badgeIcon: Sparkles,
      title: eventoDestacado.titulo,
      meta: (
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-300">
          <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg text-primary-foreground font-medium">
            <Calendar className="h-4 w-4 text-primary" />
            {format(new Date(eventoDestacado.fecha), "dd 'de' MMMM", { locale: fechaLocale })}
          </span>
          <span className="opacity-80">{eventoDestacado.hora_inicio}</span>
          <span className="opacity-80 hidden sm:inline">•</span>
          <span className="opacity-80 capitalize">{eventoDestacado.tipo}</span>
        </div>
      ),
      buttonText: "Ver Detalles",
      image: "/hero-illustration.png",
    });
  } else {
    // Si no hay evento, Slide 1 es el saludo general
    slides.push({
      id: "bienvenida",
      badge: "BIENVENIDO AL PORTAL",
      badgeColor: "bg-primary/20 text-primary",
      badgeIcon: Sparkles,
      title: title,
      meta: <p className="mb-6 text-slate-300">{subtitle}</p>,
      buttonText: "Ir al Dashboard",
      image: "/hero-illustration.png",
    });
  }

  // Slide 2: Historial Académico
  slides.push({
    id: "historial",
    badge: "DESEMPEÑO ACADÉMICO",
    badgeColor: "bg-emerald-500/20 text-emerald-400",
    badgeIcon: GraduationCap,
    title: "Consulta tus notas y progreso",
    meta: <p className="mb-6 text-slate-300">Mantente al tanto de tu índice académico (GPA) y créditos acumulados este cuatrimestre.</p>,
    buttonText: "Ver Calificaciones",
    image: "/hero-illustration-2.png",
  });

  // Slide 3: Datos de la Fundación
  slides.push({
    id: "datos",
    badge: "MÉTRICAS CLAVE",
    badgeColor: "bg-blue-500/20 text-blue-400",
    badgeIcon: LineChart,
    title: "Transparencia de la Fundación",
    meta: <p className="mb-6 text-slate-300">Revisa cómo vamos impactando con becas y oportunidades de estudio a nivel nacional.</p>,
    buttonText: "Ver Reportes",
    image: "/hero-illustration-3.png",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Cambia cada 6 segundos
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className={cn(
      "relative overflow-hidden p-8 md:p-10 text-white mb-6 min-h-[300px] flex flex-col justify-center",
      "rounded-[2rem] bg-[#0a6a8a] shadow-sm dark:bg-[#0c232f]",
      "border border-white/10"
    )}>
      {/* Elementos Decorativos Estáticos */}
      <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent" />
      
      <div className="relative z-10 max-w-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <div className={cn("mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-white/15 text-white border border-white/20")}>
              <slide.badgeIcon className="h-3.5 w-3.5" />
              {slide.badge}
            </div>
            
            <h2 className="mb-3 text-3xl md:text-4xl font-bold leading-tight tracking-tight text-white">
              {slide.title}
            </h2>
            
            {slide.meta}
            
            <Button className="bg-[#2096ba] text-white font-bold hover:bg-[#187a99] rounded-[1rem] px-8 py-6 h-auto transition-transform hover:scale-105 shadow-md shadow-[#2096ba]/20">
              {slide.buttonText} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Círculos concéntricos (Diseño Turquesa Institucional) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] opacity-[0.25] pointer-events-none overflow-hidden flex items-center justify-end pr-0 md:pr-10">
        <div className="relative flex items-center justify-center translate-x-1/4">
          <div className="absolute w-[100px] h-[100px] rounded-full border border-cyan-200" />
          <div className="absolute w-[200px] h-[200px] rounded-full border border-cyan-200" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-cyan-200" />
          <div className="absolute w-[400px] h-[400px] rounded-full border border-cyan-200" />
          <div className="absolute w-[500px] h-[500px] rounded-full border border-cyan-200" />
          <div className="absolute w-[600px] h-[600px] rounded-full border border-cyan-200" />
          <div className="absolute w-[700px] h-[700px] rounded-full border border-cyan-200" />
          {/* Central solid circle */}
          <div className="absolute w-[40px] h-[40px] rounded-full bg-cyan-200 opacity-60" />
        </div>
      </div>

      {/* Controles del Carousel (Puntitos) */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              currentSlide === index ? "w-6 bg-primary" : "w-2 bg-white/30 hover:bg-white/50"
            )}
            aria-label={`Ir a la diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
