/**
 * Consultas de lectura del dominio IA.
 */
import { query } from "@/lib/db";
import type { ConversacionIA, MensajeIA } from "./types";

export async function listarConversaciones(usuarioId: string): Promise<ConversacionIA[]> {
  const { rows } = await query(
    `SELECT id, usuario_id, ambito, titulo, created_at
       FROM conversacion_ia WHERE usuario_id = $1
      ORDER BY updated_at DESC LIMIT 100`,
    [usuarioId],
  );
  return rows as ConversacionIA[];
}

export async function mensajesDeConversacion(conversacionId: string): Promise<MensajeIA[]> {
  const { rows } = await query(
    `SELECT id, conversacion_id, rol, contenido, created_at
       FROM mensaje_ia WHERE conversacion_id = $1
      ORDER BY created_at`,
    [conversacionId],
  );
  return rows as MensajeIA[];
}

/**
 * Construye un contexto compacto desde la BD para alimentar al chat interno
 * (conteos de las entidades clave). Ampliable con RAG (fragmento_conocimiento).
 */
export async function contextoInstitucional(): Promise<string> {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM estudiante WHERE estado = 'activo')      AS estudiantes_activos,
       (SELECT COUNT(*) FROM estudiante WHERE tipo = 'becado')        AS becados,
       (SELECT COUNT(*) FROM curso WHERE estado = 'activo')           AS cursos_activos,
       (SELECT COUNT(*) FROM patrocinador WHERE estado = 'activo')    AS patrocinadores,
       (SELECT COUNT(*) FROM tarea WHERE estado <> 'completada')      AS tareas_pendientes,
       (SELECT COALESCE(SUM(monto) FILTER (WHERE tipo='ingreso'),0)
             - COALESCE(SUM(monto) FILTER (WHERE tipo='egreso'),0) FROM transaccion) AS balance`,
  );
  const r = rows[0];
  return [
    `Estudiantes activos: ${r.estudiantes_activos}`,
    `Becados: ${r.becados}`,
    `Cursos activos: ${r.cursos_activos}`,
    `Patrocinadores activos: ${r.patrocinadores}`,
    `Tareas pendientes: ${r.tareas_pendientes}`,
    `Balance actual (USD): ${r.balance}`,
  ].join(" · ");
}
