/**
 * Consultas de lectura del dominio Usuarios (gestión de personal / config).
 * Requieren `usuarios.administrar`.
 */
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";

export interface UsuarioAdmin {
  id: string;
  email: string;
  nombre: string;
  idioma: string;
  activo: boolean;
  rol: string;
  ultimo_acceso: string | null;
}

export async function listarUsuarios(buscar?: string): Promise<UsuarioAdmin[]> {
  await requirePermission("usuarios.administrar");
  const params: unknown[] = [];
  let where = "";
  if (buscar) {
    params.push(`%${buscar}%`);
    where = `WHERE u.nombre ILIKE $1 OR u.email ILIKE $1`;
  }
  const { rows } = await query(
    `SELECT u.id, u.email, u.nombre, u.idioma, u.activo, r.nombre AS rol, u.ultimo_acceso
       FROM usuario u
       JOIN rol r ON r.id = u.rol_id
       ${where}
      ORDER BY u.nombre LIMIT 300`,
    params,
  );
  return rows as UsuarioAdmin[];
}

export async function listarRoles(): Promise<{ id: string; nombre: string; descripcion: string | null }[]> {
  await requirePermission("usuarios.administrar");
  const { rows } = await query(
    `SELECT id, nombre, descripcion FROM rol ORDER BY nombre`,
  );
  return rows as { id: string; nombre: string; descripcion: string | null }[];
}
