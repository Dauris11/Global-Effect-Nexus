/**
 * Consultas de lectura del dominio Psicología. Por la sensibilidad de los
 * datos, CADA función exige `psicologia.leer` antes de leer (defensa en la
 * capa de datos, no solo en la UI).
 */
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import type {
  CitaPsicologia,
  NotaPsicologica,
  PsicologiaEstadisticas,
} from "./types";

export async function listarCitas(tipo?: string): Promise<CitaPsicologia[]> {
  await requirePermission("psicologia.leer");
  const params: unknown[] = [];
  let where = "";
  if (tipo) {
    params.push(tipo);
    where = `WHERE c.tipo_registro = $1`;
  }
  const { rows } = await query(
    `SELECT c.id, c.estudiante_id, c.psicologo_id, c.tipo_registro, c.fecha,
            c.hora, c.nivel_confidencialidad, c.estado, c.riesgos,
            e.nombre AS estudiante_nombre
       FROM cita_psicologia c
       JOIN estudiante e ON e.id = c.estudiante_id
       ${where}
      ORDER BY c.fecha DESC LIMIT 500`,
    params,
  );
  return rows as CitaPsicologia[];
}

/** Notas confidenciales de un estudiante. Exige permiso estricto. */
export async function notasDeEstudiante(
  estudianteId: string,
): Promise<NotaPsicologica[]> {
  await requirePermission("psicologia.leer");
  const { rows } = await query(
    `SELECT id, cita_id, estudiante_id, contenido, creado_por_id, created_at
       FROM nota_psicologica
      WHERE estudiante_id = $1
      ORDER BY created_at DESC`,
    [estudianteId],
  );
  return rows as NotaPsicologica[];
}

export async function estadisticasPsicologia(): Promise<PsicologiaEstadisticas> {
  await requirePermission("psicologia.leer");
  const { rows } = await query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE estado = 'programada')::int AS programadas,
            COUNT(*) FILTER (WHERE tipo_registro = 'seguimiento')::int AS seguimientos,
            COUNT(*) FILTER (WHERE nivel_confidencialidad = 'alto')::int AS confidenciales
       FROM cita_psicologia`,
  );
  return rows[0] as PsicologiaEstadisticas;
}
