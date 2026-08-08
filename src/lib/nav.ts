/**
 * Configuración de navegación del portal.
 *
 * La arquitectura ahora se modela como una colección de portales por rol: cada
 * `rol` recibe un conjunto de rutas y enlaces exclusivamente reconocidos para
 * la dimensión que le corresponde.
 *
 * `NAV_ITEMS` permanece como catálogo de módulos compartidos del sistema, pero
 * el layout del área de portales se filtra contra un subconjunto por rol para
 * evitar que un mismo shell pinte un menú amplio y mezclado.
 */
export interface NavItem {
  href: string;
  labelKey: string;
  /** Permiso requerido; si se omite, es visible para cualquier sesión. */
  permiso?: string;
  /**
   * Alternativa a `permiso`: basta con tener **uno** de estos.
   */
  permisos?: string[];
  /**
   * Roles exactos que ven el ítem. Si se omite, lo ve cualquiera que cumpla
   * los permisos de arriba.
   */
  roles?: string[];
  /** Nombre del icono de lucide-react. */
  icon: string;
  /**
   * `false` si la pantalla todavía no existe.
   */
  disponible?: false;
}

/**
 * Ruta de inicio tras el login según el rol.
 *
 * El estudiante y el docente aterrizan en su portal (S6) y no en el panel
 * general: el panel muestra las cifras de la fundación —estudiantes activos,
 * becados, balance del mes— y esas cifras se le recortan a un estudiante hasta
 * dejarle una pantalla casi vacía. Su primera pantalla debe ser la suya.
 *
 * El resto de roles sí trabaja sobre la institución entera, y para ellos el
 * panel es la portada correcta.
 */
const HOME_POR_ROL: Record<string, string> = {
  super_admin: "/dashboard",
  admin: "/dashboard",
  docente: "/portal/profesor",
  estudiante: "/portal/estudiante",
  // Psicología y Contabilidad ya tienen portal propio, así que aterrizan ahí
  // por el mismo motivo que el estudiante y el docente: el panel general
  // enseña cifras de la institución que a estos dos roles se les recortan
  // casi por completo.
  psicologo: "/portal/psicologia",
  contabilidad: "/portal/contabilidad",
};

export function rutaPorRol(rol: string): string {
  return HOME_POR_ROL[rol] ?? "/dashboard";
}

/**
 * Menú del portal, en orden de uso. Los ítems marcados `disponible: false`
 * corresponden a módulos cuyo backend existe pero cuya pantalla llega en un
 * sprint posterior (ver docs/05-plan-de-trabajo.md).
 */
export const PORTAL_NAV_BY_ROLE: Record<string, NavItem[]> = {
  estudiante: [
    {
      href: "/portal/estudiante",
      labelKey: "studentPortal",
      roles: ["estudiante"],
      icon: "Home",
    },
    {
      href: "/portal/estudiante/aula-virtual",
      labelKey: "virtualClassroom",
      roles: ["estudiante"],
      icon: "MonitorStop",
    },
    {
      href: "/portal/estudiante/prematricula",
      labelKey: "preenrollment",
      roles: ["estudiante"],
      icon: "CheckCircle",
    },
    {
      href: "/portal/estudiante/calificaciones",
      labelKey: "grades",
      roles: ["estudiante"],
      icon: "ClipboardCheck",
    },
    {
      href: "/portal/estudiante/calendario",
      labelKey: "calendar",
      roles: ["estudiante"],
      icon: "Calendar",
    },
    { href: "/cita-psicologia", labelKey: "psychologyPortal", roles: ["estudiante"], icon: "Heart" },
    {
      href: "/portal/estudiante/chat",
      labelKey: "aiChat",
      roles: ["estudiante"],
      icon: "Bot",
    },
  ],
  docente: [
    {
      href: "/portal/profesor",
      labelKey: "teacherPortal",
      roles: ["docente"],
      icon: "BookOpen",
    },
    {
      href: "/portal/cursos-tecnicos",
      labelKey: "technicalCourses",
      roles: ["docente"],
      icon: "BookMarked",
    },
  ],
  admin: [
    {
      href: "/portal/administrativo",
      labelKey: "adminPortal",
      roles: ["admin", "super_admin"],
      icon: "ClipboardList",
    },
    { href: "/dashboard", labelKey: "dashboard", roles: ["super_admin", "admin"], icon: "LayoutGrid" },
  ],
  psicologo: [
    {
      href: "/portal/psicologia",
      labelKey: "psychologyPortal",
      roles: ["psicologo"],
      icon: "Heart",
    },
  ],
  contabilidad: [
    {
      href: "/portal/contabilidad",
      labelKey: "accountingPortal",
      roles: ["contabilidad"],
      icon: "DollarSign",
    },
  ],
};

export const NAV_ITEMS: NavItem[] = [
  // Este catálogo sigue siendo útil para las pantallas que no son portal
  // ni para el login. El layout del portal se filtra contra la colección
  // `PORTAL_NAV_BY_ROLE` y no contra el catálogo completo.
  { href: "/dashboard", labelKey: "dashboard", roles: ["super_admin", "admin"], icon: "LayoutGrid" },
  { href: "/administrativo", labelKey: "admin", permiso: "operaciones.leer", icon: "FolderKanban" },
  { href: "/administrativo/tareas", labelKey: "tasks", permiso: "operaciones.leer", icon: "ListChecks" },
  { href: "/administrativo/proyectos", labelKey: "projects", permiso: "operaciones.leer", icon: "Folder" },
  { href: "/administrativo/personal", labelKey: "staff", permiso: "usuarios.administrar", icon: "UserCog" },
  { href: "/calendario", labelKey: "calendar", permiso: "operaciones.leer", icon: "Calendar" },
  { href: "/servicios-mensuales", labelKey: "monthlyServices", permiso: "operaciones.leer", icon: "ClipboardCheck" },
  { href: "/inscripcion-comida", labelKey: "meals", permiso: "operaciones.leer", icon: "Utensils" },
  { href: "/expedientes", labelKey: "records", permiso: "expedientes.leer", icon: "Users" },
  { href: "/academico/materias", labelKey: "academic", permiso: "academico.leer", icon: "GraduationCap" },
  { href: "/academico/cursos", labelKey: "courses", permiso: "academico.leer", icon: "BookOpen" },
  {
    href: "/academico/calificaciones",
    labelKey: "grades",
    permisos: ["calificaciones.registrar", "expedientes.leer"],
    icon: "ClipboardList",
  },
  { href: "/configuracion", labelKey: "settings", permiso: "landing.administrar", icon: "Settings" },
  { href: "/patrocinadores", labelKey: "sponsors", permiso: "patrocinadores.leer", icon: "HeartHandshake", disponible: false },
  { href: "/contabilidad", labelKey: "accounting", permiso: "finanzas.leer", icon: "Wallet" },
  { href: "/psicologia", labelKey: "psychology", permiso: "psicologia.leer", icon: "Brain" },
  { href: "/reportes", labelKey: "reports", permiso: "finanzas.leer", icon: "BarChart3", disponible: false },
];

export function portalNavPorRol(rol: string): NavItem[] {
  return PORTAL_NAV_BY_ROLE[rol] ?? [];
}

