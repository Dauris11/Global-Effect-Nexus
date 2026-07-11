/**
 * Configuración de navegación del portal. Cada ítem declara el permiso que
 * lo habilita; el layout filtra el menú según los permisos del rol activo
 * (super_admin ve todo). Las etiquetas se resuelven vía i18n (namespace "nav").
 */
export interface NavItem {
  href: string;
  labelKey: string;
  /** Permiso requerido; si se omite, es visible para cualquier sesión. */
  permiso?: string;
  /** Nombre del icono de lucide-react. */
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: "LayoutDashboard" },
  { href: "/expedientes", labelKey: "records", permiso: "expedientes.leer", icon: "Users" },
  { href: "/academico/materias", labelKey: "academic", permiso: "academico.leer", icon: "GraduationCap" },
  { href: "/patrocinadores", labelKey: "sponsors", permiso: "patrocinadores.leer", icon: "HeartHandshake" },
  { href: "/contabilidad", labelKey: "accounting", permiso: "finanzas.leer", icon: "Wallet" },
  { href: "/psicologia", labelKey: "psychology", permiso: "psicologia.leer", icon: "Brain" },
  { href: "/calendario", labelKey: "calendar", permiso: "operaciones.leer", icon: "Calendar" },
  { href: "/inscripcion-comida", labelKey: "meals", permiso: "operaciones.leer", icon: "Utensils" },
  { href: "/reportes", labelKey: "reports", permiso: "finanzas.leer", icon: "BarChart3" },
  { href: "/configuracion", labelKey: "settings", permiso: "landing.administrar", icon: "Settings" },
];
