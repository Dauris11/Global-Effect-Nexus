/**
 * Banda para patrocinadores — rendición de cuentas.
 *
 * La landing tiene dos lectores con necesidades opuestas: una familia de La Vega
 * que busca un programa, y un patrocinador en Estados Unidos que quiere saber
 * qué se hizo con su aporte. Esta sección es para el segundo, y por eso cambia
 * de temperatura: fondo tinta, etiquetas en mono, cero lenguaje emotivo. La
 * sobriedad *es* el argumento (docs/10-estandar-de-interfaz.md §9).
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
import { SeccionEncabezado } from "./seccion";

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
      className="relative overflow-hidden bg-brand-charcoal py-20 md:py-28"
    >
      <div aria-hidden className="trama-registro absolute inset-0" />

      <div className="relative mx-auto max-w-6xl px-6">
        <SeccionEncabezado
          idTitulo="patrocinio-title"
          tono="oscuro"
          eyebrow={t("sponsorEyebrow")}
          titulo={t("sponsorTitle")}
          intro={t("sponsorIntro")}
        />

        <div className="mt-14">
          <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
            <ShieldCheck className="size-4 text-primary" aria-hidden />
            {t("chainTitle")}
          </p>

          <ol className="grid gap-4 sm:grid-cols-3">
            {CADENA.map(({ clave, icono: Icono, humano }, i) => (
              <li key={clave} className="group relative">
                <div
                  className={cn(
                    "flex h-full flex-col justify-between rounded-xl border p-6",
                    "transition-colors duration-200 ease-out",
                    humano
                      ? "border-brand-accent/40 bg-brand-accent/[0.09] hover:bg-brand-accent/[0.14]"
                      : "border-white/15 bg-white/[0.04] hover:bg-white/[0.08]",
                  )}
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span
                        className={cn(
                          "flex size-12 items-center justify-center rounded-xl",
                          humano
                            ? "bg-brand-accent/20 text-brand-accent"
                            : "bg-white/10 text-white/90",
                        )}
                      >
                        <Icono className="size-6" strokeWidth={1.7} aria-hidden />
                      </span>
                      {/* El orden importa aquí: es una secuencia, no un catálogo. */}
                      <span className="font-mono text-xs font-semibold tabular-nums text-white/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
                      {t(`chain_${clave}_label` as never)}
                    </p>
                    <p className="mt-1 text-base font-semibold text-white">
                      {t(`chain_${clave}_value` as never)}
                    </p>
                  </div>

                  <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-white/65">
                    {t(`chain_${clave}_detail` as never)}
                  </p>
                </div>

                {/* Eslabón: no se dibuja tras el último. */}
                {i < CADENA.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 sm:block"
                  >
                    <div className="flex size-6 items-center justify-center rounded-full border border-white/20 bg-brand-charcoal text-white/60">
                      <ArrowRight className="size-3" />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <dl className="grid gap-x-8 gap-y-8 sm:grid-cols-3">
            {COMPROMISOS.map((clave) => (
              <div key={clave} className="border-t border-white/15 pt-5">
                <dt className="flex items-center gap-2 font-display text-lg font-semibold text-white">
                  <Check className="size-4 shrink-0 text-primary" aria-hidden />
                  {t(`sponsor_${clave}_title` as never)}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-white/65">
                  {t(`sponsor_${clave}_desc` as never)}
                </dd>
              </div>
            ))}
          </dl>

          <Link
            href="/login"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-charcoal transition duration-150 ease-out hover:bg-white/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-charcoal"
          >
            {t("sponsorCta")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
