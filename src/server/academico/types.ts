/**
 * Tipos del dominio Académico: períodos, materias, cursos técnicos,
 * inscripciones (matrícula), calificaciones e historial consolidado (GPA).
 */

export interface Periodo {
  id: string;
  nombre: string;
  /** `YYYY-MM-DD` (sale con `to_char`, no como Date del driver). */
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

/** Período con lo que cuelga de él, para la pantalla de períodos. */
export interface PeriodoConConteos extends Periodo {
  materias: number;
  cursos: number;
  inscripciones: number;
  /** `true` si hoy cae dentro de sus fechas. Lo decide la BD, no el navegador. */
  en_curso: boolean;
}

export interface Materia {
  id: string;
  nombre: string;
  codigo: string | null;
  descripcion: string | null;
  periodo_id: string | null;
  /** Nombre del período (viene del JOIN); `null` si la materia no tiene uno. */
  periodo_nombre: string | null;
  creditos: number;
  /** Nombre visible del profesor (puede ser alguien externo al sistema). */
  profesor_nombre: string | null;
  /**
   * El profesor como usuario del sistema, si lo es (migración 0019).
   * Es lo que decide "esta materia es mía" en el Portal Profesor; el nombre
   * de arriba solo decide qué se imprime en pantalla.
   */
  profesor_usuario_id: string | null;
  estado: string;
  horario: string | null;
  aula: string | null;
}

export interface Curso {
  id: string;
  nombre: string;
  descripcion: string | null;
  /** Nombre visible del docente (puede ser alguien externo al sistema). */
  docente: string | null;
  /** El docente como usuario del sistema, si lo es. Ver `Materia.profesor_usuario_id`. */
  docente_usuario_id: string | null;
  periodo_id: string | null;
  /** Nombre del período (viene del JOIN); `null` si el curso no tiene uno. */
  periodo_nombre: string | null;
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
  /** Enum real de la tabla: activa · retirada · aprobada · reprobada. */
  estado: string;
  estudiante_nombre?: string;
  materia_nombre?: string;
  periodo_nombre?: string;
  creditos?: number;
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
  /** Escala 0–100. Llega ya convertida a número desde la consulta. */
  nota: number;
  tipo_evaluacion: TipoEvaluacion;
  observaciones: string | null;
  estudiante_nombre?: string;
  curso_nombre?: string;
  periodo_nombre?: string | null;
}

export interface HistorialCalificacion {
  id: string;
  estudiante_id: string;
  cuatrimestre: string;
  /**
   * Nombre de la materia como **texto**, no como FK — a propósito. Es un
   * registro histórico: si años después se renombra o se borra la materia, el
   * expediente del joven no debe cambiar ni perder la fila.
   */
  materia: string;
  nota_numerica: number;
  nota_letra: string;
  /** Escala 0–4. */
  gpa: number;
  estado: string;
}

/** Historial consolidado de un estudiante (una fila por persona). */
export interface HistorialEstudiante {
  estudiante_id: string;
  estudiante_nombre: string;
  materias: number;
  /** GPA acumulado (0–4) o `null` si el historial no tiene GPA. */
  gpa: number | null;
  /** Promedio de nota en escala 0–100. */
  promedio: number | null;
  aprobadas: number;
  reprobadas: number;
  en_prueba: number;
  ultimo_cuatrimestre: string;
}
