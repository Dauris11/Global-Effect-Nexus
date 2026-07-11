/**
 * Server Actions del dominio Landing. Todas exigen `landing.administrar`
 * (super_admin / admin). Permiten al administrador configurar la publicidad
 * del hero de la página de inicio.
 */
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import { GuardarSlide } from "./schema";

/** Crea o actualiza una diapositiva del hero. */
export async function guardarSlide(input: unknown): Promise<string> {
  await requirePermission("landing.administrar");
  const d = GuardarSlide.parse(input);

  if (d.id) {
    await query(
      `UPDATE landing_slide
          SET titulo=$2, subtitulo=$3, texto=$4, imagen_url=$5,
              cta_texto=$6, cta_enlace=$7, orden=$8, activo=$9
        WHERE id=$1`,
      [
        d.id,
        d.titulo,
        d.subtitulo || null,
        d.texto || null,
        d.imagen_url || null,
        d.cta_texto || null,
        d.cta_enlace || null,
        d.orden,
        d.activo,
      ],
    );
    revalidatePath("/", "layout");
    return d.id;
  }

  const { rows } = await query(
    `INSERT INTO landing_slide (titulo, subtitulo, texto, imagen_url, cta_texto, cta_enlace, orden, activo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [
      d.titulo,
      d.subtitulo || null,
      d.texto || null,
      d.imagen_url || null,
      d.cta_texto || null,
      d.cta_enlace || null,
      d.orden,
      d.activo,
    ],
  );
  revalidatePath("/", "layout");
  return rows[0].id as string;
}

export interface GuardarSlideState {
  ok?: boolean;
  error?: string;
}

/** Adaptador para `useActionState`: guarda una diapositiva desde formulario. */
export async function guardarSlideForm(
  _prev: GuardarSlideState,
  formData: FormData,
): Promise<GuardarSlideState> {
  try {
    const idRaw = String(formData.get("id") ?? "");
    await guardarSlide({
      id: idRaw || undefined,
      titulo: formData.get("titulo"),
      subtitulo: formData.get("subtitulo"),
      texto: formData.get("texto"),
      imagen_url: formData.get("imagen_url"),
      cta_texto: formData.get("cta_texto"),
      cta_enlace: formData.get("cta_enlace"),
      orden: formData.get("orden") ?? 0,
      activo: formData.get("activo") === "on" || formData.get("activo") === "true",
    });
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

const SoloId = z.object({ id: z.string().uuid() });

/** Elimina una diapositiva. */
export async function eliminarSlide(input: unknown): Promise<void> {
  await requirePermission("landing.administrar");
  const { id } = SoloId.parse(input);
  await query(`DELETE FROM landing_slide WHERE id = $1`, [id]);
  revalidatePath("/", "layout");
}

const CambiarVisibilidad = z.object({
  id: z.string().uuid(),
  activo: z.coerce.boolean(),
});

/** Activa o desactiva una diapositiva sin borrarla. */
export async function cambiarVisibilidadSlide(input: unknown): Promise<void> {
  await requirePermission("landing.administrar");
  const d = CambiarVisibilidad.parse(input);
  await query(`UPDATE landing_slide SET activo = $2 WHERE id = $1`, [d.id, d.activo]);
  revalidatePath("/", "layout");
}
