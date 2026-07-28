/**
 * Cliente mínimo de Anthropic (Messages API) vía fetch — sin SDK, solo
 * servidor. Se usa para el chat con contexto de la BD, la traducción IA y el
 * OCR de expedientes. El modelo es configurable con ANTHROPIC_MODEL.
 *
 * Best-effort: si falta la API key, lanza un error claro para que la acción
 * lo maneje. Ajusta el modelo al catálogo vigente de Anthropic.
 */
const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

export interface MensajeIA {
  role: "user" | "assistant";
  content: string;
}

/** Envía una conversación al modelo y devuelve el texto de la respuesta. */
export async function chatAnthropic(
  mensajes: MensajeIA[],
  opts: { system?: string; maxTokens?: number } = {},
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY ausente");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 1024,
      system: opts.system,
      messages: mensajes,
    }),
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new Error(`Anthropic ${res.status}: ${detalle.slice(0, 200)}`);
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  return (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("\n")
    .trim();
}

/**
 * Traduce un texto al idioma destino con IA.
 *
 * Los idiomas de la interfaz son es/en, pero esta función acepta cualquiera:
 * se usa para traducir contenido puntual (una carta a un patrocinador, un
 * documento recibido), no para generar los diccionarios de `messages/`.
 */
export async function traducir(texto: string, idiomaDestino: string): Promise<string> {
  const nombres: Record<string, string> = {
    es: "español",
    en: "inglés",
  };
  return chatAnthropic([{ role: "user", content: texto }], {
    system: `Traduce el siguiente texto al ${
      nombres[idiomaDestino] ?? idiomaDestino
    }. Devuelve solo la traducción, sin comentarios.`,
    maxTokens: 2048,
  });
}
