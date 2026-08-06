/**
 * Bloque "Portales" — las puertas de entrada por rol.
 *
 * Cada tarjeta lleva el color de su portal en tres sitios coordinados: la
 * barra superior (que solo aparece al pasar el cursor), el azulejo del icono
 * y los checks de la lista. Las clases van literales y no compuestas porque
 * Tailwind necesita verlas completas para generarlas.
 */
import { ArrowRight, CheckCircle2, GraduationCap, BookOpen, ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface Portal {
  clave: string;
  href: string;
  icono: typeof GraduationCap;
  /** Degradados y acentos, escritos literales para que Tailwind los compile. */
  barra: string;
  azulejo: string;
  acento: string;
  features: string[];
}

const PORTALES: Portal[] = [
  {
    clave: "estudiante",
    href: "/portal/estudiante",
    icono: GraduationCap,
    barra: "bg-gradient-to-r from-[#2096BA] to-[#0a6a8a]",
    azulejo: "bg-gradient-to-br from-[#2096BA] to-[#0a6a8a]",
    acento: "text-[#2096BA]",
    features: ["portal_academico", "portal_calendario", "portal_expedientes"],
  },
  {
    clave: "docente",
    href: "/portal/profesor",
    icono: BookOpen,
    barra: "bg-gradient-to-r from-emerald-500 to-emerald-700",
    azulejo: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    acento: "text-emerald-600",
    features: ["portal_academico", "portal_calendario", "portal_panel"],
  },
  {
    clave: "panel",
    href: "/dashboard",
    icono: ClipboardList,
    barra: "bg-gradient-to-r from-orange-500 to-orange-700",
    azulejo: "bg-gradient-to-br from-orange-500 to-orange-700",
    acento: "text-orange-600",
    features: ["portal_expedientes", "portal_panel", "portal_calendario"],
  },
];

export function Portales() {
  const t = useTranslations("landing");

  return (
    <section id="portales" className="bg-slate-50 py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="text-xs uppercase tracking-widest text-[#2096BA]">
          {t("accessEyebrow")}
        </p>
        <h2 className="font-heading mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
          {t("accessTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-slate-600">{t("accessIntro")}</p>

        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {PORTALES.map((p) => {
            const Icono = p.icono;
            return (
              <li key={p.clave}>
                <Link
                  href={p.href}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <span
                    aria-hidden
                    className={`h-1 w-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${p.barra}`}
                  />

                  <div className="flex flex-1 flex-col p-6">
                    <span
                      aria-hidden
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${p.azulejo}`}
                    >
                      <Icono className="h-6 w-6" />
                    </span>

                    <h3 className="font-heading mt-5 text-lg font-bold text-slate-900">
                      {t(`portal_${p.clave}` as "portal_estudiante")}
                    </h3>

                    <ul className="mt-4 flex flex-1 flex-col gap-2">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 aria-hidden className={`h-4 w-4 shrink-0 ${p.acento}`} />
                          {t(f as "portal_academico")}
                        </li>
                      ))}
                    </ul>

                    <span
                      className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold ${p.acento}`}
                    >
                      {t("access_portal_cta")}
                      <ArrowRight
                        aria-hidden
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
