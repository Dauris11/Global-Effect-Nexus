/**
 * Tipos del dominio Académico: períodos, materias, cursos técnicos,
 * inscripciones (matrícula), calificaciones e historial consolidado (GPA).
 */

export interface Periodo {
  id: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

export interface Materia {
  id: string;
  nombre: string;
  codigo: string | null;
  descripcion: string | null;
  periodo_id: string | null;
  creditos: number;
  profesor_nombre: string | null;
  estado: string;
  horario: string | null;
  aula: string | null;
}

export interface Curso {
  id: string;
  nombre: string;
  descripcion: string | null;
  docente: string | null;
  periodo_id: string | null;
  estado: string;
  capacidad: number;
  inscritos: number;
  horario: string | null;
  modalidad: string;
}

export interface Inscripcion {
  id: string;
  estudiante_id: string;
  materia_id: string;
  periodo_id: string;
  estado: string;
  estudiante_nombre?: string;
  materia_nombre?: string;
}

export type TipoEvaluacion =
  | "examen"
  | "tarea"
  | "proyecto"
  | "participacion"
  | "final";

export interface Calificacion {
  id: string;
  estudiante_id: string;
  curso_id: string;
  periodo_id: string;
  nota: number;
  tipo_evaluacion: TipoEvaluacion;
  observaciones: string | null;
  estudiante_nombre?: string;
  curso_nombre?: string;
}

export interface HistorialCalificacion {
  id: string;
  estudiante_id: string;
  cuatrimestre: string;
  materia: string;
  nota_numerica: number;
  nota_letra: string;
  gpa: number;
  estado: string;
}
