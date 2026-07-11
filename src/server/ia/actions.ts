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
import { chatAnthropic, type MensajeIA } from "@/lib/anthropic";
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
