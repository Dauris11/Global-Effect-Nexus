/**
 * Los seis portales por rol, en un solo sitio.
 *
 * Existe porque el mismo catálogo lo consumen tres pantallas —la tira del
 * landing, el login de cada portal y el destino tras entrar— y tenerlo
 * duplicado garantizaba que tarde o temprano el icono de una no coincidiera
 * con el color de la otra.
 *
 * El orden es el del catálogo (03-modulos-funcionales.md § Portales por rol) y
 * es el que se respeta en todas las superficies.
 *
 * Las clases van literales y completas: Tailwind no genera las que se
 * construyen por concatenación.
 */
import {
  BookMarked,
  BookOpen,
  ClipboardList,
  DollarSign,
  GraduationCap,
  Heart,
  type LucideIcon,
} from "lucide-react";

export interface PortalDef {
  /** Segmento de la URL del login: `/login/<clave>`. */
  clave: string;
  /** Destino tras autenticarse, sin el locale. */
  destino: string;
  icono: LucideIcon;
  /** Clave i18n del nombre, dentro del namespace `landing`. */
  nombreKey: string;
  /** Degradado del panel de marca de su login y del banner del portal. */
  gradiente: string;
  /** Color del acento sobre el panel oscuro de ese login. */
  acento: string;
}

export const PORTALES: PortalDef[] = [
  {
    clave: "estudiante",
    destino: "/portal/estudiante",
    icono: GraduationCap,
    nombreKey: "portal_estudiante",
    gradiente: "bg-gradient-to-br from-[#2096BA] to-[#0a6a8a]",
    acento: "border-[#2096BA]",
  },
  {
    clave: "docente",
    destino: "/portal/profesor",
    icono: BookOpen,
    nombreKey: "portal_docente",
    gradiente: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    acento: "border-emerald-400",
  },
  {
    clave: "administrativo",
    destino: "/portal/administrativo",
    icono: ClipboardList,
    nombreKey: "portal_administrativo",
    gradiente: "bg-gradient-to-br from-orange-500 to-orange-700",
    acento: "border-orange-400",
  },
  {
    clave: "psicologia",
    destino: "/portal/psicologia",
    icono: Heart,
    nombreKey: "portal_psicologia",
    gradiente: "bg-gradient-to-br from-rose-500 to-rose-700",
    acento: "border-rose-400",
  },
  {
    clave: "contabilidad",
    destino: "/portal/contabilidad",
    icono: DollarSign,
    nombreKey: "portal_contabilidad",
    gradiente: "bg-gradient-to-br from-violet-500 to-violet-700",
    acento: "border-violet-400",
  },
  {
    clave: "cursos-tecnicos",
    destino: "/portal/cursos-tecnicos",
    icono: BookMarked,
    nombreKey: "portal_cursos_tecnicos",
    gradiente: "bg-gradient-to-br from-[#d97706] to-[#b45309]",
    acento: "border-amber-400",
  },
];

export function portalPorClave(clave: string): PortalDef | undefined {
  return PORTALES.find((p) => p.clave === clave);
}
