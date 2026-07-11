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

export interface RegistroServicio {
  id: string;
  estudiante_id: string;
  mes: string;
  hizo_servicio: boolean;
  asistio_reunion: boolean;
  notas: string | null;
  estudiante_nombre?: string;
}
