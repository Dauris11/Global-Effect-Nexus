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

// ---------------------------------------------------------------------------
// Gestión de personal — ClickUp S9 · #450–451
// ---------------------------------------------------------------------------

/** Persona del equipo con su rol y la carga de trabajo que tiene encima. */
export interface PersonaDelEquipo extends UsuarioAdmin {
  rol_descripcion: string | null;
  tareas_abiertas: number;
  tareas_vencidas: number;
}

/**
 * El equipo con su carga de trabajo.
 *
 * `listarUsuarios` responde "quién existe"; esto responde "quién está cargado",
 * que es la pregunta de la pantalla de personal. Los conteos se resuelven con
 * subconsultas escalares y no con un `JOIN` + `GROUP BY` porque el equipo es de
 * decenas de personas, no de miles, y así la consulta se lee de un tirón.
 */
export async function listarPersonal(buscar?: string): Promise<PersonaDelEquipo[]> {
  await requirePermission("usuarios.administrar");
  const params: unknown[] = [];
  let where = "";
  if (buscar) {
    params.push(`%${buscar}%`);
    where = `WHERE u.nombre ILIKE $1 OR u.email ILIKE $1`;
  }
  const { rows } = await query(
    `SELECT u.id, u.email, u.nombre, u.idioma, u.activo,
            r.nombre      AS rol,
            r.descripcion AS rol_descripcion,
            u.ultimo_acceso,
            (SELECT COUNT(*) FROM tarea_asignado ta
               JOIN tarea t ON t.id = ta.tarea_id
              WHERE ta.usuario_id = u.id
                AND t.estado IN ('pendiente','en_progreso'))::int AS tareas_abiertas,
            (SELECT COUNT(*) FROM tarea_asignado ta
               JOIN tarea t ON t.id = ta.tarea_id
              WHERE ta.usuario_id = u.id
                AND t.estado IN ('pendiente','en_progreso')
                AND t.fecha_limite < CURRENT_DATE)::int           AS tareas_vencidas
       FROM usuario u
       JOIN rol r ON r.id = u.rol_id
       ${where}
      ORDER BY u.activo DESC, u.nombre
      LIMIT 300`,
    params,
  );
  return rows as PersonaDelEquipo[];
}

/**
 * Cifras del equipo — ClickUp S9 · #450, y reparto por rol — #451.
 *
 * `nunca_entro` cuenta a los invitados que todavía no han iniciado sesión: es
 * el número que dice si una invitación se quedó a medias, y no se deduce de
 * ninguna otra cifra.
 */
export async function resumenPersonal(): Promise<{
  total: number;
  activos: number;
  inactivos: number;
  nunca_entro: number;
  por_rol: { rol: string; descripcion: string | null; total: number }[];
}> {
  await requirePermission("usuarios.administrar");

  const [cifras, reparto] = await Promise.all([
    query(
      `SELECT COUNT(*)::int                                        AS total,
              COUNT(*) FILTER (WHERE activo)::int                  AS activos,
              COUNT(*) FILTER (WHERE NOT activo)::int              AS inactivos,
              COUNT(*) FILTER (WHERE ultimo_acceso IS NULL)::int   AS nunca_entro
         FROM usuario`,
    ),
    query(
      `SELECT r.nombre AS rol, r.descripcion, COUNT(u.id)::int AS total
         FROM rol r
         LEFT JOIN usuario u ON u.rol_id = r.id
        GROUP BY r.id, r.nombre, r.descripcion
        ORDER BY COUNT(u.id) DESC, r.nombre`,
    ),
  ]);

  return {
    ...(cifras.rows[0] as {
      total: number;
      activos: number;
      inactivos: number;
      nunca_entro: number;
    }),
    por_rol: reparto.rows as { rol: string; descripcion: string | null; total: number }[],
  };
}
