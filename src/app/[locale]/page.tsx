/**
 * Landing e Ingesta de Portales — Fundación Global Effect (Nexus).
 *
 * Página de entrada institucional para la comunidad de la Fundación:
 * estudiantes activos, personal docente y equipo administrativo.
 *
 * Orden de lectura y estructura:
 *   1. Hero                 · bienvenida al portal e inicio de sesión rápido.
 *   2. Puertas de Acceso    · los 3 portales de entrada principal.
 *   3. Servicios & Módulos  · áreas académicas, salud y comida.
 *   4. Eventos              · calendario e información institucional.
 *   5. Preguntas Frecuentes · ayuda sobre el uso del portal.
 *   6. Footer               · contacto y estado del sistema.
 */
import { getLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/landing/navbar";
import { Hero, type HeroSlide, type HeroDato } from "@/components/landing/hero";
import { Portales } from "@/components/landing/portales";
import { Labor } from "@/components/landing/labor";
import { Patrocinio } from "@/components/landing/patrocinio";
import { Eventos } from "@/components/landing/eventos";
import { PreguntasFrecuentes } from "@/components/landing/preguntas-frecuentes";
import { Acceso } from "@/components/landing/acceso";
import { LandingFooter } from "@/components/landing/footer";
import { slidesActivos, estadisticasLanding, eventosPublicos } from "@/server/landing/queries";
import type { LandingSlide, LandingEstadisticas, EventoPublico } from "@/server/landing/types";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const locale = await getLocale();

  let dbSlides: LandingSlide[] = [];
  let stats: LandingEstadisticas = { estudiantes_activos: 0, materias: 0, patrocinadores: 0 };
  let eventos: EventoPublico[] = [];
  try {
    [dbSlides, stats, eventos] = await Promise.all([
      slidesActivos(),
      estadisticasLanding(),
      eventosPublicos(),
    ]);
  } catch {
    /* BD no disponible: la página se ve completa. */
  }

  const heroSlides: HeroSlide[] =
    dbSlides.length > 0
      ? dbSlides.map((s) => ({
        id: s.id,
        tag: s.subtitulo,
        titulo: s.titulo,
        texto: s.texto,
        imagen: s.imagen_url,
        ctaLabel: s.cta_texto,
        ctaHref: s.cta_enlace,
      }))
      : [
        {
          id: "principal",
          tag: t("heroPlace"),
          titulo: t("heroTitle"),
          texto: t("heroText"),
          imagen: "/hero-slide-1.png",
          ctaLabel: t("heroCta"),
          ctaHref: "/login",
          cta2Label: t("heroCta2"),
          cta2Href: "/comida",
        },
        {
          id: "slide2",
          tag: t("heroSlide2Tag"),
          titulo: t("heroSlide2Title"),
          texto: t("heroSlide2Text"),
          imagen: "/hero-slide-2.png",
          ctaLabel: t("heroCta"),
          ctaHref: "/login",
        },
        {
          id: "slide3",
          tag: t("heroSlide3Tag"),
          titulo: t("heroSlide3Title"),
          texto: t("heroSlide3Text"),
          imagen: "/hero-slide-3.png",
          ctaLabel: t("heroCta"),
          ctaHref: "/login",
        },
      ];

  /**
   * Cifras institucionales (estudiantes activos y materias abiertas).
   * Se excluyen métricas de patrocinadores o donaciones externas.
   */
  const datos: HeroDato[] = (
    [
      { valor: stats.estudiantes_activos, clave: "statsStudents" },
      { valor: stats.materias, clave: "statsSubjects" },
    ] as const
  )
    .filter((d) => d.valor > 0)
    .map((d) => ({
      valor: d.valor,
      label: t(d.clave, { n: d.valor }),
    }));

  return (
    <div className="flex min-h-screen flex-col bg-[#060d18]">
      <Navbar />

      {/* 1 · Hero — AZUL */}
      <Hero
        slides={heroSlides}
        datos={datos}
        lugar={t("heroPlace")}
        pieDatos={t("statsFootnote")}
      />

      {/* 2 · Portales — BLANCO (franja-clara) */}
      <section id="portales" className="franja-clara relative bg-background py-14">
        {/* Blue accent bar */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-primary"
        />
        <div className="mx-auto max-w-6xl px-6">
          <Portales />
        </div>
      </section>

      {/* 3 · Patrocinio — AZUL (franja-oscura) */}
      <Patrocinio />

      {/* 4 · Acceso — BLANCO (franja-clara) */}
      <Acceso />

      {/* 5 · Labor — AZUL (franja-oscura) */}
      <Labor />

      {/* 6 · Eventos — BLANCO (franja-clara) */}
      <Eventos eventos={eventos} />

      {/* 7 · FAQ — AZUL (franja-oscura) */}
      <PreguntasFrecuentes />

      {/* 8 · Footer — OSCURO */}
      <LandingFooter />
    </div>
  );
}
