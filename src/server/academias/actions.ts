/**
 * Server Actions del dominio Academias. Requieren `academico.escribir`.
 */
"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import { CrearAcademia, CrearMaterial } from "./schema";

export async function crearAcademia(input: unknown): Promise<string> {
  await requirePermission("academico.escribir");
  const d = CrearAcademia.parse(input);
  const { rows } = await query(
    `INSERT INTO academia (nombre, tipo, descripcion, facilitador, estado, participantes, fecha_inicio, fecha_fin)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [
      d.nombre,
      d.tipo,
      d.descripcion || null,
      d.facilitador || null,
      d.estado,
      d.participantes,
      d.fecha_inicio || null,
      d.fecha_fin || null,
    ],
  );
  revalidatePath("/academias/programas");
  return rows[0].id as string;
}

export async function crearMaterial(input: unknown): Promise<string> {
  await requirePermission("academico.escribir");
  const d = CrearMaterial.parse(input);
  const { rows } = await query(
    `INSERT INTO material (titulo, descripcion, academia_id, tipo, documento_id, enlace_url, autor)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      d.titulo,
      d.descripcion || null,
      d.academia_id,
      d.tipo,
      d.documento_id || null,
      d.enlace_url || null,
      d.autor || null,
    ],
  );
  revalidatePath("/academias/materiales");
  return rows[0].id as string;
}
