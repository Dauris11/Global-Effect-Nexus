/**
 * Tipos del dominio Patrocinio: patrocinadores y asignaciones de beca.
 */

export type TipoPatrocinador = "empresa" | "persona" | "iglesia" | "ong" | "otro";

export interface Patrocinador {
  id: string;
  nombre: string;
  tipo: TipoPatrocinador;
  email: string | null;
  telefono: string | null;
  pais: string | null;
  estado: string;
  monto_mensual: number;
  notas: string | null;
}

export interface PatrocinadorEstadisticas {
  total: number;
  activos: number;
  aporte_mensual_total: number;
  paises: number;
}

export interface AsignacionBeca {
  id: string;
  estudiante_id: string;
  patrocinador_id: string;
  monto: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: string;
  estudiante_nombre?: string;
  patrocinador_nombre?: string;
}
