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
  /**
   * `false` si la pantalla todavía no existe.
   *
   * El backend de los 27 módulos está construido, pero la UI va por sprints.
   * Un enlace a una pantalla que aún no existe lleva a un 404, y un 404 en el
   * menú principal se lee como "la aplicación está rota", no como "esto se
   * entrega en el sprint 10". Estos ítems se muestran apagados y marcados
   * como próximos: el usuario ve el alcance completo sin chocar con nada.
   *
   * Al construir la pantalla se borra la marca — no se añade nada.
   */
  disponible?: false;
}

/**
 * Ruta de inicio tras el login según el rol. Hoy todos aterrizan en el panel
 * (la navegación se filtra por permisos); cuando existan los portales por rol
 * (S6+), aquí se enrutará a cada uno (p. ej. estudiante → /portal/estudiante).
 */
const HOME_POR_ROL: Record<string, string> = {
  super_admin: "/dashboard",
  admin: "/dashboard",
  docente: "/dashboard",
  estudiante: "/dashboard",
  psicologo: "/dashboard",
  contabilidad: "/dashboard",
};

export function rutaPorRol(rol: string): string {
  return HOME_POR_ROL[rol] ?? "/dashboard";
}

/**
 * Menú del portal, en orden de uso. Los ítems marcados `disponible: false`
 * corresponden a módulos cuyo backend existe pero cuya pantalla llega en un
 * sprint posterior (ver docs/05-plan-de-trabajo.md).
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: "LayoutDashboard" },
  { href: "/administrativo", labelKey: "admin", permiso: "operaciones.leer", icon: "FolderKanban" },
  { href: "/administrativo/tareas", labelKey: "tasks", permiso: "operaciones.leer", icon: "ListChecks" },
  { href: "/administrativo/proyectos", labelKey: "projects", permiso: "operaciones.leer", icon: "Folder" },
  { href: "/administrativo/personal", labelKey: "staff", permiso: "usuarios.administrar", icon: "UserCog" },
  { href: "/calendario", labelKey: "calendar", permiso: "operaciones.leer", icon: "Calendar" },
  { href: "/inscripcion-comida", labelKey: "meals", permiso: "operaciones.leer", icon: "Utensils" },
  { href: "/expedientes", labelKey: "records", permiso: "expedientes.leer", icon: "Users" },
  { href: "/configuracion", labelKey: "settings", permiso: "landing.administrar", icon: "Settings" },

  // Pantallas pendientes (S6–S11). El backend ya está en `src/server/*`.
  { href: "/academico/materias", labelKey: "academic", permiso: "academico.leer", icon: "GraduationCap", disponible: false },
  { href: "/patrocinadores", labelKey: "sponsors", permiso: "patrocinadores.leer", icon: "HeartHandshake", disponible: false },
  { href: "/contabilidad", labelKey: "accounting", permiso: "finanzas.leer", icon: "Wallet", disponible: false },
  { href: "/psicologia", labelKey: "psychology", permiso: "psicologia.leer", icon: "Brain", disponible: false },
  { href: "/reportes", labelKey: "reports", permiso: "finanzas.leer", icon: "BarChart3", disponible: false },
];
