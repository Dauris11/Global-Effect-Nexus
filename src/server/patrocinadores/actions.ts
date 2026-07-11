/**
 * Server Actions del dominio Patrocinio. Requieren `patrocinadores.escribir`.
 */
"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import { CrearPatrocinador, AsignarBeca } from "./schema";

export async function crearPatrocinador(input: unknown): Promise<string> {
  await requirePermission("patrocinadores.escribir");
  const d = CrearPatrocinador.parse(input);
  const { rows } = await query(
    `INSERT INTO patrocinador (nombre, tipo, email, telefono, pais, estado, monto_mensual, notas)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [
      d.nombre,
      d.tipo,
      d.email || null,
      d.telefono || null,
      d.pais || null,
      d.estado,
      d.monto_mensual,
      d.notas || null,
    ],
  );
  revalidatePath("/patrocinadores");
  return rows[0].id as string;
}

export async function asignarBeca(input: unknown): Promise<string> {
  await requirePermission("patrocinadores.escribir");
  const d = AsignarBeca.parse(input);
  const { rows } = await query(
    `INSERT INTO asignacion_beca (estudiante_id, patrocinador_id, monto, fecha_inicio, fecha_fin)
     VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5) RETURNING id`,
    [
      d.estudiante_id,
      d.patrocinador_id,
      d.monto,
      d.fecha_inicio || null,
      d.fecha_fin || null,
    ],
  );
  revalidatePath("/patrocinadores/becas");
  return rows[0].id as string;
}
