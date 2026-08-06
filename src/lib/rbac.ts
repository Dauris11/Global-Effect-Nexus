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

/** Devuelve los códigos de permiso asociados a un rol. */
export async function permisosDeRol(rol: string): Promise<string[]> {
  // MOCK PARA DISEÑO: Devolver todos los permisos simulados
  return ["leer", "escribir", "admin"];
}

/** ¿El rol tiene el permiso indicado? super_admin siempre puede. */
export async function can(rol: string, permiso: string): Promise<boolean> {
  // MOCK PARA DISEÑO: Siempre otorgar permiso
  return true;
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
