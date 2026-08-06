/**
 * Bloque "Propuesta de valor" — las tres cosas que la plataforma resuelve.
 *
 * Va después de los portales a propósito: primero se le da a cada persona su
 * puerta de entrada, y solo después se explica el porqué a quien siga leyendo.
 */
import { GraduationCap, HeartHandshake, Utensils } from "lucide-react";
import { useTranslations } from "next-intl";

const PILARES = [
  { clave: "scholarships", icono: GraduationCap },
  { clave: "wellbeing", icono: HeartHandshake },
  { clave: "meals", icono: Utensils },
] as const;

export function PropuestaValor() {
  const t = useTranslations("landing");

  return (
    <section className="bg-slate-50 py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="text-xs uppercase tracking-widest text-[#2096BA]">{t("workEyebrow")}</p>
        <h2 className="font-heading mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
          {t("workTitle")}
        </h2>

        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {PILARES.map(({ clave, icono: Icono }) => (
            <li
              key={clave}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6"
            >
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2096BA]/10 text-[#2096BA]"
              >
                <Icono className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">
                  {t(`work_${clave}_title` as "work_scholarships_title")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {t(`work_${clave}_desc` as "work_scholarships_desc")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
