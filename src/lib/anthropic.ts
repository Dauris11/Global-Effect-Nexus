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
/** El OCR va por su cuenta: ver la nota en `ocrExpediente`. */
const MODELO_OCR = process.env.ANTHROPIC_MODEL_OCR ?? "claude-opus-5";
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

/**
 * Campos de texto que el OCR intenta sacar de la ficha social.
 *
 * La lista sigue el expediente real, no un subconjunto cómodo: la ficha que
 * llena la Fundación cubre identificación, situación académica, Habitudes,
 * familia, vivienda, salud y los narrativos de historia de vida. Extraer solo
 * los datos de la cédula obligaba a teclear el resto a mano, que es justo el
 * trabajo que el OCR venía a quitar.
 *
 * Los nombres coinciden con las columnas de la BD (`estudiante`,
 * `perfil_vivienda`, `perfil_salud`, `perfil_socioeconomico`, `familiar`) para
 * que la revisión humana sea un mapeo directo y no una tabla de equivalencias.
 */
const CAMPOS_TEXTO = [
  // Identificación
  "nombre",
  "cedula",
  "fecha_nacimiento",
  "lugar_nacimiento",
  "nacionalidad",
  "genero",
  "sexo_documento",
  "religion",
  "telefono",
  "email",
  // Residencia
  "direccion",
  "comunidad",
  "ciudad_residencia",
  "pais_residencia",
  // Académico / institucional
  "programa",
  "donde_estudia",
  "universidad",
  "fecha_ingreso",
  // Habitudes
  "facilitador_habitudes",
  "centro_educativo",
  "director_centro",
  "breve_historia_habitudes",
  // Familia
  "padre_nombre",
  "padre_telefono",
  "padre_profesion",
  "madre_nombre",
  "madre_telefono",
  "madre_profesion",
  "tutor_nombre",
  "tutor_telefono",
  "tutor_profesion",
  // Convivencia y vivienda
  "con_quien_vive",
  "por_que_vive_con_esa_persona",
  "hermanos_edades",
  "hermanas_edades",
  "casa_propia",
  "tipo_casa",
  "bano_dentro",
  "quienes_duermen_cama",
  // Salud y emergencia
  "enfermedades",
  "alergias",
  "contacto_emergencia_nombre",
  "contacto_emergencia_telefono",
  // Narrativos
  "historia_de_vida",
  "situacion_familiar",
  "situacion_economica",
  "motivo_beca",
  "metas_academicas",
  // Cajón de sastre
  "observaciones",
] as const;

/**
 * Campos numéricos. Van aparte porque el esquema los declara `integer` y no
 * `string`: una edad leída como "12 años" tiene que llegar como 12, o la
 * revisión humana acaba limpiando texto en vez de confirmar datos.
 */
const CAMPOS_NUMERO = [
  "padre_edad",
  "madre_edad",
  "tutor_edad",
  "hermanos_cantidad",
  "habitaciones",
  "camas",
] as const;

export type CamposExpedienteOcr = Record<(typeof CAMPOS_TEXTO)[number], string | null> &
  Record<(typeof CAMPOS_NUMERO)[number], number | null>;

export interface ResultadoOcr {
  campos: CamposExpedienteOcr;
  /** 0–100. Lo estima el modelo sobre la legibilidad del documento. */
  confianza: number;
}

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
  const numeroOpcional = { anyOf: [{ type: "integer" }, { type: "null" }] };
  const properties: Record<string, unknown> = {
    confianza: {
      type: "integer",
      description:
        "Confianza global de 0 a 100 según la legibilidad del documento y la certeza de los campos leídos.",
    },
  };
  for (const campo of CAMPOS_TEXTO) properties[campo] = textoOpcional;
  for (const campo of CAMPOS_NUMERO) properties[campo] = numeroOpcional;

  return {
    type: "object",
    properties,
    required: ["confianza", ...CAMPOS_TEXTO, ...CAMPOS_NUMERO],
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
- Los campos numéricos (edades, cantidad de hermanos, habitaciones, camas) van como número entero, sin la palabra "años".
- Los campos narrativos (historia_de_vida, situacion_familiar, situacion_economica, motivo_beca, metas_academicas, breve_historia_habitudes) se transcriben completos, respetando los saltos de párrafo.
- Una ficha manuscrita rara vez trae todos los campos. Que la mayoría salga null es normal y correcto; rellenar por parecido es el error grave.
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
      // El OCR usa un modelo aparte del chat: leer una ficha manuscrita,
      // borrosa o fotografiada de lado es la tarea de visión más exigente de
      // la plataforma, y equivocarse aquí mete datos falsos en el expediente
      // de un joven. Se sobreescribe con ANTHROPIC_MODEL_OCR.
      model: MODELO_OCR,
      // Con ~55 campos y narrativos completos, 4096 se quedaba corto y el JSON
      // llegaba cortado. El límite cubre además el razonamiento del modelo,
      // que en visión se lleva su parte.
      max_tokens: 16000,
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
  const campos = Object.fromEntries([
    ...CAMPOS_TEXTO.map((campo) => {
      const v = bruto[campo];
      if (typeof v !== "string") return [campo, null];
      const limpio = v.trim();
      return [campo, limpio && !/^(n\/?a|ninguno|no aplica|-{1,})$/i.test(limpio) ? limpio : null];
    }),
    // Un número negativo o absurdo es lectura fallida, no dato: mejor null que
    // meter "-3 hermanos" en el expediente para que alguien lo corrija luego.
    ...CAMPOS_NUMERO.map((campo) => {
      const n = Number(bruto[campo]);
      return [campo, Number.isInteger(n) && n >= 0 && n < 200 ? n : null];
    }),
  ]) as unknown as CamposExpedienteOcr;

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
