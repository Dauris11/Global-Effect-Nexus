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
import { Labor } from "@/components/landing/labor";
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
            titulo: t("heroTitle"),
            texto: t("heroText"),
            ctaLabel: t("heroCta"),
            ctaHref: "/login",
            cta2Label: t("heroCta2"),
            cta2Href: "/comida",
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
      value: new Intl.NumberFormat(locale).format(d.valor),
      label: t(d.clave, { n: d.valor }),
    }));

  return (
    <div className="tema-claro flex min-h-screen flex-col">
      <Navbar />

      <Hero
        slides={heroSlides}
        datos={datos}
        lugar={t("heroPlace")}
        pieDatos={t("statsFootnote")}
      />

      <Acceso />
      <Labor />
      <Eventos eventos={eventos} />
      <PreguntasFrecuentes />
      <LandingFooter />
    </div>
  );
}
