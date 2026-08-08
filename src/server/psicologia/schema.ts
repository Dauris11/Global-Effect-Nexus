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

/**
 * Solicitud de cita por el estudiante (portal estudiantil).
 *
 * NO lleva `estudiante_id`: el expediente se resuelve desde la sesión en la
 * Server Action. Cuando lo llevaba, cualquier usuario autenticado podía
 * agendarle una cita a otro joven cambiando el id en el formulario.
 */
export const SolicitarCita = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  hora: z.string().trim().optional(),
  motivo: z.string().trim().max(1000).optional(),
});

/**
 * Cambio de estado de una cita.
 *
 * Solo estos dos destinos: una cita se cierra o se cancela. Volver a
 * `programada` no está contemplado —sería reabrir algo ya resuelto— y por eso
 * el enum no lo admite en vez de dejarlo a criterio de quien llame.
 */
export const CambiarEstadoCita = z.object({
  id: z.string().uuid(),
  estado: z.enum(["completada", "cancelada"]),
});

/** Asignación del psicólogo de cabecera (migración 0021). */
export const AsignarPsicologo = z.object({
  estudiante_id: z.string().uuid(),
  /** `null` desasigna. */
  psicologo_id: z.string().uuid().nullable(),
});

export type CrearCitaInput = z.infer<typeof CrearCita>;
export type CrearNotaInput = z.infer<typeof CrearNota>;
export type SolicitarCitaInput = z.infer<typeof SolicitarCita>;
export type AsignarPsicologoInput = z.infer<typeof AsignarPsicologo>;
export type CambiarEstadoCitaInput = z.infer<typeof CambiarEstadoCita>;
