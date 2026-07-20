/**
 * Agregaciones para el Dashboard principal (métricas en tiempo real).
 * Se consume desde el área autenticada; la protección de sesión la aplica el
 * layout del portal / proxy.
 */
import { query } from "@/lib/db";

export interface DashboardMetricas {
  estudiantes_activos: number;
  becados: number;
  cursos_activos: number;
  tareas_pendientes: number;
  balance_mes: number;
}

export async function metricasDashboard(): Promise<DashboardMetricas> {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM estudiante WHERE estado = 'activo')   AS estudiantes_activos,
       (SELECT COUNT(*) FROM estudiante WHERE tipo = 'becado')     AS becados,
       (SELECT COUNT(*) FROM curso WHERE estado = 'activo')        AS cursos_activos,
       (SELECT COUNT(*) FROM tarea WHERE estado <> 'completada')   AS tareas_pendientes,
       (SELECT COALESCE(SUM(monto) FILTER (WHERE tipo='ingreso'),0)
             - COALESCE(SUM(monto) FILTER (WHERE tipo='egreso'),0)
          FROM transaccion
         WHERE date_trunc('month', fecha) = date_trunc('month', CURRENT_DATE)) AS balance_mes`,
  );
  const r = rows[0];
  return {
    estudiantes_activos: Number(r.estudiantes_activos),
    becados: Number(r.becados),
    cursos_activos: Number(r.cursos_activos),
    tareas_pendientes: Number(r.tareas_pendientes),
    balance_mes: Number(r.balance_mes),
  };
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

/** Próximos eventos (desde hoy). */
export async function proximosEventos(limite = 5) {
  const { rows } = await query(
    `SELECT id, titulo, tipo, fecha FROM evento
      WHERE fecha >= CURRENT_DATE ORDER BY fecha LIMIT $1`,
    [limite],
  );
  return rows as { id: string; titulo: string; tipo: string; fecha: string }[];
}

/** Tareas prioritarias no completadas. */
export async function tareasPrioritarias(limite = 5) {
  const { rows } = await query(
    `SELECT id, titulo, prioridad, estado, fecha_limite FROM tarea
      WHERE estado <> 'completada'
      ORDER BY CASE prioridad
                 WHEN 'urgente' THEN 0 WHEN 'alta' THEN 1
                 WHEN 'media' THEN 2 ELSE 3 END,
               fecha_limite NULLS LAST
      LIMIT $1`,
    [limite],
  );
  return rows as {
    id: string;
    titulo: string;
    prioridad: string;
    estado: string;
    fecha_limite: string | null;
  }[];
}
