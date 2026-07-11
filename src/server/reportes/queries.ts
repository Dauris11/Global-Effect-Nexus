/**
 * Agregaciones de solo lectura para los reportes visuales (Recharts).
 * Tres secciones: Proyectos, Académico y Contabilidad. Cada función exige el
 * permiso de lectura del dominio correspondiente.
 */
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";

/** Proyectos: KPIs y distribución por estado. */
export async function reporteProyectos() {
  await requirePermission("operaciones.leer");
  const { rows: kpis } = await query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE estado = 'en_curso')::int AS en_curso,
            COUNT(*) FILTER (WHERE estado = 'completado')::int AS completados,
            COALESCE(ROUND(AVG(progreso))::int, 0) AS avance_promedio
       FROM proyecto`,
  );
  const { rows: porEstado } = await query(
    `SELECT estado, COUNT(*)::int AS n FROM proyecto GROUP BY estado ORDER BY estado`,
  );
  return { kpis: kpis[0], porEstado };
}

/** Académico: KPIs y distribución de calificaciones por rango. */
export async function reporteAcademico() {
  await requirePermission("academico.leer");
  const { rows: kpis } = await query(
    `SELECT COUNT(*)::int AS total,
            COALESCE(ROUND(AVG(nota), 2), 0)::float AS promedio,
            COUNT(*) FILTER (WHERE nota >= 70)::int AS aprobados,
            COUNT(*) FILTER (WHERE nota < 70)::int  AS reprobados
       FROM calificacion`,
  );
  const { rows: rangos } = await query(
    `SELECT CASE
              WHEN nota >= 90 THEN '90-100'
              WHEN nota >= 80 THEN '80-89'
              WHEN nota >= 70 THEN '70-79'
              WHEN nota >= 60 THEN '60-69'
              ELSE '<60'
            END AS rango,
            COUNT(*)::int AS n
       FROM calificacion
      GROUP BY 1 ORDER BY 1 DESC`,
  );
  return { kpis: kpis[0], rangos };
}

/** Contabilidad: KPIs, evolución mensual y egresos por categoría. */
export async function reporteContabilidad() {
  await requirePermission("finanzas.leer");
  const { rows: kpis } = await query(
    `SELECT COALESCE(SUM(monto) FILTER (WHERE tipo='ingreso'),0)::float AS ingresos,
            COALESCE(SUM(monto) FILTER (WHERE tipo='egreso'),0)::float  AS egresos,
            COUNT(*)::int AS total
       FROM transaccion`,
  );
  const { rows: porCategoria } = await query(
    `SELECT categoria, COALESCE(SUM(monto),0)::float AS total
       FROM transaccion WHERE tipo = 'egreso'
      GROUP BY categoria ORDER BY total DESC`,
  );
  const k = kpis[0];
  return {
    kpis: { ...k, balance: k.ingresos - k.egresos },
    egresosPorCategoria: porCategoria,
  };
}
