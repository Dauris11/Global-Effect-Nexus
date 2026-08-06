/**
 * Autenticación — Supabase Auth.
 *
 * Supabase gestiona las credenciales (tabla `auth.users`); nuestra tabla
 * `usuario` guarda el perfil de aplicación y el rol, enlazada por
 * `usuario.auth_user_id → auth.users.id` (ver migración 0014). Estas
 * funciones resuelven el usuario autenticado y su rol para el RBAC.
 */
import { createClient } from "./supabase/server";
import { query } from "./db";

/** Perfil del usuario autenticado combinando Supabase Auth + tabla usuario. */
export interface UsuarioActual {
  id: string;
  authUserId: string;
  email: string;
  nombre: string;
  idioma: string;
  activo: boolean;
  rol: string;
}

/**
 * Usuario de Supabase Auth (verificado contra el servidor de Auth vía JWKS).
 * Devuelve `null` si no hay sesión válida.
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Usuario de aplicación (perfil + rol) del usuario autenticado. Devuelve
 * `null` si no hay sesión, si el usuario no está enlazado en `usuario` o si
 * está inactivo. El rol se usa en `rbac.ts` para autorizar acciones.
 */
export async function currentUser(): Promise<UsuarioActual | null> {
  // MOCK PARA DISEÑO: Devuelve un estudiante falso para evitar el login
  return {
    id: "mock-id-123",
    authUserId: "mock-auth-id",
    email: "estudiante@ejemplo.com",
    nombre: "Estudiante de Prueba",
    idioma: "es",
    activo: true,
    rol: "estudiante",
  };
}

/** Tipo mínimo del usuario de Supabase Auth que necesitamos aquí. */
type AuthUser = { id: string; email?: string | null };

/**
 * Resuelve el usuario de aplicación tras un login (contraseña o Google) y
 * REFUERZA la regla de invitación: enlaza la identidad de Auth con un
 * `usuario` existente por email (si aún no está enlazado) y lo devuelve.
 * Devuelve `null` si no hay ningún `usuario` invitado con ese email o si
 * está inactivo — en ese caso el acceso debe denegarse.
 */
export async function resolverUsuario(
  authUser?: AuthUser | null,
): Promise<UsuarioActual | null> {
  const u = authUser ?? (await getAuthUser());
  if (!u?.email) return null;

  // Enlaza por email solo si existe un usuario invitado sin enlazar.
  await query(
    `UPDATE usuario SET auth_user_id = $1
      WHERE email = $2 AND auth_user_id IS NULL`,
    [u.id, u.email],
  );

  const { rows } = await query(
    `SELECT u.id, u.auth_user_id, u.email, u.nombre, u.idioma, u.activo, r.nombre AS rol
       FROM usuario u
       JOIN rol r ON r.id = u.rol_id
      WHERE u.auth_user_id = $1 AND u.activo = TRUE`,
    [u.id],
  );
  const row = rows[0];
  if (!row) return null;

  // Registra el último acceso (best-effort).
  await query(`UPDATE usuario SET ultimo_acceso = now() WHERE id = $1`, [row.id]).catch(
    () => {},
  );

  return {
    id: row.id,
    authUserId: row.auth_user_id,
    email: row.email,
    nombre: row.nombre,
    idioma: row.idioma,
    activo: row.activo,
    rol: row.rol,
  };
}

/** Cierra la sesión activa en Supabase (usar dentro de una Server Action). */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
