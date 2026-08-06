/**
 * Esquemas Zod del dominio Landing (validación del CRUD del hero).
 */
import { z } from "zod";

export const GuardarSlide = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().min(1),
  subtitulo: z.string().trim().optional(),
  texto: z.string().trim().optional(),
  imagen_url: z.string().trim().optional(),
  cta_texto: z.string().trim().optional(),
  cta_enlace: z.string().trim().optional(),
  orden: z.coerce.number().int().min(0).default(0),
  activo: z.coerce.boolean().default(true),
});

export type GuardarSlideInput = z.infer<typeof GuardarSlide>;

/**
 * Noticia del blog público.
 *
 * `fecha` es la que se muestra y ordena, no la de creación: una nota sobre
 * algo de marzo puede redactarse en agosto.
 */
export const GuardarNoticia = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().trim().min(1),
  resumen: z.string().trim().optional(),
  contenido: z.string().trim().optional(),
  imagen_url: z.string().trim().optional(),
  fecha: z.string().min(1),
  autor: z.string().trim().optional(),
  publicada: z.coerce.boolean().default(false),
});
