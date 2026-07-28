/**
 * Consultas de lectura del dominio Operaciones.
 */
import { query } from "@/lib/db";
import type {
  Proyecto,
  ProyectoConAvance,
  Tarea,
  TareaTablero,
  Evento,
  EntradaAgenda,
  RegistroServicio,
} from "./types";

export async function listarProyectos(): Promise<Proyecto[]> {
  const { rows } = await query(
    `SELECT id, nombre, descripcion, responsable, estado, fecha_inicio, fecha_fin, progreso
       FROM proyecto ORDER BY created_at DESC LIMIT 200`,
  );
  return rows as Proyecto[];
}

/** Tareas visibles para un usuario: públicas (todos) o asignadas a él. */
export async function listarTareas(usuarioId: string, esAdmin: boolean): Promise<Tarea[]> {
  const { rows } = await query(
    `SELECT t.id, t.titulo, t.descripcion, t.proyecto_id, t.visibilidad,
            t.estado, t.prioridad, t.fecha_limite,
            COALESCE(array_agg(ta.usuario_id) FILTER (WHERE ta.usuario_id IS NOT NULL), '{}') AS asignados
       FROM tarea t
       LEFT JOIN tarea_asignado ta ON ta.tarea_id = t.id
      WHERE $2::boolean
         OR t.visibilidad = 'todos'
         OR t.id IN (SELECT tarea_id FROM tarea_asignado WHERE usuario_id = $1)
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT 500`,
    [usuarioId, esAdmin],
  );
  return rows as Tarea[];
}

export async function listarEventos(desde?: string, hasta?: string): Promise<Evento[]> {
  const params: unknown[] = [];
  const cond: string[] = [];
  if (desde) {
    params.push(desde);
    cond.push(`fecha >= $${params.length}`);
  }
  if (hasta) {
    params.push(hasta);
    cond.push(`fecha <= $${params.length}`);
  }
  const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";
  const { rows } = await query(
    `SELECT id, titulo, descripcion, tipo, fecha, hora_inicio, hora_fin,
            ubicacion, responsable, estado
       FROM evento ${where} ORDER BY fecha LIMIT 500`,
    params,
  );
  return rows as Evento[];
}

/**
 * Tareas visibles para un usuario, con los asignados ya resueltos a nombre.
 *
 * El tablero necesita mostrar avatares, y hacerlo desde `listarTareas` obligaría
 * a una segunda consulta por tarea. Aquí los nombres vienen agregados como JSON
 * en la misma pasada.
 */
export async function listarTareasDelTablero(
  usuarioId: string,
  esAdmin: boolean,
): Promise<TareaTablero[]> {
  const { rows } = await query(
    `SELECT t.id, t.titulo, t.descripcion, t.proyecto_id, t.visibilidad,
            t.estado, t.prioridad,
            -- A texto en SQL: el driver devolvería un Date y el cliente tendría
            -- que lidiar con la zona horaria para algo que es solo un día.
            to_char(t.fecha_limite, 'YYYY-MM-DD') AS fecha_limite,
            p.nombre AS proyecto_nombre,
            COALESCE(
              json_agg(
                json_build_object('id', u.id, 'nombre', u.nombre)
                ORDER BY u.nombre
              ) FILTER (WHERE u.id IS NOT NULL),
              '[]'
            ) AS asignados
       FROM tarea t
       LEFT JOIN proyecto p ON p.id = t.proyecto_id
       LEFT JOIN tarea_asignado ta ON ta.tarea_id = t.id
       LEFT JOIN usuario u ON u.id = ta.usuario_id
      WHERE $2::boolean
         OR t.visibilidad = 'todos'
         OR t.id IN (SELECT tarea_id FROM tarea_asignado WHERE usuario_id = $1)
      GROUP BY t.id, p.nombre
      ORDER BY t.created_at DESC
      LIMIT 500`,
    [usuarioId, esAdmin],
  );
  return rows as TareaTablero[];
}

/**
 * Proyectos con el avance calculado desde sus tareas.
 *
 * El estándar exige que la barra de progreso salga de las tareas cerradas y no
 * de un número escrito a mano (§10): un porcentaje que alguien teclea deja de
 * ser cierto el mismo día. La columna `proyecto.progreso` se conserva como
 * respaldo para los proyectos que todavía no tienen tareas.
 */
export async function listarProyectosConAvance(): Promise<ProyectoConAvance[]> {
  const { rows } = await query(
    `SELECT p.id, p.nombre, p.descripcion, p.responsable, p.estado,
            to_char(p.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
            to_char(p.fecha_fin,    'YYYY-MM-DD') AS fecha_fin,
            p.progreso,
            COUNT(t.id)::int AS total_tareas,
            COUNT(t.id) FILTER (WHERE t.estado = 'completada')::int AS tareas_completadas
       FROM proyecto p
       LEFT JOIN tarea t ON t.proyecto_id = p.id AND t.estado <> 'cancelada'
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 200`,
  );
  return rows.map((r) => {
    const total = Number(r.total_tareas);
    const hechas = Number(r.tareas_completadas);
    return {
      ...(r as ProyectoConAvance),
      total_tareas: total,
      tareas_completadas: hechas,
      // Sin tareas todavía, cae al valor manual del proyecto.
      avance: total > 0 ? Math.round((hechas / total) * 100) : Number(r.progreso ?? 0),
    };
  });
}

/**
 * Personas a las que se puede asignar una tarea.
 *
 * Deliberadamente más ligera que `usuarios/listarUsuarios`, que exige
 * `usuarios.administrar`: para asignar una tarea basta con poder ver el módulo
 * de operaciones, y aquí solo se exponen id y nombre.
 */
export async function listarAsignables(): Promise<{ id: string; nombre: string }[]> {
  const { rows } = await query(
    `SELECT id, nombre FROM usuario WHERE activo = TRUE ORDER BY nombre LIMIT 300`,
  );
  return rows as { id: string; nombre: string }[];
}

/** Cifras de cabecera del portal administrativo — ClickUp S9 · #457. */
export async function resumenAdministrativo(): Promise<{
  proyectos_activos: number;
  tareas_abiertas: number;
  tareas_vencidas: number;
  estudiantes_activos: number;
}> {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM proyecto WHERE estado = 'en_curso')::int      AS proyectos_activos,
       (SELECT COUNT(*) FROM tarea
         WHERE estado IN ('pendiente','en_progreso'))::int                 AS tareas_abiertas,
       (SELECT COUNT(*) FROM tarea
         WHERE estado IN ('pendiente','en_progreso')
           AND fecha_limite < CURRENT_DATE)::int                           AS tareas_vencidas,
       (SELECT COUNT(*) FROM estudiante WHERE estado = 'activo')::int      AS estudiantes_activos`,
  );
  return rows[0] as {
    proyectos_activos: number;
    tareas_abiertas: number;
    tareas_vencidas: number;
    estudiantes_activos: number;
  };
}

/**
 * Tareas que piden atención ya: vencidas o urgentes, sin cerrar — ClickUp S9 · #459.
 * Ordenadas por lo que más apremia, no por fecha de creación.
 */
export async function tareasUrgentes(limite = 6): Promise<TareaTablero[]> {
  const { rows } = await query(
    `SELECT t.id, t.titulo, t.descripcion, t.proyecto_id, t.visibilidad,
            t.estado, t.prioridad,
            to_char(t.fecha_limite, 'YYYY-MM-DD') AS fecha_limite,
            p.nombre AS proyecto_nombre,
            COALESCE(
              json_agg(json_build_object('id', u.id, 'nombre', u.nombre) ORDER BY u.nombre)
                FILTER (WHERE u.id IS NOT NULL),
              '[]'
            ) AS asignados
       FROM tarea t
       LEFT JOIN proyecto p ON p.id = t.proyecto_id
       LEFT JOIN tarea_asignado ta ON ta.tarea_id = t.id
       LEFT JOIN usuario u ON u.id = ta.usuario_id
      WHERE t.estado IN ('pendiente','en_progreso')
        AND (t.fecha_limite < CURRENT_DATE OR t.prioridad IN ('alta','urgente'))
      GROUP BY t.id, p.nombre
      ORDER BY (t.fecha_limite < CURRENT_DATE) DESC,
               CASE t.prioridad WHEN 'urgente' THEN 0 WHEN 'alta' THEN 1 ELSE 2 END,
               t.fecha_limite NULLS LAST
      LIMIT $1`,
    [limite],
  );
  return rows as TareaTablero[];
}

// ---------------------------------------------------------------------------
// Calendario y agenda — ClickUp S9 · #452–455
// ---------------------------------------------------------------------------

/**
 * Eventos y tareas de un rango de fechas, normalizados a una sola lista.
 *
 * Dos decisiones que explican el SQL:
 *
 * 1. **Se excluyen los eventos con `tarea_id`.** Al crear una tarea con fecha
 *    límite, `crearTarea` genera un evento espejo para que aparezca en el
 *    calendario. Si aquí se leyeran las dos tablas sin filtrar, esa tarea se
 *    vería dos veces el mismo día. Gana la tarea: conserva su estado vivo
 *    (completada, vencida) y su prioridad, que el evento espejo no actualiza.
 * 2. **Las tareas respetan la visibilidad** igual que el tablero: una tarea
 *    `asignados` no se asoma en el calendario de quien no la tiene asignada.
 *
 * Las canceladas no se muestran: ocupan un día que en realidad está libre.
 */
async function entradasDeAgenda(
  desde: string,
  hasta: string,
  usuarioId: string,
  esAdmin: boolean,
): Promise<EntradaAgenda[]> {
  const { rows } = await query(
    `SELECT e.id::text                        AS id,
            'evento'                          AS origen,
            e.titulo,
            to_char(e.fecha, 'YYYY-MM-DD')    AS fecha,
            e.hora_inicio,
            e.tipo                            AS categoria,
            e.estado,
            e.ubicacion,
            NULL::text                        AS proyecto_nombre
       FROM evento e
      WHERE e.fecha BETWEEN $1::date AND $2::date
        AND e.tarea_id IS NULL
        AND e.estado <> 'cancelado'

      UNION ALL

     SELECT t.id::text                            AS id,
            'tarea'                               AS origen,
            t.titulo,
            to_char(t.fecha_limite, 'YYYY-MM-DD') AS fecha,
            NULL::text                            AS hora_inicio,
            t.prioridad                           AS categoria,
            t.estado,
            NULL::text                            AS ubicacion,
            p.nombre                              AS proyecto_nombre
       FROM tarea t
       LEFT JOIN proyecto p ON p.id = t.proyecto_id
      WHERE t.fecha_limite BETWEEN $1::date AND $2::date
        AND t.estado <> 'cancelada'
        AND ($4::boolean
             OR t.visibilidad = 'todos'
             OR t.id IN (SELECT tarea_id FROM tarea_asignado WHERE usuario_id = $3))

      ORDER BY fecha, hora_inicio NULLS FIRST, titulo
      LIMIT 500`,
    [desde, hasta, usuarioId, esAdmin],
  );
  return rows as EntradaAgenda[];
}

/** Primer y último día de un mes `YYYY-MM`, como texto `YYYY-MM-DD`. */
export function limitesDelMes(mes: string): { desde: string; hasta: string } {
  const [anio, m] = mes.split("-").map(Number);
  // Día 0 del mes siguiente = último día de este mes.
  const ultimo = new Date(anio, m, 0).getDate();
  return { desde: `${mes}-01`, hasta: `${mes}-${String(ultimo).padStart(2, "0")}` };
}

/** Todo lo que ocurre en un mes `YYYY-MM` — ClickUp S9 · #453. */
export async function calendarioDelMes(
  mes: string,
  usuarioId: string,
  esAdmin: boolean,
): Promise<EntradaAgenda[]> {
  const { desde, hasta } = limitesDelMes(mes);
  return entradasDeAgenda(desde, hasta, usuarioId, esAdmin);
}

/**
 * Agenda combinada de los próximos 30 días — ClickUp S9 · #455.
 *
 * Arranca hoy, no el lunes ni el día 1: la pregunta que responde es "qué me
 * viene encima", y eso incluye lo de esta tarde.
 */
export async function agenda30Dias(
  usuarioId: string,
  esAdmin: boolean,
  dias = 30,
): Promise<EntradaAgenda[]> {
  const hoy = new Date();
  const fin = new Date(hoy);
  fin.setDate(fin.getDate() + dias);
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
  return entradasDeAgenda(iso(hoy), iso(fin), usuarioId, esAdmin);
}

/** Registros de servicio comunitario de un mes (formato YYYY-MM). */
export async function serviciosDelMes(mes: string): Promise<RegistroServicio[]> {
  const { rows } = await query(
    `SELECT rs.id, rs.estudiante_id, rs.mes, rs.hizo_servicio, rs.asistio_reunion,
            rs.notas, e.nombre AS estudiante_nombre
       FROM registro_servicio rs
       JOIN estudiante e ON e.id = rs.estudiante_id
      WHERE rs.mes = $1
      ORDER BY e.nombre`,
    [mes],
  );
  return rows as RegistroServicio[];
}
