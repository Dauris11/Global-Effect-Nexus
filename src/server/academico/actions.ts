/**
 * Server Actions del dominio Académico. Lectura/escritura de catálogo exige
 * `academico.*`; el registro de notas exige `calificaciones.registrar`.
 */
"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import {
  CrearPeriodo,
  CrearMateria,
  CrearCurso,
  CrearInscripcion,
  RegistrarCalificacion,
} from "./schema";

export async function crearPeriodo(input: unknown): Promise<string> {
  await requirePermission("academico.escribir");
  const d = CrearPeriodo.parse(input);
  const { rows } = await query(
    `INSERT INTO periodo (nombre, fecha_inicio, fecha_fin, estado)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [d.nombre, d.fecha_inicio, d.fecha_fin, d.estado],
  );
  revalidatePath("/academico/periodos");
  return rows[0].id as string;
}

export async function crearMateria(input: unknown): Promise<string> {
  await requirePermission("academico.escribir");
  const d = CrearMateria.parse(input);
  const { rows } = await query(
    `INSERT INTO materia (nombre, codigo, descripcion, periodo_id, creditos,
                          profesor_nombre, profesor_usuario_id, estado, horario, aula)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
    [
      d.nombre,
      d.codigo || null,
      d.descripcion || null,
      d.periodo_id || null,
      d.creditos,
      d.profesor_nombre || null,
      d.profesor_usuario_id || null,
      d.estado,
      d.horario || null,
      d.aula || null,
    ],
  );
  revalidatePath("/academico/materias");
  return rows[0].id as string;
}

export async function crearCurso(input: unknown): Promise<string> {
  await requirePermission("academico.escribir");
  const d = CrearCurso.parse(input);
  const { rows } = await query(
    `INSERT INTO curso (nombre, descripcion, docente, docente_usuario_id, periodo_id,
                        estado, capacidad, horario, modalidad)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [
      d.nombre,
      d.descripcion || null,
      d.docente || null,
      d.docente_usuario_id || null,
      d.periodo_id || null,
      d.estado,
      d.capacidad,
      d.horario || null,
      d.modalidad,
    ],
  );
  revalidatePath("/academico/cursos");
  return rows[0].id as string;
}

/** Prematrícula: inscribe un estudiante en una materia/período. */
export async function crearInscripcion(input: unknown): Promise<string> {
  await requirePermission("academico.escribir");
  const d = CrearInscripcion.parse(input);
  const { rows } = await query(
    `INSERT INTO inscripcion (estudiante_id, materia_id, periodo_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (estudiante_id, materia_id, periodo_id) DO NOTHING
     RETURNING id`,
    [d.estudiante_id, d.materia_id, d.periodo_id],
  );
  revalidatePath("/academico/prematricula");
  return (rows[0]?.id as string) ?? "";
}

export async function registrarCalificacion(input: unknown): Promise<string> {
  await requirePermission("calificaciones.registrar");
  const d = RegistrarCalificacion.parse(input);
  const { rows } = await query(
    `INSERT INTO calificacion (estudiante_id, curso_id, periodo_id, nota,
                               tipo_evaluacion, observaciones)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [
      d.estudiante_id,
      d.curso_id,
      d.periodo_id,
      d.nota,
      d.tipo_evaluacion,
      d.observaciones || null,
    ],
  );
  revalidatePath("/academico/calificaciones");
  return rows[0].id as string;
}
