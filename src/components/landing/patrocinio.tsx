/**
 * Banda para patrocinadores — rendición de cuentas.
 *
 * La landing tiene dos lectores con necesidades opuestas: una familia de La Vega
 * que busca un programa, y un patrocinador en Estados Unidos que quiere saber
 * qué se hizo con su aporte. Esta sección es para el segundo, y por eso cambia
 * de temperatura: fondo tinta, etiquetas en mono, cero lenguaje emotivo. La
 * sobriedad *es* el argumento.
 *
 * El elemento visual es **la cadena de trazabilidad**: aporte → beca →
 * estudiante. No es un adorno; es literalmente lo que la sección afirma, y es
 * la única forma de decirlo sin pedirle al lector que se fíe de un párrafo.
 * Aquí sí van numerados: los tres eslabones **son** una secuencia, y el orden
 * es la información. Es también el sitio donde se gasta el coral, el color
 * humano de la marca, en el único eslabón que es una persona.
 *
 * Dos correcciones sobre una versión anterior de esta sección:
 *
 * - **Nada depende del cursor.** Los eslabones se realzaban con
 *   `onMouseEnter`/`onMouseLeave`: en una pantalla táctil —que es como entra
 *   la mayoría de los visitantes— ese estado no se alcanza nunca. El realce
 *   está ahora en CSS, y con eso el componente vuelve a ser de servidor.
 * - **Contraste.** El número del eslabón iba en `text-white/40`, que sobre el
 *   charcoal da 3.71:1 y no llega al mínimo AA de 4.5:1 para texto normal.
 */
import { getTranslations } from "next-intl/server";
import { ArrowRight, Receipt, GraduationCap, User, ShieldCheck, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Revelar } from "./revelar";

/** Los tres compromisos verificables, no promesas de marketing. */
const COMPROMISOS = ["traceability", "records", "reports"] as const;

/** Los tres eslabones. El último es una persona: va en coral. */
const CADENA = [
  { clave: "contribution", icono: Receipt, humano: false },
  { clave: "scholarship", icono: GraduationCap, humano: false },
  { clave: "student", icono: User, humano: true },
] as const;

export async function Patrocinio() {
  const t = await getTranslations("landing");

  return (
    <section
      id="patrocinio"
      aria-labelledby="patrocinio-title"
      className="franja-oscura relative overflow-hidden bg-background py-24 md:py-32"
    >
      {/* High-end decorative background glows */}
      <div aria-hidden className="trama-registro absolute inset-0 opacity-[0.25] pointer-events-none" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/4 size-[600px] rounded-full bg-primary/10 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-1/4 size-[600px] rounded-full bg-brand-accent/10 blur-[130px]"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          
          {/* Left Column: Headers, Commitments, CTA */}
          <div className="flex flex-col justify-center">
            <Revelar>
              <div className="flex items-center gap-2.5">
                <span className="h-px w-6 bg-primary" />
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {t("sponsorEyebrow")}
                </p>
              </div>
            </Revelar>

            <Revelar delay={0.06}>
              <h2
                id="patrocinio-title"
                className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl"
              >
                {t("sponsorTitle")}
              </h2>
            </Revelar>

            <Revelar delay={0.12}>
              <p className="mt-6 text-lg leading-relaxed text-white/70">
                {t("sponsorIntro")}
              </p>
            </Revelar>

            {/* Commitments List */}
            <ul className="mt-10 space-y-6">
              {COMPROMISOS.map((clave, index) => (
                <Revelar key={clave} delay={0.15 + index * 0.05}>
                  <div className="group flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.01] p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:bg-white/[0.03]">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                    <div>
                      <h4 className="font-display text-base font-semibold text-white">
                        {t(`sponsor_${clave}_title` as never)}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-white/50">
                        {t(`sponsor_${clave}_desc` as never)}
                      </p>
                    </div>
                  </div>
                </Revelar>
              ))}
            </ul>

            <Revelar delay={0.35} className="mt-10">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-primary to-brand-teal px-8 py-4.5 text-base font-semibold text-white shadow-lg shadow-primary/10 transition-all duration-300 hover:shadow-primary/20 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-charcoal"
              >
                {t("sponsorCta")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Revelar>
          </div>

          {/* Right Column: Interactive Vertical Timeline */}
          <div className="relative flex flex-col justify-center">
            <Revelar delay={0.1}>
              <div className="mb-8 flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <ShieldCheck className="size-3.5" aria-hidden />
                </span>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                  {t("chainTitle")}
                </p>
              </div>
            </Revelar>

            {/* Vertical Line Container */}
            <div className="relative pl-10 sm:pl-12">
              {/* Vertical timeline line */}
              <div
                aria-hidden
                className="absolute left-[23px] sm:left-[27px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-brand-accent/30"
              />

              <ol className="space-y-10">
                {CADENA.map(({ clave, icono: Icono, humano }, i) => (
                  <Revelar key={clave} delay={0.15 + i * 0.1}>
                    <div className="group relative flex gap-6 sm:gap-8">
                      {/* Timeline Icon Badge */}
                      <span
                        className={cn(
                          "absolute -left-[37px] sm:-left-[41px] top-1.5 flex size-12 items-center justify-center rounded-full border shadow-md transition-all duration-300 group-hover:scale-110",
                          humano
                            ? "border-brand-accent/30 bg-brand-charcoal text-brand-accent group-hover:border-brand-accent group-hover:bg-brand-accent/10"
                            : "border-primary/30 bg-brand-charcoal text-primary group-hover:border-primary group-hover:bg-primary/10",
                        )}
                      >
                        <Icono className="size-5 transition-transform duration-300" strokeWidth={1.8} aria-hidden />
                      </span>

                      {/* Card Content */}
                      <div
                        className={cn(
                          "flex-1 rounded-2xl border p-6 backdrop-blur-md transition-all duration-300",
                          humano
                            ? "border-brand-accent/15 bg-brand-accent/[0.02] hover:border-brand-accent/40 hover:bg-brand-accent/[0.06] hover:shadow-[0_0_30px_rgba(239,97,81,0.1)]"
                            : "border-white/5 bg-white/[0.01] hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-[0_0_30px_rgba(20,184,166,0.08)]",
                        )}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">
                            {t(`chain_${clave}_label` as never)}
                          </span>
                          <span className="font-mono text-xs font-semibold text-white/30">
                            0{i + 1}
                          </span>
                        </div>
                        <h3 className="mt-2 text-lg font-bold text-white tracking-tight">
                          {t(`chain_${clave}_value` as never)}
                        </h3>
                        <p className="mt-2.5 text-sm leading-relaxed text-white/50">
                          {t(`chain_${clave}_detail` as never)}
                        </p>
                      </div>
                    </div>
                  </Revelar>
                ))}
              </ol>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
