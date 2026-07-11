/**
 * Esquemas Zod del dominio Psicología.
 */
import { z } from "zod";

export const CrearCita = z.object({
  estudiante_id: z.string().uuid(),
  tipo_registro: z.enum(["cita", "seguimiento", "evaluacion"]).default("cita"),
  fecha: z.string().min(1),
  hora: z.string().trim().optional(),
  nivel_confidencialidad: z.enum(["alto", "medio", "bajo"]).default("medio"),
  riesgos: z.string().trim().optional(),
});

export const CrearNota = z.object({
  estudiante_id: z.string().uuid(),
  cita_id: z.string().uuid().optional(),
  contenido: z.string().min(1),
});

/** Solicitud de cita por el estudiante (portal público/estudiantil). */
export const SolicitarCita = z.object({
  estudiante_id: z.string().uuid(),
  fecha: z.string().min(1),
  hora: z.string().trim().optional(),
});

export type CrearCitaInput = z.infer<typeof CrearCita>;
export type CrearNotaInput = z.infer<typeof CrearNota>;
export type SolicitarCitaInput = z.infer<typeof SolicitarCita>;
