/**
 * Consultas de lectura del dominio Psicología. Por la sensibilidad de los
 * datos, CADA función exige `psicologia.leer` antes de leer (defensa en la
 * capa de datos, no solo en la UI).
 */
import { query } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import type {
  CitaDelEstudiante,
  CitaPsicologia,
  NotaPsicologica,
  PsicologiaEstadisticas,
  PsicologoAsignado,
} from "./types";

export async function listarCitas(tipo?: string): Promise<CitaPsicologia[]> {
  await requirePermission("psicologia.leer");
  const params: unknown[] = [];
  let where = "";
  if (tipo) {
    params.push(tipo);
    where = `WHERE c.tipo_registro = $1`;
  }
  const { rows } = await query(
    `SELECT c.id, c.estudiante_id, c.psicologo_id, c.tipo_registro, c.fecha,
            c.hora, c.nivel_confidencialidad, c.estado, c.riesgos,
            c.solicitada_por_estudiante, c.motivo_estudiante,
            e.nombre AS estudiante_nombre,
            u.nombre AS psicologo_nombre,
            n.contenido AS ultima_nota
       FROM cita_psicologia c
       JOIN estudiante e ON e.id = c.estudiante_id
       LEFT JOIN usuario u ON u.id = c.psicologo_id
       -- LATERAL y no un JOIN normal: hay N notas por cita y un JOIN
       -- multiplicaría las filas de la agenda. Esto trae solo la última.
       LEFT JOIN LATERAL (
         SELECT contenido
           FROM nota_psicologica
          WHERE cita_id = c.id
          ORDER BY created_at DESC
          LIMIT 1
       ) n ON TRUE
       ${where}
      ORDER BY c.fecha DESC LIMIT 500`,
    params,
  );
  return rows as CitaPsicologia[];
}

/**
 * Las citas del propio estudiante autenticado.
 *
 * Existe porque `listarCitas` exige `psicologia.leer` y el rol `estudiante` no
 * lo tiene —ni debe tenerlo: ese permiso abre la agenda de TODOS—. Sin esta
 * consulta el joven no podía ver ni sus propias citas.
 *
 * No recibe `estudianteId` por parámetro a propósito: lo resuelve desde la
 * sesión. Un id que llega desde el cliente es una petición, no una identidad;
 * aceptarlo aquí dejaría que cualquiera con sesión leyera la agenda de otro.
 */
export async function citasDeEstudiante(): Promise<CitaDelEstudiante[]> {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const { rows } = await query(
    `SELECT c.id, c.fecha, c.hora, c.estado, c.tipo_registro, c.motivo_estudiante,
            u.nombre AS psicologo_nombre
       FROM cita_psicologia c
       JOIN estudiante e ON e.id = c.estudiante_id
       LEFT JOIN usuario u ON u.id = c.psicologo_id
      WHERE e.usuario_id = $1
      ORDER BY c.fecha DESC
      LIMIT 100`,
    [user.id],
  );
  return rows as CitaDelEstudiante[];
}

/**
 * Psicólogo de cabecera del estudiante autenticado (migración 0021).
 *
 * Devuelve `null` si todavía no tiene uno asignado; la pantalla lo dice en vez
 * de fingir que sí, y la cita se crea igual para que administración la derive.
 */
export async function miPsicologo(): Promise<PsicologoAsignado | null> {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const { rows } = await query(
    `SELECT u.id, u.nombre, u.email
       FROM estudiante e
       JOIN usuario u ON u.id = e.psicologo_id
      WHERE e.usuario_id = $1
      LIMIT 1`,
    [user.id],
  );
  return (rows[0] as PsicologoAsignado) ?? null;
}

/**
 * Psicólogo de cabecera de un expediente concreto.
 *
 * Vive aquí y no en `obtenerExpedienteCompleto` a propósito: esa consulta
 * declara que no toca el dominio de psicología, y colar el dato ahí lo dejaría
 * visible para cualquiera con `expedientes.leer` —administración incluida—.
 * Con `psicologia.leer` delante, la tarjeta simplemente no aparece para quien
 * no es del equipo, en vez de aparecer y negar la acción al pulsarla.
 *
 * `psicologo_id` es una columna de `estudiante`, así que esto no rompe el
 * aislamiento de `cita_psicologia` / `nota_psicologica` / `perfil_psicologico`.
 */
export async function psicologoDeExpediente(
  estudianteId: string,
): Promise<PsicologoAsignado | null> {
  await requirePermission("psicologia.leer");
  const { rows } = await query(
    `SELECT u.id, u.nombre, u.email
       FROM estudiante e
       JOIN usuario u ON u.id = e.psicologo_id
      WHERE e.id = $1
      LIMIT 1`,
    [estudianteId],
  );
  return (rows[0] as PsicologoAsignado) ?? null;
}

/** Psicólogos activos, para asignarlos desde el expediente. */
export async function psicologosDisponibles(): Promise<PsicologoAsignado[]> {
  await requirePermission("psicologia.leer");
  const { rows } = await query(
    `SELECT u.id, u.nombre, u.email
       FROM usuario u
       JOIN rol r ON r.id = u.rol_id
      WHERE r.nombre = 'psicologo' AND u.activo = TRUE
      ORDER BY u.nombre`,
  );
  return rows as PsicologoAsignado[];
}

/** Notas confidenciales de un estudiante. Exige permiso estricto. */
export async function notasDeEstudiante(
  estudianteId: string,
): Promise<NotaPsicologica[]> {
  await requirePermission("psicologia.leer");
  const { rows } = await query(
    `SELECT id, cita_id, estudiante_id, contenido, creado_por_id, created_at
       FROM nota_psicologica
      WHERE estudiante_id = $1
      ORDER BY created_at DESC`,
    [estudianteId],
  );
  return rows as NotaPsicologica[];
}

export async function estadisticasPsicologia(): Promise<PsicologiaEstadisticas> {
  await requirePermission("psicologia.leer");
  const { rows } = await query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE estado = 'programada')::int AS programadas,
            COUNT(*) FILTER (WHERE tipo_registro = 'seguimiento')::int AS seguimientos,
            COUNT(*) FILTER (WHERE nivel_confidencialidad = 'alto')::int AS confidenciales
       FROM cita_psicologia`,
  );
  return rows[0] as PsicologiaEstadisticas;
}
