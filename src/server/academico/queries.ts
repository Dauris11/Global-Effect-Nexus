/**
 * Consultas de lectura del dominio Académico (SELECT parametrizado).
 */
import { query } from "@/lib/db";
import type {
  Periodo,
  Materia,
  Curso,
  Inscripcion,
  Calificacion,
  HistorialCalificacion,
} from "./types";

export async function listarPeriodos(): Promise<Periodo[]> {
  const { rows } = await query(
    `SELECT id, nombre, fecha_inicio, fecha_fin, estado
       FROM periodo ORDER BY fecha_inicio DESC`,
  );
  return rows as Periodo[];
}

export async function listarMaterias(buscar?: string): Promise<Materia[]> {
  const params: unknown[] = [];
  let where = "";
  if (buscar) {
    params.push(`%${buscar}%`);
    where = `WHERE nombre ILIKE $1 OR codigo ILIKE $1 OR profesor_nombre ILIKE $1`;
  }
  const { rows } = await query(
    `SELECT id, nombre, codigo, descripcion, periodo_id, creditos,
            profesor_nombre, estado, horario, aula
       FROM materia ${where} ORDER BY nombre LIMIT 200`,
    params,
  );
  return rows as Materia[];
}

export async function listarCursos(buscar?: string): Promise<Curso[]> {
  const params: unknown[] = [];
  let where = "";
  if (buscar) {
    params.push(`%${buscar}%`);
    where = `WHERE nombre ILIKE $1 OR docente ILIKE $1`;
  }
  const { rows } = await query(
    `SELECT id, nombre, descripcion, docente, periodo_id, estado,
            capacidad, inscritos, horario, modalidad
       FROM curso ${where} ORDER BY nombre LIMIT 200`,
    params,
  );
  return rows as Curso[];
}

export async function listarInscripciones(periodoId?: string): Promise<Inscripcion[]> {
  const params: unknown[] = [];
  let where = "";
  if (periodoId) {
    params.push(periodoId);
    where = `WHERE i.periodo_id = $1`;
  }
  const { rows } = await query(
    `SELECT i.id, i.estudiante_id, i.materia_id, i.periodo_id, i.estado,
            e.nombre AS estudiante_nombre, m.nombre AS materia_nombre
       FROM inscripcion i
       JOIN estudiante e ON e.id = i.estudiante_id
       JOIN materia m    ON m.id = i.materia_id
       ${where}
      ORDER BY e.nombre LIMIT 500`,
    params,
  );
  return rows as Inscripcion[];
}

export async function listarCalificaciones(buscar?: string): Promise<Calificacion[]> {
  const params: unknown[] = [];
  let where = "";
  if (buscar) {
    params.push(`%${buscar}%`);
    where = `WHERE e.nombre ILIKE $1 OR c.nombre ILIKE $1`;
  }
  const { rows } = await query(
    `SELECT cal.id, cal.estudiante_id, cal.curso_id, cal.periodo_id, cal.nota,
            cal.tipo_evaluacion, cal.observaciones,
            e.nombre AS estudiante_nombre, c.nombre AS curso_nombre
       FROM calificacion cal
       JOIN estudiante e ON e.id = cal.estudiante_id
       JOIN curso c      ON c.id = cal.curso_id
       ${where}
      ORDER BY cal.created_at DESC LIMIT 500`,
    params,
  );
  return rows as Calificacion[];
}

export async function historialDeEstudiante(
  estudianteId: string,
): Promise<HistorialCalificacion[]> {
  const { rows } = await query(
    `SELECT id, estudiante_id, cuatrimestre, materia, nota_numerica,
            nota_letra, gpa, estado
       FROM historial_calificacion
      WHERE estudiante_id = $1
      ORDER BY cuatrimestre DESC, materia`,
    [estudianteId],
  );
  return rows as HistorialCalificacion[];
}

/** GPA acumulado de un estudiante (promedio de gpa del historial). */
export async function gpaDeEstudiante(estudianteId: string): Promise<number | null> {
  const { rows } = await query(
    `SELECT ROUND(AVG(gpa)::numeric, 2) AS gpa
       FROM historial_calificacion WHERE estudiante_id = $1`,
    [estudianteId],
  );
  return rows[0]?.gpa != null ? Number(rows[0].gpa) : null;
}
