/**
 * Esquemas de validación (Zod) del dominio Estudiantes. Se validan en la
 * frontera (Server Actions) antes de tocar la BD.
 */
import { z } from "zod";

export const CrearEstudiante = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  cedula: z.string().trim().optional(),
  email: z.string().email().optional().or(z.literal("")),
  telefono: z.string().trim().optional(),
  tipo: z.enum(["becado", "regular"]).default("regular"),
  programa: z.string().trim().optional(),
});

export type CrearEstudianteInput = z.infer<typeof CrearEstudiante>;
