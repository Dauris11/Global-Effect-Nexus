/**
 * Configuración de navegación del portal.
 *
 * La arquitectura se modela como portales por rol: cada `rol` recibe rutas y
 * enlaces exclusivos para su dimensión. Los grupos expandibles (`children`)
 * agrupan módulos relacionados en el sidebar rail.
 *
 * `NAV_ITEMS` permanece como catálogo de módulos compartidos del sistema; el
 * layout del área de portales se filtra contra `PORTAL_NAV_BY_ROLE`.
 */
export interface NavItem {
  /** Omitir en ítems agrupadores; los hijos llevan la ruta. */
  href?: string;
  labelKey: string;
  /** Submenú expandible (Académico, Patrocinadores, etc.). */
  children?: NavItem[];
  /** Permiso requerido; si se omite, es visible para cualquier sesión. */
  permiso?: string;
  /** Alternativa a `permiso`: basta con tener **uno** de estos. */
  permisos?: string[];
  /** Roles exactos que ven el ítem. Si se omite, lo ve cualquiera que cumpla permisos. */
  roles?: string[];
  /** Nombre del icono de lucide-react. */
  icon: string;
  /** `false` si la pantalla todavía no existe. */
  disponible?: false;
}

export interface PortalTheme {
  sidebar: string;
  sidebarEdge: string;
  primary: string;
  primaryForeground: string;
  hover: string;
  hoverSoft: string;
  page: string;
  pageText: string;
}

export const PORTAL_THEME_BY_ROL: Record<string, PortalTheme> = {
  estudiante: {
    sidebar: "#0a6a8a",
    sidebarEdge: "#0a6a8a",
    primary: "#2096ba",
    primaryForeground: "#ffffff",
    hover: "#b99130",
    hoverSoft: "rgba(185, 145, 48, 0.13)",
    page: "#eefbff",
    pageText: "#123d4b",
  },
  docente: {
    sidebar: "#244b6a",
    sidebarEdge: "#244b6a",
    primary: "#477baa",
    primaryForeground: "#ffffff",
    hover: "#b99130",
    hoverSoft: "rgba(185, 145, 48, 0.13)",
    page: "#eef7ff",
    pageText: "#1d4054",
  },
  administrativo: {
    sidebar: "#c2410c",
    sidebarEdge: "#9a3412",
    primary: "#ea580c",
    primaryForeground: "#ffffff",
    hover: "#b99130",
    hoverSoft: "rgba(185, 145, 48, 0.13)",
    page: "#fff7ed",
    pageText: "#7c2d12",
  },
  admin: {
    sidebar: "#394a50",
    sidebarEdge: "#2a343b",
    primary: "#5d6f4d",
    primaryForeground: "#ffffff",
    hover: "#b99130",
    hoverSoft: "rgba(185, 145, 48, 0.14)",
    page: "#f9f6ea",
    pageText: "#30433c",
  },
  super_admin: {
    sidebar: "#394a50",
    sidebarEdge: "#2a343b",
    primary: "#5d6f4d",
    primaryForeground: "#ffffff",
    hover: "#b99130",
    hoverSoft: "rgba(185, 145, 48, 0.14)",
    page: "#f9f6ea",
    pageText: "#30433c",
  },
  psicologo: {
    sidebar: "#78517a",
    sidebarEdge: "#4d4256",
    primary: "#9a5b9d",
    primaryForeground: "#ffffff",
    hover: "#b99130",
    hoverSoft: "rgba(185, 145, 48, 0.13)",
    page: "#fff7ee",
    pageText: "#563a58",
  },
  contabilidad: {
    sidebar: "#456a47",
    sidebarEdge: "#233d33",
    primary: "#2e8c55",
    primaryForeground: "#ffffff",
    hover: "#b99130",
    hoverSoft: "rgba(185, 145, 48, 0.13)",
    page: "#eefbef",
    pageText: "#244b36",
  },
  default: {
    sidebar: "#0a6a8a",
    sidebarEdge: "#0a6a8a",
    primary: "#2096ba",
    primaryForeground: "#ffffff",
    hover: "#b99130",
    hoverSoft: "rgba(185, 145, 48, 0.13)",
    page: "#eefbff",
    pageText: "#123d4b",
  },
};

export function portalThemePorRol(rol: string): PortalTheme {
  return PORTAL_THEME_BY_ROL[rol] ?? PORTAL_THEME_BY_ROL.default;
}

/** Ruta de inicio tras el login según el rol. */
const HOME_POR_ROL: Record<string, string> = {
  super_admin: "/dashboard",
  admin: "/dashboard",
  administrativo: "/portal/administrativo",
  docente: "/portal/profesor",
  estudiante: "/portal/estudiante",
  psicologo: "/portal/psicologia",
  contabilidad: "/portal/contabilidad",
};

export function rutaPorRol(rol: string): string {
  return HOME_POR_ROL[rol] ?? "/dashboard";
}

/** Menú completo de administración (admin y super_admin). */
const ADMIN_NAV: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: "LayoutGrid" },
  {
    labelKey: "academicModule",
    icon: "GraduationCap",
    children: [
      { href: "/academico/cursos", labelKey: "academicCourses", icon: "BookOpen" },
      { href: "/academico/materias", labelKey: "academic", icon: "GraduationCap" },
      { href: "/academico/calificaciones", labelKey: "grades", icon: "ClipboardList" },
      { href: "/academico/historial", labelKey: "history", icon: "CalendarDays" },
      { href: "/academico/prematricula", labelKey: "preenrollment", icon: "CheckCircle" },
      { href: "/academico/periodos", labelKey: "periods", icon: "CalendarClock" },
    ],
  },
  {
    labelKey: "academies",
    icon: "BookMarked",
    children: [
      { href: "/academias/programas", labelKey: "programs", icon: "GraduationCap" },
      { href: "/academias/materiales", labelKey: "materials", icon: "Folder" },
    ],
  },
  { href: "/expedientes", labelKey: "records", icon: "Users" },
  {
    labelKey: "sponsors",
    icon: "HeartHandshake",
    children: [
      { href: "/patrocinadores", labelKey: "sponsorList", icon: "HeartHandshake" },
      { href: "/patrocinadores/becas", labelKey: "scholarships", icon: "GraduationCap", disponible: false },
    ],
  },
  { href: "/psicologia", labelKey: "psychology", icon: "Brain" },
  {
    labelKey: "admin",
    icon: "FolderKanban",
    children: [
      { href: "/administrativo/tareas", labelKey: "tasks", icon: "ListChecks" },
      { href: "/administrativo/proyectos", labelKey: "projects", icon: "Folder" },
      { href: "/administrativo/personal", labelKey: "staff", icon: "UserCog" },
    ],
  },
  { href: "/servicios-mensuales", labelKey: "monthlyServices", icon: "ClipboardCheck" },
  { href: "/inscripcion-comida", labelKey: "mealList", icon: "Utensils" },
  { href: "/contabilidad", labelKey: "accounting", icon: "Wallet" },
  { href: "/reportes", labelKey: "reports", icon: "BarChart3" },
  { href: "/chat-ia", labelKey: "chatIaAdmin", icon: "Bot" },
  { href: "/calendario", labelKey: "calendar", icon: "Calendar" },
  { href: "/configuracion", labelKey: "settings", icon: "Settings" },
  { href: "/sitemap", labelKey: "sitemap", icon: "Map" },
];

/**
 * Menú del portal por rol, en orden de uso. Los ítems marcados `disponible: false`
 * corresponden a módulos cuyo backend existe pero cuya pantalla llega en un
 * sprint posterior.
 */
export const PORTAL_NAV_BY_ROLE: Record<string, NavItem[]> = {
  estudiante: [
    { href: "/portal/estudiante", labelKey: "studentPortal", icon: "Home" },
    { href: "/academico/materias", labelKey: "mySubjects", icon: "GraduationCap" },
    { href: "/portal/estudiante/calificaciones", labelKey: "grades", icon: "ClipboardCheck" },
    { href: "/cita-psicologia", labelKey: "psychologyAppointment", icon: "Heart" },
  ],
  docente: [
    { href: "/portal/profesor", labelKey: "teacherPortal", icon: "BookOpen" },
    { href: "/academico/materias", labelKey: "mySubjects", icon: "GraduationCap" },
    { href: "/academico/calificaciones", labelKey: "grades", icon: "ClipboardList" },
    { href: "/academico/cursos", labelKey: "academicCourses", icon: "BookOpen" },
    { href: "/calendario", labelKey: "calendar", icon: "Calendar" },
  ],
  administrativo: [
    { href: "/portal/administrativo", labelKey: "adminPortal", icon: "ClipboardList" },
    { href: "/expedientes", labelKey: "records", icon: "Users" },
    { href: "/patrocinadores", labelKey: "sponsors", icon: "HeartHandshake" },
    { href: "/servicios-mensuales", labelKey: "monthlyServices", icon: "ClipboardCheck" },
    { href: "/inscripcion-comida", labelKey: "mealList", icon: "Utensils" },
    { href: "/administrativo/tareas", labelKey: "tasks", icon: "ListChecks" },
    { href: "/administrativo/proyectos", labelKey: "projects", icon: "Folder" },
    { href: "/calendario", labelKey: "calendar", icon: "Calendar" },
    { href: "/chat-ia", labelKey: "chatIa", icon: "Bot" },
  ],
  admin: ADMIN_NAV,
  super_admin: ADMIN_NAV,
  psicologo: [
    { href: "/portal/psicologia", labelKey: "psychologyPortal", icon: "Heart" },
    { href: "/psicologia", labelKey: "appointments", icon: "Calendar" },
    { href: "/expedientes", labelKey: "records", icon: "Users" },
    { href: "/calendario", labelKey: "calendar", icon: "Calendar" },
  ],
  contabilidad: [
    { href: "/portal/contabilidad", labelKey: "accountingPortal", icon: "DollarSign" },
    { href: "/contabilidad", labelKey: "accounting", icon: "Wallet" },
    { href: "/reportes", labelKey: "reports", icon: "BarChart3" },
  ],
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", roles: ["super_admin", "admin"], icon: "LayoutGrid" },
  { href: "/administrativo/tareas", labelKey: "tasks", permiso: "operaciones.leer", icon: "ListChecks" },
  { href: "/administrativo/proyectos", labelKey: "projects", permiso: "operaciones.leer", icon: "Folder" },
  { href: "/administrativo/personal", labelKey: "staff", permiso: "usuarios.administrar", icon: "UserCog" },
  { href: "/calendario", labelKey: "calendar", permiso: "operaciones.leer", icon: "Calendar" },
  { href: "/servicios-mensuales", labelKey: "monthlyServices", permiso: "operaciones.leer", icon: "ClipboardCheck" },
  { href: "/inscripcion-comida", labelKey: "mealList", permiso: "operaciones.leer", icon: "Utensils" },
  { href: "/expedientes", labelKey: "records", permiso: "expedientes.leer", icon: "Users" },
  { href: "/academico/materias", labelKey: "academic", permiso: "academico.leer", icon: "GraduationCap" },
  { href: "/academico/cursos", labelKey: "academicCourses", permiso: "academico.leer", icon: "BookOpen" },
  {
    href: "/academico/calificaciones",
    labelKey: "grades",
    permisos: ["calificaciones.registrar", "expedientes.leer"],
    icon: "ClipboardList",
  },
  { href: "/academico/historial", labelKey: "history", permiso: "academico.leer", icon: "CalendarDays" },
  { href: "/academico/prematricula", labelKey: "preenrollment", permiso: "academico.leer", icon: "CheckCircle" },
  { href: "/academico/periodos", labelKey: "periods", permiso: "academico.leer", icon: "CalendarClock" },
  { href: "/academias/programas", labelKey: "programs", permiso: "academico.leer", icon: "GraduationCap" },
  { href: "/academias/materiales", labelKey: "materials", permiso: "academico.leer", icon: "Folder" },
  { href: "/configuracion", labelKey: "settings", permiso: "landing.administrar", icon: "Settings" },
  { href: "/patrocinadores", labelKey: "sponsors", permiso: "patrocinadores.leer", icon: "HeartHandshake" },
  { href: "/patrocinadores/becas", labelKey: "scholarships", permiso: "patrocinadores.leer", icon: "GraduationCap", disponible: false },
  { href: "/contabilidad", labelKey: "accounting", permiso: "finanzas.leer", icon: "Wallet" },
  { href: "/psicologia", labelKey: "psychology", permiso: "psicologia.leer", icon: "Brain" },
  { href: "/reportes", labelKey: "reports", permiso: "finanzas.leer", icon: "BarChart3" },
  { href: "/chat-ia", labelKey: "chatIaAdmin", permiso: "ia.usar", icon: "Bot" },
];

/** Aplana un árbol de navegación a sus hojas con `href`. */
export function hojasNav(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => {
    if (item.children?.length) return hojasNav(item.children);
    return item.href ? [item] : [];
  });
}

/** Filtra entradas de nav por rol y permisos, incluyendo grupos anidados. */
export function filtrarNav(
  items: NavItem[],
  rol: string,
  permisos: string[] | null,
): NavItem[] {
  return items.flatMap((item) => {
    if (item.roles && !item.roles.includes(rol)) return [];
    if (permisos !== null) {
      if (item.permiso && !permisos.includes(item.permiso)) return [];
      if (item.permisos && !item.permisos.some((p) => permisos.includes(p))) return [];
    }

    if (item.children?.length) {
      const children = filtrarNav(item.children, rol, permisos);
      if (children.length === 0) return [];
      return [{ ...item, children }];
    }

    if (item.disponible === false) return [];
    return item.href ? [item] : [];
  });
}

export function portalNavPorRol(rol: string): NavItem[] {
  return PORTAL_NAV_BY_ROLE[rol] ?? [];
}
