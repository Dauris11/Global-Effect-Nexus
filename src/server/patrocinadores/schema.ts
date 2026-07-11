/**
 * Esquemas Zod del dominio Patrocinio.
 */
import { z } from "zod";

export const CrearPatrocinador = z.object({
  nombre: z.string().min(1),
  tipo: z.enum(["empresa", "persona", "iglesia", "ong", "otro"]).default("persona"),
  email: z.string().email().optional().or(z.literal("")),
  telefono: z.string().trim().optional(),
  pais: z.string().trim().optional(),
  estado: z.enum(["activo", "inactivo"]).default("activo"),
  monto_mensual: z.coerce.number().min(0).default(0),
  notas: z.string().trim().optional(),
});

export const AsignarBeca = z.object({
  estudiante_id: z.string().uuid(),
  patrocinador_id: z.string().uuid(),
  monto: z.coerce.number().min(0),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
});

export type CrearPatrocinadorInput = z.infer<typeof CrearPatrocinador>;
export type AsignarBecaInput = z.infer<typeof AsignarBeca>;
