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
  /**
   * Alternativa a `permiso`: basta con tener **uno** de estos.
   *
   * Existe por Calificaciones. Ver el listado completo de notas no encaja en un
   * solo permiso: lo necesita el docente (que registra, pero no tiene
   * `expedientes.leer`) y también quien lleva expedientes (que no registra
   * notas). Un `permiso` único dejaría fuera a uno de los dos.
   *
   * Si se declaran ambos campos, se exige `permiso` **y** alguno de `permisos`.
   */
  permisos?: string[];
  /**
   * Roles exactos que ven el ítem. Si se omite, lo ve cualquiera que cumpla
   * los permisos de arriba.
   *
   * Existe por los portales por rol (S6). Un portal no se protege con un
   * permiso —el Portal Estudiante no lee nada que un permiso pueda nombrar,
   * lee *tu propia fila*— así que el filtro tiene que ser el rol. Y a
   * diferencia de `permiso`, esta lista **también aplica a `super_admin`**:
   * enseñarle "Portal estudiante" a quien no tiene expediente solo le ofrece
   * una pantalla que no puede contener nada suyo.
   */
  roles?: string[];
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
export const NAV_ITEMS: NavItem[] = [
  // Los portales van primero y solo para su rol: son la portada de esas dos
  // personas, no un módulo más del menú.
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
    icon: "MonitorStop", // Closest to the terminal monitor icon in the screenshot
  },
  {
    href: "/portal/estudiante/prematricula",
    labelKey: "preenrollment", // Or whatever translation key is appropriate
    roles: ["estudiante"],
    icon: "CheckCircle",
  },
  {
    href: "/portal/profesor",
    labelKey: "teacherPortal",
    roles: ["docente"],
    icon: "BookOpen",
  },
  {
    href: "/portal/administrativo",
    labelKey: "adminPortal",
    roles: ["admin", "super_admin"],
    icon: "ClipboardList",
  },
  {
    href: "/portal/psicologia",
    labelKey: "psychologyPortal",
    roles: ["psicologo"],
    icon: "Heart",
  },
  {
    href: "/portal/contabilidad",
    labelKey: "accountingPortal",
    roles: ["contabilidad"],
    icon: "DollarSign",
  },
  {
    href: "/portal/cursos-tecnicos",
    labelKey: "technicalCourses",
    roles: ["docente"],
    icon: "BookMarked",
  },
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
  // Notas de todos los estudiantes: `academico.leer` no basta — el rol
  // `estudiante` lo tiene para el catálogo. Ver la cabecera de la pantalla.
  {
    href: "/academico/calificaciones",
    labelKey: "grades",
    permisos: ["calificaciones.registrar", "expedientes.leer"],
    icon: "ClipboardList",
  },
  { href: "/configuracion", labelKey: "settings", permiso: "landing.administrar", icon: "Settings" },

  // Pantallas pendientes (S6–S11). El backend ya está en `src/server/*`.
  { href: "/patrocinadores", labelKey: "sponsors", permiso: "patrocinadores.leer", icon: "HeartHandshake", disponible: false },
  { href: "/contabilidad", labelKey: "accounting", permiso: "finanzas.leer", icon: "Wallet" },
  { href: "/psicologia", labelKey: "psychology", permiso: "psicologia.leer", icon: "Brain" },
  { href: "/reportes", labelKey: "reports", permiso: "finanzas.leer", icon: "BarChart3", disponible: false },
];
