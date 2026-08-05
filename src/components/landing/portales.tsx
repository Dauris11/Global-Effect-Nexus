/**
 * Sección "Portales" — accesos directos a las áreas del sistema.
 * Rediseño completo: tema oscuro, acento púrpura, sin tokens del viejo sistema.
 */
import { getTranslations } from "next-intl/server";
import {
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  Users,
  Library,
  Calendar,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

const PORTALES = [
  { clave: "estudiante",  href: "/portal/estudiante",    icono: GraduationCap },
  { clave: "docente",     href: "/portal/profesor",      icono: BookOpen },
  { clave: "panel",       href: "/dashboard",            icono: LayoutDashboard },
  { clave: "expedientes", href: "/expedientes",          icono: Users },
  { clave: "academico",   href: "/academico/materias",   icono: Library },
  { clave: "calendario",  href: "/calendario",           icono: Calendar },
] as const;

export async function Portales() {
  const t = await getTranslations("landing");

  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/35">
        {t("portalsLabel")}
      </p>

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {PORTALES.map(({ clave, href, icono: Icono }) => (
          <li key={clave}>
            <Link
              href={href}
              className="group flex h-full flex-col items-center gap-3 rounded-xl border border-white/6 bg-white/[0.03] px-3 py-5 text-center transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-[#6C3EF4]/40 hover:bg-[#6C3EF4]/8 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3EF4] focus-visible:ring-offset-2"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#6C3EF4]/12 text-[#818cf8] transition-all duration-200 ease-out group-hover:scale-110 group-hover:bg-[#6C3EF4]/25">
                <Icono className="size-5" strokeWidth={1.7} aria-hidden />
              </span>
              <span className="text-[12px] font-semibold leading-tight text-white/60 transition-colors duration-150 group-hover:text-white">
                {t(`portal_${clave}` as never)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs text-white/30">{t("portalsHint")}</p>
    </div>
  );
}
