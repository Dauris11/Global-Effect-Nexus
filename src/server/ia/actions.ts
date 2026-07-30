/**
 * Server Actions del dominio IA. Requieren `ia.usar`.
 *
 * `enviarMensaje` persiste el turno del usuario, arma el contexto (conteos de
 * la BD para el chat interno), llama a Anthropic, guarda la respuesta y la
 * devuelve. `registrarOcr` deja la traza de una extracción OCR (el
 * procesamiento real se ejecuta aparte y actualiza el estado).
 */
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import {
  chatAnthropic,
  ocrExpediente,
  type CamposExpedienteOcr,
  type MensajeIA,
} from "@/lib/anthropic";
import { subirDocumento } from "@/server/storage";
import { contextoInstitucional, mensajesDeConversacion } from "./queries";

const EnviarMensaje = z.object({
  conversacion_id: z.string().uuid().optional(),
  ambito: z.enum(["interno", "estudiantil"]).default("interno"),
  contenido: z.string().min(1),
});

export async function enviarMensaje(input: unknown): Promise<{ conversacionId: string; respuesta: string }> {
  const user = await requirePermission("ia.usar");
  const d = EnviarMensaje.parse(input);

  // 1. Conversación (crea una si no se pasó).
  let conversacionId = d.conversacion_id ?? null;
  if (!conversacionId) {
    const { rows } = await query(
      `INSERT INTO conversacion_ia (usuario_id, ambito, titulo)
       VALUES ($1, $2, $3) RETURNING id`,
      [user.id, d.ambito, d.contenido.slice(0, 60)],
    );
    conversacionId = rows[0].id as string;
  }

  // 2. Persiste el turno del usuario.
  await query(
    `INSERT INTO mensaje_ia (conversacion_id, rol, contenido) VALUES ($1, 'user', $2)`,
    [conversacionId, d.contenido],
  );

  // 3. Historial + contexto → modelo.
  const historial = await mensajesDeConversacion(conversacionId);
  const mensajes: MensajeIA[] = historial
    .filter((m) => m.rol === "user" || m.rol === "assistant")
    .map((m) => ({ role: m.rol as "user" | "assistant", content: m.contenido }));

  const system =
    d.ambito === "interno"
      ? `Eres el asistente interno de la Fundación Global Effect. Responde en español, claro y conciso. Contexto actual: ${await contextoInstitucional()}`
      : `Eres un asistente académico para estudiantes de la Fundación Global Effect. Responde en español, con tono amable y educativo.`;

  let respuesta: string;
  try {
    respuesta = await chatAnthropic(mensajes, { system });
  } catch (e) {
    respuesta = `No se pudo obtener respuesta de la IA: ${(e as Error).message}`;
  }

  // 4. Persiste la respuesta.
  await query(
    `INSERT INTO mensaje_ia (conversacion_id, rol, contenido) VALUES ($1, 'assistant', $2)`,
    [conversacionId, respuesta],
  );
  await query(`UPDATE conversacion_ia SET updated_at = now() WHERE id = $1`, [conversacionId]);

  revalidatePath("/chat-ia");
  return { conversacionId, respuesta };
}

const RegistrarOcr = z.object({
  documento_id: z.string().uuid(),
  estudiante_id: z.string().uuid().optional(),
});

/** Crea la traza de una extracción OCR (estado inicial 'pendiente'). */
export async function registrarOcr(input: unknown): Promise<string> {
  const user = await requirePermission("ia.usar");
  const d = RegistrarOcr.parse(input);
  const { rows } = await query(
    `INSERT INTO extraccion_ocr (documento_id, estudiante_id, estado, creado_por_id)
     VALUES ($1, $2, 'pendiente', $3) RETURNING id`,
    [d.documento_id, d.estudiante_id || null, user.id],
  );
  return rows[0].id as string;
}

/** Tope de tamaño del archivo a extraer. */
const MAX_BYTES = 10 * 1024 * 1024;

const MIMES_OCR = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

/**
 * Sube un documento del expediente y le pasa el OCR — ClickUp S5 · #209.
 *
 * El flujo completo en una sola acción, porque los tres pasos solo tienen
 * sentido juntos:
 *   1. Sube el archivo a Storage y lo registra en `documento`.
 *   2. Abre la traza en `extraccion_ocr` como 'procesando'.
 *   3. Llama al modelo y cierra la traza como 'completado' o 'error'.
 *
 * El paso 2 existe para que un fallo del modelo quede **escrito**. Si la traza
 * se creara al final, un error de la IA no dejaría rastro: el documento estaría
 * subido y nadie sabría que su extracción se cayó.
 *
 * La IA propone, la persona confirma: esto NO escribe en el expediente. Los
 * campos quedan en `datos_extraidos` para que alguien los revise antes.
 */
export async function procesarOcr(formData: FormData): Promise<{
  extraccionId: string;
  confianza: number;
  campos: CamposExpedienteOcr;
}> {
  // Dos permisos, a propósito: usar la IA y poder escribir en el expediente al
  // que se adjunta el documento.
  await requirePermission("expedientes.escribir");
  const user = await requirePermission("ia.usar");

  const archivo = formData.get("archivo");
  const estudianteId = formData.get("estudiante_id");

  if (!(archivo instanceof File) || archivo.size === 0) {
    throw new Error("No se recibió ningún archivo");
  }
  if (archivo.size > MAX_BYTES) {
    throw new Error("El archivo pasa de 10 MB");
  }
  if (!MIMES_OCR.includes(archivo.type)) {
    throw new Error(`Formato no admitido: ${archivo.type || "desconocido"}`);
  }
  if (typeof estudianteId !== "string" || !estudianteId) {
    throw new Error("Falta el expediente de destino");
  }

  // 1. Archivo en Storage + fila en `documento`.
  const { id: documentoId } = await subirDocumento(archivo, {
    tipo: "expediente_escaneado",
  });

  // 2. Traza abierta antes de llamar al modelo.
  const { rows } = await query(
    `INSERT INTO extraccion_ocr (documento_id, estudiante_id, estado, modelo, creado_por_id)
     VALUES ($1, $2, 'procesando', $3, $4) RETURNING id`,
    [documentoId, estudianteId, process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5", user.id],
  );
  const extraccionId = rows[0].id as string;

  try {
    // 3. Extracción. El base64 va sin saltos de línea (Buffer no los mete).
    const base64 = Buffer.from(await archivo.arrayBuffer()).toString("base64");
    const { campos, confianza } = await ocrExpediente(base64, archivo.type);

    await query(
      `UPDATE extraccion_ocr
          SET estado = 'completado', confianza = $2, datos_extraidos = $3, mensaje_error = NULL
        WHERE id = $1`,
      [extraccionId, confianza, JSON.stringify(campos)],
    );

    revalidatePath(`/expedientes/${estudianteId}`);
    return { extraccionId, confianza, campos };
  } catch (e) {
    const mensaje = (e as Error).message.slice(0, 500);
    await query(
      `UPDATE extraccion_ocr SET estado = 'error', mensaje_error = $2 WHERE id = $1`,
      [extraccionId, mensaje],
    ).catch(() => {});
    revalidatePath(`/expedientes/${estudianteId}`);
    throw new Error(mensaje);
  }
}
