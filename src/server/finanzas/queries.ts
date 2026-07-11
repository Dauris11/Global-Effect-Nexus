/**
 * Consultas de lectura del dominio Finanzas.
 */
import { query } from "@/lib/db";
import type { Transaccion, Balance } from "./types";

export async function listarTransacciones(tipo?: string): Promise<Transaccion[]> {
  const params: unknown[] = [];
  let where = "";
  if (tipo && tipo !== "todos") {
    params.push(tipo);
    where = `WHERE tipo = $1`;
  }
  const { rows } = await query(
    `SELECT id, concepto, tipo, monto, categoria, fecha, referencia, notas
       FROM transaccion ${where} ORDER BY fecha DESC, created_at DESC LIMIT 500`,
    params,
  );
  return rows as Transaccion[];
}

export async function balance(): Promise<Balance> {
  const { rows } = await query(
    `SELECT COALESCE(SUM(monto) FILTER (WHERE tipo = 'ingreso'), 0)::float AS ingresos,
            COALESCE(SUM(monto) FILTER (WHERE tipo = 'egreso'), 0)::float AS egresos,
            COUNT(*)::int AS total
       FROM transaccion`,
  );
  const r = rows[0];
  return {
    ingresos: r.ingresos,
    egresos: r.egresos,
    balance: r.ingresos - r.egresos,
    total: r.total,
  };
}

/** Evolución mensual de ingresos/egresos de los últimos N meses (reportes). */
export async function evolucionMensual(meses = 6) {
  const { rows } = await query(
    `SELECT to_char(date_trunc('month', fecha), 'YYYY-MM') AS mes,
            COALESCE(SUM(monto) FILTER (WHERE tipo = 'ingreso'), 0)::float AS ingresos,
            COALESCE(SUM(monto) FILTER (WHERE tipo = 'egreso'), 0)::float AS egresos
       FROM transaccion
      WHERE fecha >= (date_trunc('month', CURRENT_DATE) - ($1::int - 1) * INTERVAL '1 month')
      GROUP BY 1 ORDER BY 1`,
    [meses],
  );
  return rows as { mes: string; ingresos: number; egresos: number }[];
}
