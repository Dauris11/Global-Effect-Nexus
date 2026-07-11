/**
 * Esquemas Zod del dominio Operaciones.
 */
import { z } from "zod";

export const CrearProyecto = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().trim().optional(),
  responsable: z.string().trim().optional(),
  estado: z
    .enum(["planificacion", "en_curso", "completado", "pausado"])
    .default("planificacion"),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  progreso: z.coerce.number().int().min(0).max(100).default(0),
});

export const CrearTarea = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().trim().optional(),
  proyecto_id: z.string().uuid().optional(),
  visibilidad: z.enum(["todos", "asignados"]).default("asignados"),
  prioridad: z.enum(["baja", "media", "alta", "urgente"]).default("media"),
  fecha_limite: z.string().optional(),
  asignados: z.array(z.string().uuid()).default([]),
});

export const CambiarEstadoTarea = z.object({
  id: z.string().uuid(),
  estado: z.enum(["pendiente", "en_progreso", "completada", "cancelada"]),
});

export const CrearEvento = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().trim().optional(),
  tipo: z
    .enum(["academico", "administrativo", "social", "reunion", "otro"])
    .default("otro"),
  fecha: z.string().min(1),
  hora_inicio: z.string().trim().optional(),
  hora_fin: z.string().trim().optional(),
  ubicacion: z.string().trim().optional(),
  responsable: z.string().trim().optional(),
});

export const UpsertRegistroServicio = z.object({
  estudiante_id: z.string().uuid(),
  mes: z.string().regex(/^\d{4}-\d{2}$/),
  hizo_servicio: z.coerce.boolean().default(false),
  asistio_reunion: z.coerce.boolean().default(false),
  notas: z.string().trim().optional(),
});

export type CrearTareaInput = z.infer<typeof CrearTarea>;
