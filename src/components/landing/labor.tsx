/**
 * Sección "Qué hacemos" — los cuatro programas de la Fundación.
 * Rediseño completo: tema oscuro, acento púrpura, sin tokens del viejo sistema.
 */
import { getTranslations } from "next-intl/server";
import { GraduationCap, Wrench, Brain, Utensils, Check, type LucideIcon } from "lucide-react";

const PROGRAMAS: { clave: string; icono: LucideIcon; color: string; glow: string }[] = [
  { clave: "scholarships", icono: GraduationCap, color: "#60a5fa", glow: "rgba(29,78,216,0.15)" },
  { clave: "training",     icono: Wrench,        color: "#34d399", glow: "rgba(52,211,153,0.12)"  },
  { clave: "wellbeing",    icono: Brain,          color: "#fb7185", glow: "rgba(251,113,133,0.12)" },
  { clave: "meals",        icono: Utensils,       color: "#fbbf24", glow: "rgba(251,191,36,0.12)"  },
];

const PUNTOS = ["p1", "p2", "p3"] as const;

export async function Labor() {
  const t = await getTranslations("landing");

  return (
    <section id="labor" aria-labelledby="labor-title" className="relative bg-[#080c14] py-24 md:py-32">
      {/* Horizontal separator */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/8 to-transparent"
      />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#60a5fa]">
            {t("workEyebrow")}
          </p>
          <h2
            id="labor-title"
            className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight text-white"
          >
            {t("workTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/45">
            {t("workIntro")}
          </p>
        </div>

        {/* Program cards */}
        <ul className="mt-14 grid gap-5 md:grid-cols-2">
          {PROGRAMAS.map(({ clave, icono: Icono, color, glow }) => (
            <li key={clave}>
              <article
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              >
                {/* Top accent bar */}
                <div
                  aria-hidden
                  className="absolute left-0 top-0 h-[2px] w-full transition-all duration-300 group-hover:h-[3px]"
                  style={{ backgroundColor: color, opacity: 0.7 }}
                />
                {/* Radial glow on hover */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(ellipse at top left, ${glow}, transparent 60%)`,
                  }}
                />

                <div className="relative">
                  {/* Icon + tag */}
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className="flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      <Icono className="size-6" strokeWidth={1.5} aria-hidden />
                    </span>
                    <span
                      className="rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em]"
                      style={{ backgroundColor: `${color}12`, color: `${color}cc` }}
                    >
                      {t(`work_${clave}_tag` as never)}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-semibold leading-snug text-white">
                    {t(`work_${clave}_title` as never)}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/45">
                    {t(`work_${clave}_desc` as never)}
                  </p>

                  {/* Checkpoints */}
                  <ul className="mt-5 space-y-2 border-t border-white/8 pt-5">
                    {PUNTOS.map((p) => (
                      <li key={p} className="flex items-center gap-2.5 text-sm text-white/55">
                        <Check
                          className="size-3.5 shrink-0"
                          strokeWidth={2.5}
                          style={{ color }}
                          aria-hidden
                        />
                        <span>{t(`work_${clave}_${p}` as never)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
