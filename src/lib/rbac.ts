/**
 * Control de acceso basado en roles (RBAC).
 *
 * Los permisos viven en la BD (`permiso`, `rol_permiso`) y se evalúan por
 * código, p. ej. `can(rol, "expedientes.escribir")`. `super_admin` siempre
 * pasa. Usar `requirePermission` en Server Actions para exigir un permiso y
 * obtener de paso el usuario autenticado.
 */
import { pool } from "./db";
import { currentUser, type UsuarioActual } from "./auth";
import { MODO_DISENO } from "./modo-diseno";
import { NAV_ITEMS } from "./nav";

/**
 * Todos los códigos de permiso declarados en la navegación. Solo se usa en
 * modo diseño, donde no hay BD que consultar y el menú debe verse completo.
 */
const PERMISOS_DE_DISENO = Array.from(
  new Set(NAV_ITEMS.flatMap((i) => [...(i.permiso ? [i.permiso] : []), ...(i.permisos ?? [])])),
);

/** Devuelve los códigos de permiso asociados a un rol. */
export async function permisosDeRol(rol: string): Promise<string[]> {
  if (MODO_DISENO) {
    if (rol === "estudiante") return [];
    return PERMISOS_DE_DISENO;
  }

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
  if (MODO_DISENO) return true;
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

/**
 * Exige un permiso al usuario autenticado. Lanza si no hay sesión o si el rol
 * no tiene el permiso; en caso contrario devuelve el usuario (para reutilizar
 * su id/rol en la acción). Patrón estándar al inicio de cada Server Action.
 */
export async function requirePermission(permiso: string): Promise<UsuarioActual> {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");
  if (!(await can(user.rol, permiso))) throw new Error("No autorizado");
  return user;
}
