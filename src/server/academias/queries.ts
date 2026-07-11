/**
 * Consultas de lectura del dominio Academias.
 */
import { query } from "@/lib/db";
import type { Academia, Material } from "./types";

export async function listarAcademias(): Promise<Academia[]> {
  const { rows } = await query(
    `SELECT id, nombre, tipo, descripcion, facilitador, estado, participantes,
            fecha_inicio, fecha_fin
       FROM academia ORDER BY created_at DESC LIMIT 200`,
  );
  return rows as Academia[];
}

export async function materialesDeAcademia(academiaId: string): Promise<Material[]> {
  const { rows } = await query(
    `SELECT id, titulo, descripcion, academia_id, tipo, documento_id, enlace_url, autor
       FROM material WHERE academia_id = $1 ORDER BY created_at DESC`,
    [academiaId],
  );
  return rows as Material[];
}
