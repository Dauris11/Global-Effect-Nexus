/**
 * Tipos del dominio Finanzas: transacciones (ingresos/egresos) y balance.
 */

export type TipoTransaccion = "ingreso" | "egreso";

export interface Transaccion {
  id: string;
  concepto: string;
  tipo: TipoTransaccion;
  monto: number;
  categoria: string;
  fecha: string;
  referencia: string | null;
  notas: string | null;
}

export interface Balance {
  ingresos: number;
  egresos: number;
  balance: number;
  total: number;
}
