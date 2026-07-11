/**
 * Tipos del dominio IA: conversaciones, mensajes y extracciones OCR.
 */

export type AmbitoIA = "interno" | "estudiantil";

export interface ConversacionIA {
  id: string;
  usuario_id: string | null;
  ambito: AmbitoIA;
  titulo: string | null;
  created_at: string;
}

export interface MensajeIA {
  id: string;
  conversacion_id: string;
  rol: "user" | "assistant" | "system";
  contenido: string;
  created_at: string;
}

export interface ExtraccionOcr {
  id: string;
  documento_id: string | null;
  estudiante_id: string | null;
  estado: string;
  modelo: string | null;
  confianza: number | null;
  datos_extraidos: Record<string, unknown> | null;
  mensaje_error: string | null;
}
