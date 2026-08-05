/**
 * Sección "Patrocinadores" — rendición de cuentas y trazabilidad.
 * Rediseño completo: tema oscuro profundo, cadena visual, sin tokens viejos.
 */
import { getTranslations } from "next-intl/server";
import { ArrowRight, Receipt, GraduationCap, User, ShieldCheck, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";

const COMPROMISOS = ["traceability", "records", "reports"] as const;
const CADENA = [
  { clave: "contribution", icono: Receipt,       humano: false },
  { clave: "scholarship",  icono: GraduationCap, humano: false },
  { clave: "student",      icono: User,          humano: true  },
] as const;

export async function Patrocinio() {
  const t = await getTranslations("landing");

  return (
    <section
      id="patrocinio"
      aria-labelledby="patrocinio-title"
      className="relative overflow-hidden bg-[#050810] py-24 md:py-32"
    >
      {/* Background mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80rem 50rem at 50% 100%, rgba(108,62,244,0.12) 0%, transparent 70%)",
        }}
      />
      {/* Top line */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#6C3EF4]/40 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#818cf8]">
            {t("sponsorEyebrow")}
          </p>
          <h2
            id="patrocinio-title"
            className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight text-white"
          >
            {t("sponsorTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/45">
            {t("sponsorIntro")}
          </p>
        </div>

        {/* Chain label */}
        <div className="mt-16">
          <p className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            <ShieldCheck className="size-3.5 text-[#818cf8]" aria-hidden />
            {t("chainTitle")}
          </p>

          {/* Chain cards */}
          <ol className="grid gap-4 sm:grid-cols-3">
            {CADENA.map(({ clave, icono: Icono, humano }, i) => (
              <li key={clave} className="relative">
                <div
                  className={[
                    "flex h-full flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5",
                    humano
                      ? "border-rose-400/25 bg-rose-400/[0.05] hover:border-rose-400/40 hover:bg-rose-400/[0.09]"
                      : "border-white/8 bg-white/[0.03] hover:border-[#6C3EF4]/35 hover:bg-[#6C3EF4]/[0.06]",
                  ].join(" ")}
                >
                  {/* Icon + number */}
                  <div className="mb-5 flex items-center justify-between">
                    <span
                      className={[
                        "flex size-12 items-center justify-center rounded-xl",
                        humano
                          ? "bg-rose-400/15 text-rose-400"
                          : "bg-[#6C3EF4]/15 text-[#818cf8]",
                      ].join(" ")}
                    >
                      <Icono className="size-6" strokeWidth={1.5} aria-hidden />
                    </span>
                    <span className="font-mono text-2xl font-bold tabular-nums text-white/15">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                    {t(`chain_${clave}_label` as never)}
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-white">
                    {t(`chain_${clave}_value` as never)}
                  </p>
                  <p className="mt-4 border-t border-white/8 pt-3 text-sm leading-relaxed text-white/45">
                    {t(`chain_${clave}_detail` as never)}
                  </p>
                </div>

                {/* Arrow connector (not after last) */}
                {i < CADENA.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 sm:flex"
                  >
                    <div className="flex size-6 items-center justify-center rounded-full border border-white/15 bg-[#050810] text-white/30">
                      <ArrowRight className="size-3" />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Commitments + CTA */}
        <div className="mt-16 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <dl className="grid gap-x-8 gap-y-8 sm:grid-cols-3">
            {COMPROMISOS.map((clave) => (
              <div key={clave} className="border-t border-white/8 pt-5">
                <dt className="flex items-center gap-2 font-display text-base font-semibold text-white">
                  <Check className="size-4 shrink-0 text-[#818cf8]" aria-hidden />
                  {t(`sponsor_${clave}_title` as never)}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-white/45">
                  {t(`sponsor_${clave}_desc` as never)}
                </dd>
              </div>
            ))}
          </dl>

          <Link
            href="/login"
            className="group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-[#6C3EF4]/50 bg-[#6C3EF4]/15 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:border-[#6C3EF4] hover:bg-[#6C3EF4] active:scale-[0.97]"
          >
            {t("sponsorCta")}
            <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
