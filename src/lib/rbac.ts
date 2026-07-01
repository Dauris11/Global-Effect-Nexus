import { pool } from "./db";

/** Devuelve los códigos de permiso asociados a un rol. */
export async function permisosDeRol(rol: string): Promise<string[]> {
  const { rows } = await pool.query(
    `SELECT p.codigo
       FROM permiso p
       JOIN rol_permiso rp ON rp.permiso_id = p.id
       JOIN rol r ON r.id = rp.rol_id
      WHERE r.nombre = $1`,
    [rol],
  );
  return rows.map((r) => r.codigo as string);
}

/** ¿El rol tiene el permiso indicado? super_admin siempre puede. */
export async function can(rol: string, permiso: string): Promise<boolean> {
  if (rol === "super_admin") return true;
  const { rows } = await pool.query(
    `SELECT 1
       FROM permiso p
       JOIN rol_permiso rp ON rp.permiso_id = p.id
       JOIN rol r ON r.id = rp.rol_id
      WHERE r.nombre = $1 AND p.codigo = $2
      LIMIT 1`,
    [rol, permiso],
  );
  return rows.length > 0;
}
