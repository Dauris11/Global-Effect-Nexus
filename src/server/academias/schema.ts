/**
 * Esquemas Zod del dominio Academias.
 */
import { z } from "zod";

export const CrearAcademia = z.object({
  nombre: z.string().min(1),
  tipo: z.enum(["liderazgo", "habilidades", "otro"]).default("liderazgo"),
  descripcion: z.string().trim().optional(),
  facilitador: z.string().trim().optional(),
  estado: z.enum(["activa", "inactiva", "planificada"]).default("activa"),
  participantes: z.coerce.number().int().min(0).default(0),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
});

export const CrearMaterial = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().trim().optional(),
  academia_id: z.string().uuid(),
  tipo: z
    .enum(["documento", "video", "presentacion", "enlace", "otro"])
    .default("documento"),
  documento_id: z.string().uuid().optional(),
  enlace_url: z.string().url().optional().or(z.literal("")),
  autor: z.string().trim().optional(),
});

export type CrearAcademiaInput = z.infer<typeof CrearAcademia>;
export type CrearMaterialInput = z.infer<typeof CrearMaterial>;
