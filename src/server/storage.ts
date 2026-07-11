/**
 * Almacenamiento de archivos — Supabase Storage + tabla `documento`.
 *
 * Sube el archivo al bucket y registra sus metadatos en `documento` (una FK
 * en vez de URLs sueltas). Devuelve el id del documento para enlazarlo desde
 * la entidad correspondiente (p. ej. `estudiante.expediente_id`).
 */
import { createClient } from "@/lib/supabase/server";
import { query } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "documentos";

/** Sube un archivo y registra su metadato en `documento`. */
export async function subirDocumento(
  file: File,
  opts: { tipo?: string } = {},
): Promise<{ id: string; storageKey: string }> {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const supabase = await createClient();
  const ext = file.name.includes(".") ? "." + file.name.split(".").pop() : "";
  const storageKey = `${opts.tipo ?? "general"}/${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storageKey, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw new Error(`Error al subir el archivo: ${error.message}`);

  const { rows } = await query(
    `INSERT INTO documento (nombre, storage_key, tipo, mime, tamano_bytes, subido_por_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [file.name, storageKey, opts.tipo ?? null, file.type || null, file.size, user.id],
  );
  return { id: rows[0].id as string, storageKey };
}

/** Genera una URL firmada temporal para descargar un documento privado. */
export async function urlFirmada(storageKey: string, expiraEn = 3600): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storageKey, expiraEn);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
