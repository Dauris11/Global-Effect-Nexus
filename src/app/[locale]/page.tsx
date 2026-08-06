/**
 * Landing — Fundación Global Effect (Nexus).
 *
 * Página pública de entrada. Orden de lectura:
 *   1. Navbar          · barra fija con acceso a comida y estado del sistema.
 *   2. Hero            · carrusel de 72vh con la propuesta y los CTA.
 *   3. Cifras          · datos reales de la plataforma.
 *   4. Portales        · las puertas de entrada por rol.
 *   5. Eventos         · próximas actividades (se oculta si no hay).
 *   6. Propuesta       · qué resuelve la plataforma.
 *   7. Footer          · contacto y accesos.
 *
 * Los datos salen de Supabase; si la base no responde, la página se sigue
 * pintando con los slides de respaldo y sin cifras.
 */
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/landing/navbar";
import { Hero, type HeroSlide } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/stats-bar";
import { Portales } from "@/components/landing/portales";
import { Eventos } from "@/components/landing/eventos";
import { PropuestaValor } from "@/components/landing/propuesta-valor";
import { LandingFooter } from "@/components/landing/footer";
import { slidesActivos, estadisticasLanding, eventosPublicos } from "@/server/landing/queries";
import type { LandingSlide, LandingEstadisticas, EventoPublico } from "@/server/landing/types";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const t = await getTranslations("landing");

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
    /* BD no disponible: la página se ve completa igual. */
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

  const cifras = [
    {
      clave: "estudiantes",
      valor: String(stats.estudiantes_activos),
      label: t("statsStudents", { n: stats.estudiantes_activos }),
    },
    {
      clave: "materias",
      valor: String(stats.materias),
      label: t("statsSubjects", { n: stats.materias }),
    },
    {
      clave: "patrocinadores",
      valor: String(stats.patrocinadores),
      label: t("statsSponsors", { n: stats.patrocinadores }),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <Hero slides={heroSlides} />
      <StatsBar cifras={cifras} />
      <Portales />
      <Eventos eventos={eventos} />
      <PropuestaValor />
      <LandingFooter />
    </div>
  );
}
