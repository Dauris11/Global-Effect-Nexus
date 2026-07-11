/**
 * Tipos del dominio Academias: programas de liderazgo/habilidades y sus
 * materiales educativos.
 */

export interface Academia {
  id: string;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  facilitador: string | null;
  estado: string;
  participantes: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
}

export interface Material {
  id: string;
  titulo: string;
  descripcion: string | null;
  academia_id: string;
  tipo: string;
  documento_id: string | null;
  enlace_url: string | null;
  autor: string | null;
}
