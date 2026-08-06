/**
 * Portales — accesos directos al sistema.
 * Botones grandes y llamativos con animaciones creativas al hover.
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
  { clave: "estudiante",  href: "/portal/estudiante",  icono: GraduationCap, color: "#60a5fa", glow: "rgba(96,165,250,0.35)" },
  { clave: "docente",     href: "/portal/profesor",    icono: BookOpen,      color: "#34d399", glow: "rgba(52,211,153,0.30)"  },
  { clave: "panel",       href: "/dashboard",          icono: LayoutDashboard,color:"#fb7185", glow: "rgba(251,113,133,0.30)" },
  { clave: "expedientes", href: "/expedientes",        icono: Users,         color: "#fbbf24", glow: "rgba(251,191,36,0.30)"  },
  { clave: "academico",   href: "/academico/materias", icono: Library,       color: "#38bdf8", glow: "rgba(56,189,248,0.30)"  },
  { clave: "calendario",  href: "/calendario",         icono: Calendar,      color: "#a78bfa", glow: "rgba(96,165,250,0.30)" },
] as const;

export async function Portales() {
  const t = await getTranslations("landing");

  return (
    <div>
      <p className="tabular-nums text-[11px] uppercase tracking-[0.2em] text-white/30">
        {t("portalsLabel")}
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {PORTALES.map(({ clave, href, icono: Icono, color, glow }) => (
          <li key={clave}>
            {/* Each portal card is a standalone styled element using style prop for dynamic colors */}
            <Link
              href={href}
              className="portal-card group relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-7 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ "--portal-glow": glow, "--portal-color": color } as React.CSSProperties}
            >
              {/* Animated background sweep on hover */}
              <span
                aria-hidden
                className="absolute inset-0 translate-y-full rounded-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-y-0"
                style={{ background: `linear-gradient(135deg, ${color}10 0%, ${color}06 100%)` }}
              />
              {/* Glow ring that expands on hover */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ boxShadow: `inset 0 0 0 1px ${color}40, 0 0 40px ${glow}` }}
              />

              {/* Icon container with bounce animation */}
              <span
                className="relative z-10 flex size-14 items-center justify-center rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125 group-hover:-translate-y-1"
                style={{
                  backgroundColor: `${color}18`,
                  color,
                  boxShadow: `0 0 0 0 ${glow}`,
                }}
              >
                <Icono
                  className="size-7 transition-transform duration-300 group-hover:rotate-[-8deg]"
                  strokeWidth={1.4}
                  aria-hidden
                />
              </span>

              {/* Label slides up */}
              <span
                className="relative z-10 mt-4 block text-[13px] font-semibold leading-tight text-white/55 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-white"
              >
                {t(`portal_${clave}` as never)}
              </span>

              {/* Animated underline */}
              <span
                aria-hidden
                className="absolute bottom-3 left-1/2 h-px w-0 -translate-x-1/2 rounded-full transition-all duration-300 group-hover:w-10"
                style={{ backgroundColor: color }}
              />
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs text-white/25">{t("portalsHint")}</p>
    </div>
  );
}
