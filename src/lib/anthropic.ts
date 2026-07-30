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
const VERSION = "2023-06-01";

/** Cabeceras comunes de la API. Lanza si falta la clave. */
function cabeceras(): Record<string, string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY ausente");
  return {
    "content-type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": VERSION,
  };
}

export interface MensajeIA {
  role: "user" | "assistant";
  content: string;
}

/** Envía una conversación al modelo y devuelve el texto de la respuesta. */
export async function chatAnthropic(
  mensajes: MensajeIA[],
  opts: { system?: string; maxTokens?: number } = {},
): Promise<string> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: cabeceras(),
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

// ---------------------------------------------------------------------------
// OCR de expedientes (visión + salida estructurada)
// ---------------------------------------------------------------------------

/** Formatos que la API acepta como imagen. El PDF va por otra vía. */
const IMAGENES_ACEPTADAS = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;

/** Campos que el OCR intenta sacar de una ficha o un documento de identidad. */
export interface CamposExpedienteOcr {
  nombre: string | null;
  cedula: string | null;
  fecha_nacimiento: string | null;
  lugar_nacimiento: string | null;
  nacionalidad: string | null;
  genero: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  comunidad: string | null;
  centro_educativo: string | null;
  programa: string | null;
  nombre_padre: string | null;
  nombre_madre: string | null;
  telefono_emergencia: string | null;
  observaciones: string | null;
}

export interface ResultadoOcr {
  campos: CamposExpedienteOcr;
  /** 0–100. Lo estima el modelo sobre la legibilidad del documento. */
  confianza: number;
}

const CAMPOS_OCR: (keyof CamposExpedienteOcr)[] = [
  "nombre",
  "cedula",
  "fecha_nacimiento",
  "lugar_nacimiento",
  "nacionalidad",
  "genero",
  "telefono",
  "email",
  "direccion",
  "comunidad",
  "centro_educativo",
  "programa",
  "nombre_padre",
  "nombre_madre",
  "telefono_emergencia",
  "observaciones",
];

/**
 * Esquema JSON de la extracción.
 *
 * Cada campo es `string | null` porque un documento real casi nunca trae los
 * dieciséis: `null` significa "no aparece en el documento", que es un dato
 * distinto de una cadena vacía. Se usa `anyOf` y no `type: [...]` porque es la
 * forma que la API admite para uniones.
 *
 * `additionalProperties: false` es obligatorio en salidas estructuradas, y
 * todos los campos van en `required` para que el objeto llegue siempre completo
 * y la UI no tenga que distinguir "ausente" de "nulo".
 */
function esquemaOcr() {
  const textoOpcional = { anyOf: [{ type: "string" }, { type: "null" }] };
  const properties: Record<string, unknown> = {
    confianza: {
      type: "integer",
      description:
        "Confianza global de 0 a 100 según la legibilidad del documento y la certeza de los campos leídos.",
    },
  };
  for (const campo of CAMPOS_OCR) properties[campo] = textoOpcional;

  return {
    type: "object",
    properties,
    required: ["confianza", ...CAMPOS_OCR],
    additionalProperties: false,
  };
}

const SISTEMA_OCR = `Eres el asistente de digitalización de expedientes de la Fundación Global Effect.
Recibes la imagen o el PDF de una ficha social, una cédula o un documento escolar y extraes los campos.

Reglas:
- Transcribe EXACTAMENTE lo que el documento dice. No corrijas, no completes ni deduzcas datos que no estén escritos.
- Si un campo no aparece en el documento, devuelve null. Nunca inventes un valor plausible.
- Las fechas van en formato YYYY-MM-DD. Si solo hay año, devuelve null.
- La cédula dominicana va con guiones: 000-0000000-0.
- En "observaciones" anota lo que veas y no encaje en ningún campo, o las partes ilegibles.
- Ajusta "confianza" a la realidad: un documento borroso o manuscrito difícil baja la confianza aunque hayas leído algo.`;

/**
 * Extrae los campos de un expediente desde una imagen o un PDF.
 *
 * Usa **salida estructurada** (`output_config.format`) en vez de pedir JSON en
 * el prompt: el modelo queda obligado por el esquema, así que no hace falta
 * rescatar el JSON de entre texto explicativo ni defenderse de un ```json
 * suelto. La primera llamada con un esquema nuevo tarda algo más (se compila y
 * se cachea 24 h).
 *
 * El `base64` debe ir SIN saltos de línea; la API los rechaza.
 */
export async function ocrExpediente(
  base64: string,
  mime: string,
): Promise<ResultadoOcr> {
  const esPdf = mime === "application/pdf";
  const esImagen = (IMAGENES_ACEPTADAS as readonly string[]).includes(mime);
  if (!esPdf && !esImagen) {
    throw new Error(`Formato no admitido para OCR: ${mime}`);
  }

  // El bloque del documento va ANTES del texto: la API recomienda ese orden
  // para que el modelo lea el documento y luego la instrucción.
  const documento = esPdf
    ? { type: "document", source: { type: "base64", media_type: mime, data: base64 } }
    : { type: "image", source: { type: "base64", media_type: mime, data: base64 } };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: cabeceras(),
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: SISTEMA_OCR,
      output_config: { format: { type: "json_schema", schema: esquemaOcr() } },
      messages: [
        {
          role: "user",
          content: [
            documento,
            {
              type: "text",
              text: "Extrae los campos de este documento. Devuelve null en todo lo que no aparezca.",
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new Error(`Anthropic ${res.status}: ${detalle.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    stop_reason?: string;
    stop_details?: { category?: string | null } | null;
    content?: { type: string; text?: string }[];
  };

  // Hay que mirar `stop_reason` ANTES del contenido: en un rechazo el arreglo
  // viene vacío y leer content[0] rompería con un error sin sentido para el
  // usuario. Y `max_tokens` significa JSON cortado, que no se puede parsear.
  if (data.stop_reason === "refusal") {
    throw new Error("El modelo rechazó procesar el documento");
  }
  if (data.stop_reason === "max_tokens") {
    throw new Error("El documento es demasiado extenso para extraerlo de una vez");
  }

  const texto = (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("")
    .trim();

  let bruto: Record<string, unknown>;
  try {
    bruto = JSON.parse(texto) as Record<string, unknown>;
  } catch {
    throw new Error("La extracción no devolvió datos legibles");
  }

  // Normalización: el esquema garantiza la forma, no que los textos vengan
  // limpios. Una cadena vacía o un "N/A" del documento se guardan como null.
  const campos = Object.fromEntries(
    CAMPOS_OCR.map((campo) => {
      const v = bruto[campo];
      if (typeof v !== "string") return [campo, null];
      const limpio = v.trim();
      return [campo, limpio && !/^(n\/?a|ninguno|no aplica|-{1,})$/i.test(limpio) ? limpio : null];
    }),
  ) as unknown as CamposExpedienteOcr;

  const confianza = Number(bruto.confianza);

  return {
    campos,
    confianza: Number.isFinite(confianza) ? Math.min(100, Math.max(0, confianza)) : 0,
  };
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
