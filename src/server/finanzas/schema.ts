/**
 * Esquemas Zod del dominio Finanzas.
 */
import { z } from "zod";

export const RegistrarTransaccion = z.object({
  concepto: z.string().min(1),
  tipo: z.enum(["ingreso", "egreso"]),
  monto: z.coerce.number().positive(),
  categoria: z
    .enum([
      "beca",
      "donacion",
      "operativo",
      "salario",
      "material",
      "evento",
      "otro",
    ])
    .default("otro"),
  fecha: z.string().optional(),
  referencia: z.string().trim().optional(),
  notas: z.string().trim().optional(),
});

export type RegistrarTransaccionInput = z.infer<typeof RegistrarTransaccion>;
