/**
 * Consultas de lectura (SELECT parametrizado) del dominio Estudiantes.
 * Nunca se interpola entrada del usuario: todo va como parámetro posicional.
 */
import { query } from "@/lib/db";
import type {
  Estudiante,
  EstudianteListItem,
  ExpedienteCompleto,
  Familiar,
  PerfilVivienda,
  PerfilSalud,
  PerfilSocioeconomico,
} from "./types";

/** Lista estudiantes con filtro opcional por tipo y búsqueda por nombre. */
export async function listarEstudiantes(filtro?: {
  tipo?: string;
  buscar?: string;
}): Promise<EstudianteListItem[]> {
  const cond: string[] = [];
  const params: unknown[] = [];

  if (filtro?.tipo) {
    params.push(filtro.tipo);
    cond.push(`tipo = $${params.length}`);
  }
  if (filtro?.buscar) {
    params.push(`%${filtro.buscar}%`);
    cond.push(`nombre ILIKE $${params.length}`);
  }

  const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";
  const { rows } = await query(
    `SELECT id, nombre, tipo, estado, programa
       FROM estudiante
       ${where}
      ORDER BY nombre
      LIMIT 200`,
    params,
  );
  return rows as EstudianteListItem[];
}

/** Obtiene un estudiante por id (datos base del expediente). */
export async function obtenerEstudiante(id: string): Promise<Estudiante | null> {
  const { rows } = await query(
    `SELECT id, nombre, cedula, email, telefono, tipo, estado, programa,
            patrocinador_id, created_at
       FROM estudiante
      WHERE id = $1`,
    [id],
  );
  return (rows[0] as Estudiante) ?? null;
}

/**
 * Expediente integral del estudiante: núcleo + familiares + perfiles + GPA.
 * NO toca las tablas de psicología (aisladas por confidencialidad).
 */
export async function obtenerExpedienteCompleto(
  id: string,
): Promise<ExpedienteCompleto | null> {
  const estudiante = await obtenerEstudiante(id);
  if (!estudiante) return null;

  const [fam, viv, sal, soc, gpa] = await Promise.all([
    query(
      `SELECT id, parentesco, nombre, edad, telefono, profesion
         FROM familiar WHERE estudiante_id = $1 ORDER BY parentesco`,
      [id],
    ),
    query(
      `SELECT con_quien_vive, casa_propia, habitaciones, camas, direccion, comunidad
         FROM perfil_vivienda WHERE estudiante_id = $1`,
      [id],
    ),
    query(
      `SELECT enfermedades, alergias, contacto_emergencia_nombre, contacto_emergencia_telefono
         FROM perfil_salud WHERE estudiante_id = $1`,
      [id],
    ),
    query(
      `SELECT historia_de_vida, situacion_familiar, situacion_economica, motivo_beca, metas_academicas
         FROM perfil_socioeconomico WHERE estudiante_id = $1`,
      [id],
    ),
    query(
      `SELECT ROUND(AVG(gpa)::numeric, 2) AS gpa
         FROM historial_calificacion WHERE estudiante_id = $1`,
      [id],
    ),
  ]);

  return {
    estudiante,
    familiares: fam.rows as Familiar[],
    vivienda: (viv.rows[0] as PerfilVivienda) ?? null,
    salud: (sal.rows[0] as PerfilSalud) ?? null,
    socioeconomico: (soc.rows[0] as PerfilSocioeconomico) ?? null,
    gpa: gpa.rows[0]?.gpa != null ? Number(gpa.rows[0].gpa) : null,
  };
}
