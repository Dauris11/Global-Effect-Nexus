/**
 * Landing pública — dirección "Impact Editorial".
 *   Navbar · Hero editorial (publicidad configurable en BD o por defecto) ·
 *   cinta marquee de la promesa · barra-ledger de estadísticas (mono) ·
 *   programas en bento · próximos eventos (lista editorial) · valores · footer.
 * Render dinámico: consulta la BD por petición (no se prerenderiza en build).
 */
import { getLocale, getTranslations } from "next-intl/server";
import { Shield, BarChart3, Bot, CalendarDays, MapPin, type LucideIcon } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Hero, type HeroSlide, type HeroChip } from "@/components/landing/hero";
import { Marquee } from "@/components/landing/marquee";
import { Programs } from "@/components/landing/programs";
import { LandingFooter } from "@/components/landing/footer";
import { slidesActivos, estadisticasLanding, eventosPublicos } from "@/server/landing/queries";
import type { LandingSlide, LandingEstadisticas, EventoPublico } from "@/server/landing/types";

export const dynamic = "force-dynamic";

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`;

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
    /* BD no disponible: valores por defecto */
  }

  const heroSlides: HeroSlide[] =
    dbSlides.length > 0
      ? dbSlides.map((s) => ({
          id: s.id,
          tag: s.subtitulo,
          titulo: s.titulo,
          texto: s.texto,
          imagen: s.imagen_url ?? IMG("1523240795612-9a054b0db644"),
          ctaLabel: s.cta_texto,
          ctaHref: s.cta_enlace,
        }))
      : [
          {
            id: "d1",
            titulo: t("heroDefaultTitle"),
            texto: t("heroDefaultSubtitle"),
            imagen: IMG("1523240795612-9a054b0db644"),
            ctaLabel: t("portalTechnicalTitle"),
            ctaHref: "/login",
            cta2Label: t("portalAppointmentTitle"),
            cta2Href: "/login",
          },
          {
            id: "d2",
            tag: t("heroSlide2Tag"),
            titulo: t("heroSlide2Title"),
            texto: t("heroSlide2Desc"),
            imagen: IMG("1541339907198-e08756dedf3f"),
            ctaLabel: t("heroCtaRequirements"),
            ctaHref: "/login",
          },
          {
            id: "d3",
            tag: t("heroSlide3Tag"),
            titulo: t("heroSlide3Title"),
            texto: t("heroSlide3Desc"),
            imagen: IMG("1522202176988-66273c2fd55f"),
            ctaLabel: t("heroCtaCalendar"),
            ctaHref: "/login",
          },
        ];

  const chips: HeroChip[] = [
    { value: String(stats.estudiantes_activos || "1,200+"), label: t("statsStudents") },
    { value: "98%", label: t("statSatisfaction") },
  ];

  const ledger = [
    { value: String(stats.estudiantes_activos || "1,200+"), label: t("statsStudents") },
    { value: String(stats.materias || "86"), label: t("statsSubjects") },
    { value: String(stats.patrocinadores || "340+"), label: t("statsSponsors") },
    { value: "98%", label: t("statSatisfaction") },
  ];

  const valores: { icon: LucideIcon; title: string; desc: string }[] = [
    { icon: Shield, title: t("trustSecureTitle"), desc: t("trustSecureDesc") },
    { icon: BarChart3, title: t("trustReportsTitle"), desc: t("trustReportsDesc") },
    { icon: Bot, title: t("trustAiTitle"), desc: t("trustAiDesc") },
  ];

  const fmtFecha = (f: string) =>
    new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" }).format(new Date(f));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Hero slides={heroSlides} chips={chips} />
      <Marquee />

      {/* Barra-ledger de estadísticas (cifras mono) */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-border md:grid-cols-4">
          {ledger.map((s) => (
            <div key={s.label} className="bg-card px-6 py-8">
              <div className="font-mono text-3xl font-bold tabular-nums text-foreground">
                {s.value}
              </div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Programs />

      {/* Próximos eventos — lista editorial */}
      {eventos.length > 0 && (
        <section id="eventos" aria-labelledby="eventos-title" className="border-t border-border bg-card py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-teal">
                  {t("eyebrowCalendar")}
                </p>
                <h2 id="eventos-title" className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
                  {t("eventsTitle")}
                </h2>
              </div>
            </div>
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {eventos.map((e) => (
                <li key={e.id} className="flex items-center gap-6 py-5">
                  <span className="w-16 shrink-0 font-mono text-sm uppercase text-brand-teal">
                    {fmtFecha(e.fecha)}
                  </span>
                  <span className="flex-1 font-medium text-foreground">{e.titulo}</span>
                  {e.ubicacion && (
                    <span className="hidden items-center gap-1 font-mono text-xs text-muted-foreground sm:flex">
                      <MapPin className="size-3.5" />
                      {e.ubicacion}
                    </span>
                  )}
                  <CalendarDays className="size-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Valores / propuesta */}
      <section className="py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-3">
          {valores.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="border-t-2 border-brand-teal pt-5">
              <Icon className="size-6 text-brand-teal" />
              <h3 className="mt-3 font-display text-xl font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
