/**
 * Consultas de lectura del dominio Operaciones.
 */
import { query } from "@/lib/db";
import type { Proyecto, Tarea, Evento, RegistroServicio } from "./types";

export async function listarProyectos(): Promise<Proyecto[]> {
  const { rows } = await query(
    `SELECT id, nombre, descripcion, responsable, estado, fecha_inicio, fecha_fin, progreso
       FROM proyecto ORDER BY created_at DESC LIMIT 200`,
  );
  return rows as Proyecto[];
}

/** Tareas visibles para un usuario: públicas (todos) o asignadas a él. */
export async function listarTareas(usuarioId: string, esAdmin: boolean): Promise<Tarea[]> {
  const { rows } = await query(
    `SELECT t.id, t.titulo, t.descripcion, t.proyecto_id, t.visibilidad,
            t.estado, t.prioridad, t.fecha_limite,
            COALESCE(array_agg(ta.usuario_id) FILTER (WHERE ta.usuario_id IS NOT NULL), '{}') AS asignados
       FROM tarea t
       LEFT JOIN tarea_asignado ta ON ta.tarea_id = t.id
      WHERE $2::boolean
         OR t.visibilidad = 'todos'
         OR t.id IN (SELECT tarea_id FROM tarea_asignado WHERE usuario_id = $1)
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT 500`,
    [usuarioId, esAdmin],
  );
  return rows as Tarea[];
}

export async function listarEventos(desde?: string, hasta?: string): Promise<Evento[]> {
  const params: unknown[] = [];
  const cond: string[] = [];
  if (desde) {
    params.push(desde);
    cond.push(`fecha >= $${params.length}`);
  }
  if (hasta) {
    params.push(hasta);
    cond.push(`fecha <= $${params.length}`);
  }
  const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";
  const { rows } = await query(
    `SELECT id, titulo, descripcion, tipo, fecha, hora_inicio, hora_fin,
            ubicacion, responsable, estado
       FROM evento ${where} ORDER BY fecha LIMIT 500`,
    params,
  );
  return rows as Evento[];
}

/** Registros de servicio comunitario de un mes (formato YYYY-MM). */
export async function serviciosDelMes(mes: string): Promise<RegistroServicio[]> {
  const { rows } = await query(
    `SELECT rs.id, rs.estudiante_id, rs.mes, rs.hizo_servicio, rs.asistio_reunion,
            rs.notas, e.nombre AS estudiante_nombre
       FROM registro_servicio rs
       JOIN estudiante e ON e.id = rs.estudiante_id
      WHERE rs.mes = $1
      ORDER BY e.nombre`,
    [mes],
  );
  return rows as RegistroServicio[];
}
