/**
 * Tipos de los portales por rol — ClickUp S6 · #395 y #400.
 *
 * Un portal no es un módulo: no tiene tabla propia ni CRUD. Es una lectura
 * cruzada de módulos que ya existen (académico, operaciones, bienestar),
 * recortada a **una sola persona** — la que tiene la sesión abierta.
 */

/** El estudiante que hay detrás del usuario con la sesión abierta. */
export interface EstudianteDelUsuario {
  id: string;
  nombre: string;
  /** `becado` o `regular`. */
  tipo: string;
  estado: string;
  programa: string | null;
  universidad: string | null;
  donde_estudia: string | null;
  /** `YYYY-MM-DD`. */
  fecha_ingreso: string | null;
}

  /** Cifras del banner del Portal Estudiante (#396). */
export interface ResumenDelEstudiante {
  /** Escala 0–4; `null` si todavía no hay historial. */
  gpa: number | null;
  /** Escala 0–100. */
  promedio: number | null;
  /** Materias con historial (cursadas). */
  cursadas: number;
  aprobadas: number;
  reprobadas: number;
  en_prueba: number;
  /** Materias inscritas ahora mismo. */
  activas: number;
  /** Créditos de esas materias activas. */
  creditos_activos: number;
}

/** Una materia que el estudiante está cursando (#397). */
export interface MateriaDelEstudiante {
  inscripcion_id: string;
  materia_id: string;
  nombre: string;
  codigo: string | null;
  creditos: number;
  profesor_nombre: string | null;
  horario: string | null;
  aula: string | null;
  periodo_nombre: string;
  /** Estado de la inscripción: activa · retirada · aprobada · reprobada. */
  estado: string;
}

/** Una nota del historial, tal como se le muestra al estudiante (#397). */
export interface NotaDelEstudiante {
  id: string;
  materia: string;
  nota_numerica: number;
  nota_letra: string;
  gpa: number;
  estado: string;
}

/** Las notas de un cuatrimestre, con su promedio y su GPA (#397). */
export interface CuatrimestreDelEstudiante {
  cuatrimestre: string;
  gpa: number | null;
  promedio: number | null;
  notas: NotaDelEstudiante[];
}

/** Un mes del registro de servicio y reunión (#398). */
export interface MesDeCondicion {
  /** `YYYY-MM`. */
  mes: string;
  hizo_servicio: boolean;
  asistio_reunion: boolean;
  notas: string | null;
  /**
   * `false` si ese mes no tiene fila en `registro_servicio`.
   *
   * No es lo mismo que "no cumplió": es que nadie lo ha registrado todavía, y
   * el portal no debe acusar a un joven de faltar por un vacío administrativo.
   */
  registrado: boolean;
}

/** Condición del estudiante en la fundación, últimos tres meses (#398). */
export interface CondicionEnLaFundacion {
  meses: MesDeCondicion[];
  servicios: number;
  reuniones: number;
  /** Meses considerados (3), para leer los conteos de arriba. */
  de: number;
}

/** Un evento próximo, como lo ve el estudiante (#399). */
export interface EventoDelPortal {
  id: string;
  titulo: string;
  tipo: string;
  /** `YYYY-MM-DD`. */
  fecha: string;
  hora_inicio: string | null;
  ubicacion: string | null;
}

export interface AsignacionDelEstudiante {
  id: string;
  materia_id: string;
  titulo: string;
  descripcion: string | null;
  tipo: string; // 'tarea', 'examen', 'material', 'anuncio'
  fecha_vencimiento: string | null; // 'YYYY-MM-DDTHH:mm:ssZ'
  estado_entrega: string | null; // 'pendiente', 'entregado', 'calificado', 'tarde'
  calificacion: number | null;
  materia_nombre: string;
  materia_codigo: string | null;
}

// ---------------------------------------------------------------------------
// Portal Profesor — #400
// ---------------------------------------------------------------------------

/** Cifras del banner del Portal Profesor (#401). */
export interface ResumenDelDocente {
  cursos_activos: number;
  /** Suma de inscritos en esos cursos. */
  inscritos: number;
  /** Notas que ha registrado en sus cursos. */
  notas: number;
  /** Materias del catálogo a su nombre. */
  materias: number;
}

/** Un curso que imparte el docente (#402). */
export interface CursoDelDocente {
  id: string;
  nombre: string;
  descripcion: string | null;
  estado: string;
  modalidad: string;
  capacidad: number;
  inscritos: number;
  horario: string | null;
  periodo_nombre: string | null;
  /** Notas registradas en este curso. */
  notas: number;
  /** Promedio de esas notas (0–100); `null` si aún no hay ninguna. */
  promedio: number | null;
}

/** Una materia a nombre del docente. */
export interface MateriaDelDocente {
  id: string;
  nombre: string;
  codigo: string | null;
  creditos: number;
  estado: string;
  horario: string | null;
  aula: string | null;
  periodo_nombre: string | null;
  /** Estudiantes inscritos en la materia (matrícula activa). */
  inscritos: number;
}
