/**
 * Tipos del dominio Operaciones: proyectos, tareas (Kanban) con asignación
 * múltiple, eventos de calendario y registro mensual de servicio.
 */

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string | null;
  responsable: string | null;
  estado: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  progreso: number;
}

/** Proyecto con el avance derivado de sus tareas (no el campo manual). */
export interface ProyectoConAvance extends Proyecto {
  total_tareas: number;
  tareas_completadas: number;
  /** Porcentaje 0–100 calculado; cae a `progreso` si el proyecto no tiene tareas. */
  avance: number;
}

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string | null;
  proyecto_id: string | null;
  visibilidad: string;
  estado: string;
  prioridad: string;
  fecha_limite: string | null;
  asignados?: string[];
}

/** Persona asignada a una tarea, tal como la necesita el tablero. */
export interface Asignado {
  id: string;
  nombre: string;
}

/** Tarea con los asignados resueltos a nombre y el proyecto al que pertenece. */
export interface TareaTablero extends Omit<Tarea, "asignados"> {
  proyecto_nombre: string | null;
  asignados: Asignado[];
}

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  ubicacion: string | null;
  responsable: string | null;
  estado: string;
}

/**
 * Una línea del calendario o de la agenda, venga de donde venga.
 *
 * El calendario mezcla dos tablas —`evento` y las tareas con fecha límite— y
 * el usuario no piensa en tablas: piensa en "qué pasa el jueves". Por eso las
 * dos se normalizan a esta forma y `origen` conserva de cuál viene, que es lo
 * único que cambia en pantalla (icono y a dónde lleva el enlace).
 */
export interface EntradaAgenda {
  id: string;
  origen: "evento" | "tarea";
  titulo: string;
  /** Siempre `YYYY-MM-DD`, ya formateada en SQL para no cruzar zonas horarias. */
  fecha: string;
  hora_inicio: string | null;
  /** `evento.tipo` si es evento; `tarea.prioridad` si es tarea. */
  categoria: string;
  estado: string;
  ubicacion: string | null;
  proyecto_nombre: string | null;
}

export interface RegistroServicio {
  id: string;
  estudiante_id: string;
  mes: string;
  hizo_servicio: boolean;
  asistio_reunion: boolean;
  notas: string | null;
  estudiante_nombre?: string;
}
