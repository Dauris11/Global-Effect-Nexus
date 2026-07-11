/**
 * Consultas de lectura del dominio Patrocinio.
 */
import { query } from "@/lib/db";
import type {
  Patrocinador,
  PatrocinadorEstadisticas,
  AsignacionBeca,
} from "./types";

export async function listarPatrocinadores(estado?: string): Promise<Patrocinador[]> {
  const params: unknown[] = [];
  let where = "";
  if (estado) {
    params.push(estado);
    where = `WHERE estado = $1`;
  }
  const { rows } = await query(
    `SELECT id, nombre, tipo, email, telefono, pais, estado, monto_mensual, notas
       FROM patrocinador ${where} ORDER BY nombre LIMIT 300`,
    params,
  );
  return rows as Patrocinador[];
}

export async function estadisticasPatrocinadores(): Promise<PatrocinadorEstadisticas> {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE estado = 'activo')::int AS activos,
            COALESCE(SUM(monto_mensual) FILTER (WHERE estado = 'activo'), 0)::float AS aporte_mensual_total,
            COUNT(DISTINCT pais)::int AS paises
       FROM patrocinador`,
  );
  return rows[0] as PatrocinadorEstadisticas;
}

export async function listarBecas(): Promise<AsignacionBeca[]> {
  const { rows } = await query(
    `SELECT ab.id, ab.estudiante_id, ab.patrocinador_id, ab.monto,
            ab.fecha_inicio, ab.fecha_fin, ab.estado,
            e.nombre AS estudiante_nombre, p.nombre AS patrocinador_nombre
       FROM asignacion_beca ab
       JOIN estudiante e   ON e.id = ab.estudiante_id
       JOIN patrocinador p ON p.id = ab.patrocinador_id
      ORDER BY ab.fecha_inicio DESC LIMIT 500`,
  );
  return rows as AsignacionBeca[];
}
