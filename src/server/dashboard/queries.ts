/**
 * Agregaciones para el Dashboard principal (métricas en tiempo real).
 *
 * Están troceadas por dominio a propósito, y no en una sola consulta que lo
 * traiga todo: el panel se arma según los permisos del rol, así que un docente
 * no debe *consultar* el balance de la fundación, no solo no verlo. Una cifra
 * financiera que llega al servidor y se descarta en el render ya viajó.
 */
import { query } from "@/lib/db";

export interface DashboardMetricas {
  estudiantes_activos: number;
  becados: number;
  cursos_activos: number;
  tareas_pendientes: number;
}

/** Conteos institucionales (sin nada financiero). */
export async function metricasDashboard(): Promise<DashboardMetricas> {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM estudiante WHERE estado = 'activo')   AS estudiantes_activos,
       (SELECT COUNT(*) FROM estudiante WHERE tipo = 'becado')     AS becados,
       (SELECT COUNT(*) FROM curso WHERE estado = 'activo')        AS cursos_activos,
       (SELECT COUNT(*) FROM tarea WHERE estado <> 'completada')   AS tareas_pendientes`,
  );
  const r = rows[0];
  return {
    estudiantes_activos: Number(r.estudiantes_activos),
    becados: Number(r.becados),
    cursos_activos: Number(r.cursos_activos),
    tareas_pendientes: Number(r.tareas_pendientes),
  };
}

/** Balance del mes en curso (ingresos − egresos). Requiere `finanzas.leer`. */
export async function balanceDelMes(): Promise<number> {
  const { rows } = await query(
    `SELECT COALESCE(SUM(monto) FILTER (WHERE tipo = 'ingreso'), 0)
          - COALESCE(SUM(monto) FILTER (WHERE tipo = 'egreso'),  0) AS balance
       FROM transaccion
      WHERE date_trunc('month', fecha) = date_trunc('month', CURRENT_DATE)`,
  );
  return Number(rows[0]?.balance ?? 0);
}

export interface PuntoBalance {
  mes: string; // 'YYYY-MM'
  ingresos: number;
  egresos: number;
}

/** Serie de ingresos/egresos de los últimos `meses` meses (para la gráfica). */
export async function balanceMensual(meses = 6): Promise<PuntoBalance[]> {
  const { rows } = await query(
    `SELECT to_char(date_trunc('month', fecha), 'YYYY-MM') AS mes,
            COALESCE(SUM(monto) FILTER (WHERE tipo='ingreso'), 0) AS ingresos,
            COALESCE(SUM(monto) FILTER (WHERE tipo='egreso'), 0)  AS egresos
       FROM transaccion
      WHERE fecha >= date_trunc('month', CURRENT_DATE) - ($1::int - 1) * INTERVAL '1 month'
      GROUP BY 1
      ORDER BY 1`,
    [meses],
  );
  return rows.map((r) => ({
    mes: r.mes as string,
    ingresos: Number(r.ingresos),
    egresos: Number(r.egresos),
  }));
}

export interface EventoProximo {
  id: string;
  titulo: string;
  tipo: string;
  /** `YYYY-MM-DD`. */
  fecha: string;
}

/**
 * Próximos eventos (desde hoy). La fecha sale con `to_char`, no cruda: el
 * driver convertiría la DATE a un Date en la zona del servidor y un evento del
 * día 1 podría dibujarse como el último día del mes anterior.
 */
export async function proximosEventos(limite = 5): Promise<EventoProximo[]> {
  const { rows } = await query(
    `SELECT id, titulo, tipo, to_char(fecha, 'YYYY-MM-DD') AS fecha
       FROM evento
      WHERE fecha >= CURRENT_DATE
      ORDER BY fecha
      LIMIT $1`,
    [limite],
  );
  return rows as EventoProximo[];
}

export interface TareaPrioritaria {
  id: string;
  titulo: string;
  prioridad: string;
  estado: string;
  /** `YYYY-MM-DD` o `null`. */
  fecha_limite: string | null;
  /** `true` si la fecha límite ya pasó. Lo decide la BD, no el navegador. */
  vencida: boolean;
  /** `true` si vence hoy. */
  vence_hoy: boolean;
}

/**
 * Tareas prioritarias no completadas.
 *
 * `vencida` y `vence_hoy` se calculan en SQL contra `CURRENT_DATE` y no en el
 * cliente: comparar fechas en el navegador usa la zona del visitante, así que la
 * misma tarea aparecería vencida o no según dónde esté quien mira.
 */
export async function tareasPrioritarias(limite = 5): Promise<TareaPrioritaria[]> {
  const { rows } = await query(
    `SELECT id, titulo, prioridad, estado,
            to_char(fecha_limite, 'YYYY-MM-DD') AS fecha_limite,
            (fecha_limite IS NOT NULL AND fecha_limite <  CURRENT_DATE) AS vencida,
            (fecha_limite IS NOT NULL AND fecha_limite =  CURRENT_DATE) AS vence_hoy
       FROM tarea
      WHERE estado <> 'completada'
      ORDER BY CASE prioridad
                 WHEN 'urgente' THEN 0 WHEN 'alta' THEN 1
                 WHEN 'media' THEN 2 ELSE 3 END,
               fecha_limite NULLS LAST
      LIMIT $1`,
    [limite],
  );
  return rows as TareaPrioritaria[];
}
