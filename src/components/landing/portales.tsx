/**
 * Bloque "Portales" — las seis puertas de entrada por rol.
 *
 * Están los seis del catálogo (03-modulos-funcionales.md § Portales por rol),
 * no solo los que tienen pantalla propia: la landing es pública y su trabajo
 * aquí es que cada persona reconozca la suya de un vistazo, aunque el acceso
 * real lo decida el rol de su cuenta.
 *
 * Cada tarjeta lleva el color de su portal en tres sitios coordinados —barra
 * superior, azulejo del icono y flecha del CTA— y ese color es el mismo del
 * banner que se encontrará al entrar. Las clases van literales y completas
 * porque Tailwind no genera las que se construyen por concatenación.
 */
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  ClipboardList,
  DollarSign,
  GraduationCap,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface Portal {
  clave: string;
  href: string;
  icono: LucideIcon;
  barra: string;
  azulejo: string;
  acento: string;
}

const PORTALES: Portal[] = [
  {
    clave: "estudiante",
    href: "/portal/estudiante",
    icono: GraduationCap,
    barra: "bg-gradient-to-r from-[#2096BA] to-[#0a6a8a]",
    azulejo: "bg-gradient-to-br from-[#2096BA] to-[#0a6a8a]",
    acento: "text-[#2096BA]",
  },
  {
    clave: "docente",
    href: "/portal/profesor",
    icono: BookOpen,
    barra: "bg-gradient-to-r from-emerald-500 to-emerald-700",
    azulejo: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    acento: "text-emerald-600",
  },
  {
    clave: "administrativo",
    href: "/portal/administrativo",
    icono: ClipboardList,
    barra: "bg-gradient-to-r from-orange-500 to-orange-700",
    azulejo: "bg-gradient-to-br from-orange-500 to-orange-700",
    acento: "text-orange-600",
  },
  {
    clave: "psicologia",
    href: "/portal/psicologia",
    icono: Heart,
    barra: "bg-gradient-to-r from-rose-500 to-rose-700",
    azulejo: "bg-gradient-to-br from-rose-500 to-rose-700",
    acento: "text-rose-600",
  },
  {
    clave: "contabilidad",
    href: "/portal/contabilidad",
    icono: DollarSign,
    barra: "bg-gradient-to-r from-violet-500 to-violet-700",
    azulejo: "bg-gradient-to-br from-violet-500 to-violet-700",
    acento: "text-violet-600",
  },
  {
    clave: "cursos_tecnicos",
    href: "/portal/cursos-tecnicos",
    icono: BookMarked,
    barra: "bg-gradient-to-r from-[#d97706] to-[#b45309]",
    azulejo: "bg-gradient-to-br from-[#d97706] to-[#b45309]",
    acento: "text-[#d97706]",
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

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                      {t(`portal_${p.clave}_desc` as "portal_estudiante_desc")}
                    </p>

                    <span
                      className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${p.acento}`}
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

        <p className="mt-8 text-sm text-slate-500">{t("portalsRoleNote")}</p>
      </div>
    </section>
  );
}
