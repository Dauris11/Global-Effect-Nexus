/**
 * Tipos del dominio Landing (página de inicio pública configurable).
 */

export interface LandingSlide {
  id: string;
  titulo: string;
  subtitulo: string | null;
  texto: string | null;
  imagen_url: string | null;
  cta_texto: string | null;
  cta_enlace: string | null;
  orden: number;
  activo: boolean;
}

export interface LandingEstadisticas {
  estudiantes_activos: number;
  materias: number;
  patrocinadores: number;
}

export interface EventoPublico {
  id: string;
  titulo: string;
  tipo: string;
  fecha: string;
  ubicacion: string | null;
}

/** Una noticia publicada, tal como la ve el visitante. */
export interface Noticia {
  id: string;
  titulo: string;
  resumen: string | null;
  contenido: string | null;
  imagen_url: string | null;
  /** `YYYY-MM-DD`. */
  fecha: string;
  autor: string | null;
}

/**
 * Entrada del blog de la landing.
 *
 * Une dos orígenes distintos —`noticia` y `evento` ya celebrado— en la forma
 * mínima que la sección necesita. El `origen` no es decorativo: la tarjeta lo
 * usa para etiquetar la entrada, porque no es lo mismo "esto lo contamos
 * nosotros" que "esto ocurrió".
 */
export interface EntradaBlog {
  id: string;
  origen: "noticia" | "evento";
  titulo: string;
  resumen: string | null;
  imagen_url: string | null;
  /** `YYYY-MM-DD`. */
  fecha: string;
  /** Tipo del evento, o autor de la noticia. */
  etiqueta: string | null;
}
