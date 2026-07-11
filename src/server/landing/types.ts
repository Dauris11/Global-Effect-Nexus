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
