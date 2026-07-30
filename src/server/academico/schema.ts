/**
 * Esquemas Zod del dominio Académico (validación en Server Actions).
 */
import { z } from "zod";

export const CrearPeriodo = z
  .object({
    nombre: z.string().min(1),
    fecha_inicio: z.string().min(1),
    fecha_fin: z.string().min(1),
    estado: z.enum(["planificado", "activo", "completado"]).default("planificado"),
  })
  .refine((d) => d.fecha_fin >= d.fecha_inicio, {
    message: "La fecha de fin no puede ser anterior al inicio",
    path: ["fecha_fin"],
  });

export const CrearMateria = z.object({
  nombre: z.string().min(1),
  codigo: z.string().trim().optional(),
  descripcion: z.string().trim().optional(),
  periodo_id: z.string().uuid().optional(),
  creditos: z.coerce.number().int().min(0).default(3),
  profesor_nombre: z.string().trim().optional(),
  /** Enlace al usuario del sistema; se omite si el profesor es externo (0019). */
  profesor_usuario_id: z.string().uuid().optional(),
  estado: z.enum(["activa", "inactiva"]).default("activa"),
  horario: z.string().trim().optional(),
  aula: z.string().trim().optional(),
});

export const CrearCurso = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().trim().optional(),
  docente: z.string().trim().optional(),
  /** Enlace al usuario del sistema; se omite si el docente es externo (0019). */
  docente_usuario_id: z.string().uuid().optional(),
  periodo_id: z.string().uuid().optional(),
  estado: z.enum(["activo", "finalizado", "planificado"]).default("activo"),
  capacidad: z.coerce.number().int().min(0).default(30),
  horario: z.string().trim().optional(),
  modalidad: z.enum(["presencial", "virtual", "mixto"]).default("presencial"),
});

export const CrearInscripcion = z.object({
  estudiante_id: z.string().uuid(),
  materia_id: z.string().uuid(),
  periodo_id: z.string().uuid(),
});

export const RegistrarCalificacion = z.object({
  estudiante_id: z.string().uuid(),
  curso_id: z.string().uuid(),
  periodo_id: z.string().uuid(),
  nota: z.coerce.number().min(0).max(100),
  tipo_evaluacion: z
    .enum(["examen", "tarea", "proyecto", "participacion", "final"])
    .default("examen"),
  observaciones: z.string().trim().optional(),
});

/**
 * Actualizaciones: los mismos campos del alta más el `id`.
 *
 * Se derivan con `.extend({ id })` en vez de escribirse aparte para que un
 * campo nuevo en el alta no se quede fuera de la edición sin que nadie lo note
 * — el fallo clásico de mantener dos esquemas paralelos a mano.
 *
 * `CrearPeriodo` lleva un `.refine` (fin >= inicio) y por eso es un ZodEffects,
 * que no tiene `.extend`. Se recompone con `.and()`: la intersección conserva
 * la validación cruzada de fechas y le añade el id.
 */
const ConId = z.object({ id: z.string().uuid() });

export const ActualizarPeriodo = CrearPeriodo.and(ConId);
export const ActualizarMateria = CrearMateria.extend(ConId.shape);
export const ActualizarCurso = CrearCurso.extend(ConId.shape);

/** Borrado: solo hace falta el id. */
export const EliminarPorId = ConId;

export type ActualizarPeriodoInput = z.infer<typeof ActualizarPeriodo>;
export type ActualizarMateriaInput = z.infer<typeof ActualizarMateria>;
export type ActualizarCursoInput = z.infer<typeof ActualizarCurso>;

export type CrearPeriodoInput = z.infer<typeof CrearPeriodo>;
export type CrearMateriaInput = z.infer<typeof CrearMateria>;
export type CrearCursoInput = z.infer<typeof CrearCurso>;
export type CrearInscripcionInput = z.infer<typeof CrearInscripcion>;
export type RegistrarCalificacionInput = z.infer<typeof RegistrarCalificacion>;
