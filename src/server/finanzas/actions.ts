/**
 * Server Actions del dominio Finanzas. Requieren `finanzas.escribir`.
 */
"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import { RegistrarTransaccion } from "./schema";

export async function registrarTransaccion(input: unknown): Promise<string> {
  await requirePermission("finanzas.escribir");
  const d = RegistrarTransaccion.parse(input);
  const { rows } = await query(
    `INSERT INTO transaccion (concepto, tipo, monto, categoria, fecha, referencia, notas)
     VALUES ($1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE), $6, $7) RETURNING id`,
    [
      d.concepto,
      d.tipo,
      d.monto,
      d.categoria,
      d.fecha || null,
      d.referencia || null,
      d.notas || null,
    ],
  );
  revalidatePath("/contabilidad");
  return rows[0].id as string;
}
