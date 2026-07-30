/**
 * Server Actions del dominio Académico. Lectura/escritura de catálogo exige
 * `academico.*`; el registro de notas exige `calificaciones.registrar`.
 */
"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import {
  ActualizarCurso,
  ActualizarMateria,
  ActualizarPeriodo,
  CrearPeriodo,
  CrearMateria,
  CrearCurso,
  CrearInscripcion,
  EliminarPorId,
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

// ---------------------------------------------------------------------------
// Edición — ClickUp S6 · #383, #384, #394
// ---------------------------------------------------------------------------

export async function actualizarPeriodo(input: unknown): Promise<void> {
  await requirePermission("academico.escribir");
  const d = ActualizarPeriodo.parse(input);
  await query(
    `UPDATE periodo
        SET nombre = $2, fecha_inicio = $3, fecha_fin = $4, estado = $5
      WHERE id = $1`,
    [d.id, d.nombre, d.fecha_inicio, d.fecha_fin, d.estado],
  );
  // Un período cambia de nombre o de estado y eso se ve en las cuatro
  // pantallas que lo muestran, no solo en la suya.
  for (const r of [
    "/academico/periodos",
    "/academico/materias",
    "/academico/cursos",
    "/academico/prematricula",
  ]) {
    revalidatePath(r);
  }
}

export async function actualizarMateria(input: unknown): Promise<void> {
  await requirePermission("academico.escribir");
  const d = ActualizarMateria.parse(input);
  await query(
    `UPDATE materia
        SET nombre = $2, codigo = $3, descripcion = $4, periodo_id = $5,
            creditos = $6, profesor_nombre = $7, profesor_usuario_id = $8,
            estado = $9, horario = $10, aula = $11
      WHERE id = $1`,
    [
      d.id,
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
  // También el portal del docente: quitarle una materia de encima (o ponérsela)
  // cambia lo que ve en su pantalla, no solo el catálogo.
  revalidatePath("/academico/materias");
  revalidatePath("/portal/profesor");
  revalidatePath("/portal/estudiante");
}

/**
 * Actualiza un curso **sin tocar `inscritos`**.
 *
 * Esa columna la mueve la matrícula, no este formulario — el mismo criterio con
 * el que el alta tampoco la pide. Dejar que la edición la sobrescribiera
 * convertiría un cambio de horario en una corrección silenciosa del cupo.
 */
export async function actualizarCurso(input: unknown): Promise<void> {
  await requirePermission("academico.escribir");
  const d = ActualizarCurso.parse(input);
  await query(
    `UPDATE curso
        SET nombre = $2, descripcion = $3, docente = $4, docente_usuario_id = $5,
            periodo_id = $6, estado = $7, capacidad = $8, horario = $9,
            modalidad = $10
      WHERE id = $1`,
    [
      d.id,
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
  revalidatePath("/portal/profesor");
}

// ---------------------------------------------------------------------------
// Borrado con guarda de dependencias
// ---------------------------------------------------------------------------

/**
 * Resultado de un borrado.
 *
 * Devuelve un objeto en vez de lanzar cuando el registro está en uso, y no es
 * un capricho de estilo: Next.js **oculta el mensaje** de un error no
 * controlado de una Server Action en producción, así que la pantalla recibiría
 * "algo falló" y no podría explicar qué. Lo esperable viaja como dato; lo
 * excepcional —la BD caída— sigue lanzando.
 */
export type ResultadoEliminar =
  | { ok: true }
  | { ok: false; motivo: "en_uso"; dependencias: { clave: string; total: number }[] };

/**
 * Cuenta lo que cuelga de un registro y decide si se puede borrar.
 *
 * **Por qué existe esta guarda.** Las FK del esquema son `ON DELETE CASCADE`:
 * borrar un curso se lleva por delante todas sus calificaciones, y borrar una
 * materia, todas sus inscripciones. Un clic en un menú no puede destruir el
 * historial de un cuatrimestre.
 *
 * La consecuencia es que el borrado solo sirve para lo que nadie usa todavía
 * —una materia creada por error, un período mal tecleado— y para lo demás está
 * el estado: una materia `inactiva` o un curso `finalizado` desaparecen del
 * trabajo diario sin perder lo que colgaba de ellos. Es la respuesta correcta,
 * no una limitación: en un registro de vidas casi nada se borra de verdad.
 *
 * Por eso tampoco hace falta un permiso `academico.eliminar` aparte del de
 * escritura, como sí lo hay en Expedientes: aquí el borrado no puede destruir
 * nada por construcción.
 */
async function contarDependencias(
  consultas: { clave: string; sql: string }[],
  id: string,
): Promise<{ clave: string; total: number }[]> {
  const conteos = await Promise.all(
    consultas.map(async ({ clave, sql }) => ({
      clave,
      total: Number((await query(sql, [id])).rows[0]?.total ?? 0),
    })),
  );
  return conteos.filter((c) => c.total > 0);
}

export async function eliminarMateria(input: unknown): Promise<ResultadoEliminar> {
  await requirePermission("academico.escribir");
  const { id } = EliminarPorId.parse(input);

  // El historial guarda el nombre de la materia como texto, no como FK
  // (decisión del esquema, ver `historial_calificacion`), así que borrar la
  // materia no toca el expediente de nadie: no hay que contarlo aquí.
  const dependencias = await contarDependencias(
    [
      {
        clave: "enrollments",
        sql: `SELECT COUNT(*)::int AS total FROM inscripcion WHERE materia_id = $1`,
      },
    ],
    id,
  );
  if (dependencias.length > 0) return { ok: false, motivo: "en_uso", dependencias };

  await query(`DELETE FROM materia WHERE id = $1`, [id]);
  revalidatePath("/academico/materias");
  revalidatePath("/portal/profesor");
  return { ok: true };
}

export async function eliminarCurso(input: unknown): Promise<ResultadoEliminar> {
  await requirePermission("academico.escribir");
  const { id } = EliminarPorId.parse(input);

  const dependencias = await contarDependencias(
    [
      {
        clave: "grades",
        sql: `SELECT COUNT(*)::int AS total FROM calificacion WHERE curso_id = $1`,
      },
      // `inscritos` es un contador de la propia fila, no una tabla: si alguien
      // lo dejó en 12, hay doce personas contando con ese curso aunque todavía
      // no tengan nota.
      {
        clave: "enrolled",
        sql: `SELECT COALESCE(inscritos, 0)::int AS total FROM curso WHERE id = $1`,
      },
    ],
    id,
  );
  if (dependencias.length > 0) return { ok: false, motivo: "en_uso", dependencias };

  await query(`DELETE FROM curso WHERE id = $1`, [id]);
  revalidatePath("/academico/cursos");
  revalidatePath("/portal/profesor");
  return { ok: true };
}

export async function eliminarPeriodo(input: unknown): Promise<ResultadoEliminar> {
  await requirePermission("academico.escribir");
  const { id } = EliminarPorId.parse(input);

  const dependencias = await contarDependencias(
    [
      {
        clave: "subjects",
        sql: `SELECT COUNT(*)::int AS total FROM materia WHERE periodo_id = $1`,
      },
      {
        clave: "courses",
        sql: `SELECT COUNT(*)::int AS total FROM curso WHERE periodo_id = $1`,
      },
      {
        clave: "enrollments",
        sql: `SELECT COUNT(*)::int AS total FROM inscripcion WHERE periodo_id = $1`,
      },
      {
        clave: "grades",
        sql: `SELECT COUNT(*)::int AS total FROM calificacion WHERE periodo_id = $1`,
      },
    ],
    id,
  );
  if (dependencias.length > 0) return { ok: false, motivo: "en_uso", dependencias };

  await query(`DELETE FROM periodo WHERE id = $1`, [id]);
  revalidatePath("/academico/periodos");
  return { ok: true };
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
