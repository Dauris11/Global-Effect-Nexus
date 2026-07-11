/**
 * Server Actions del dominio Operaciones. Requieren `operaciones.escribir`.
 *
 * Automatización al crear una tarea con asignados:
 *   1. Inserta la tarea y sus asignados (N:M).
 *   2. Crea un evento de calendario con la fecha límite.
 *   3. Notifica por correo a cada asignado (best-effort, vía Resend).
 *   4. Dispara un webhook a n8n (CRM/notificaciones).
 */
"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import { enviarCorreo } from "@/lib/email";
import { dispararWebhook } from "@/lib/integrations";
import {
  CrearProyecto,
  CrearTarea,
  CambiarEstadoTarea,
  CrearEvento,
  UpsertRegistroServicio,
} from "./schema";

export async function crearProyecto(input: unknown): Promise<string> {
  await requirePermission("operaciones.escribir");
  const d = CrearProyecto.parse(input);
  const { rows } = await query(
    `INSERT INTO proyecto (nombre, descripcion, responsable, estado, fecha_inicio, fecha_fin, progreso)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      d.nombre,
      d.descripcion || null,
      d.responsable || null,
      d.estado,
      d.fecha_inicio || null,
      d.fecha_fin || null,
      d.progreso,
    ],
  );
  revalidatePath("/administrativo/proyectos");
  return rows[0].id as string;
}

export async function crearTarea(input: unknown): Promise<string> {
  await requirePermission("operaciones.escribir");
  const d = CrearTarea.parse(input);

  const { rows } = await query(
    `INSERT INTO tarea (titulo, descripcion, proyecto_id, visibilidad, prioridad, fecha_limite)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [
      d.titulo,
      d.descripcion || null,
      d.proyecto_id || null,
      d.visibilidad,
      d.prioridad,
      d.fecha_limite || null,
    ],
  );
  const tareaId = rows[0].id as string;

  if (d.asignados.length > 0) {
    // Asignación N:M (una sola sentencia con unnest).
    await query(
      `INSERT INTO tarea_asignado (tarea_id, usuario_id)
       SELECT $1, u FROM unnest($2::uuid[]) AS u
       ON CONFLICT DO NOTHING`,
      [tareaId, d.asignados],
    );

    // Evento de calendario con la fecha límite (si existe).
    if (d.fecha_limite) {
      await query(
        `INSERT INTO evento (titulo, tipo, fecha, estado, tarea_id)
         VALUES ($1, 'administrativo', $2, 'programado', $3)`,
        [`Tarea: ${d.titulo}`, d.fecha_limite, tareaId],
      );
    }

    // Correo a cada asignado (best-effort).
    const { rows: correos } = await query(
      `SELECT email, nombre FROM usuario WHERE id = ANY($1::uuid[]) AND email IS NOT NULL`,
      [d.asignados],
    );
    await Promise.allSettled(
      correos.map((c) =>
        enviarCorreo({
          to: c.email as string,
          subject: `Nueva tarea asignada: ${d.titulo}`,
          html: `<p>Hola ${c.nombre},</p><p>Se te asignó la tarea <strong>${d.titulo}</strong>${
            d.fecha_limite ? ` con fecha límite ${d.fecha_limite}` : ""
          }.</p>`,
        }),
      ),
    );

    await dispararWebhook("tarea.creada", { tareaId, titulo: d.titulo, asignados: d.asignados });
  }

  revalidatePath("/administrativo/tareas");
  revalidatePath("/calendario");
  return tareaId;
}

export async function cambiarEstadoTarea(input: unknown): Promise<void> {
  await requirePermission("operaciones.escribir");
  const d = CambiarEstadoTarea.parse(input);
  await query(`UPDATE tarea SET estado = $2 WHERE id = $1`, [d.id, d.estado]);
  revalidatePath("/administrativo/tareas");
}

export async function crearEvento(input: unknown): Promise<string> {
  await requirePermission("operaciones.escribir");
  const d = CrearEvento.parse(input);
  const { rows } = await query(
    `INSERT INTO evento (titulo, descripcion, tipo, fecha, hora_inicio, hora_fin, ubicacion, responsable)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [
      d.titulo,
      d.descripcion || null,
      d.tipo,
      d.fecha,
      d.hora_inicio || null,
      d.hora_fin || null,
      d.ubicacion || null,
      d.responsable || null,
    ],
  );
  revalidatePath("/calendario");
  return rows[0].id as string;
}

/** Marca/actualiza el servicio y la reunión de un estudiante en un mes. */
export async function upsertRegistroServicio(input: unknown): Promise<void> {
  await requirePermission("operaciones.escribir");
  const d = UpsertRegistroServicio.parse(input);
  await query(
    `INSERT INTO registro_servicio (estudiante_id, mes, hizo_servicio, asistio_reunion, notas)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (estudiante_id, mes)
     DO UPDATE SET hizo_servicio = EXCLUDED.hizo_servicio,
                   asistio_reunion = EXCLUDED.asistio_reunion,
                   notas = EXCLUDED.notas`,
    [d.estudiante_id, d.mes, d.hizo_servicio, d.asistio_reunion, d.notas || null],
  );
  revalidatePath("/servicios-mensuales");
}
