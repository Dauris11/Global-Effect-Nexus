/**
 * Tipos del dominio Psicología (CONFIDENCIAL). Estas entidades están aisladas
 * del expediente general y solo son accesibles con `psicologia.leer` /
 * `psicologia.escribir`. Nunca se hace JOIN a ellas desde el expediente común.
 */

export interface CitaPsicologia {
  id: string;
  estudiante_id: string;
  psicologo_id: string | null;
  tipo_registro: string;
  fecha: string;
  hora: string | null;
  nivel_confidencialidad: string;
  estado: string;
  riesgos: string | null;
  estudiante_nombre?: string;
}

export interface NotaPsicologica {
  id: string;
  cita_id: string | null;
  estudiante_id: string;
  contenido: string;
  creado_por_id: string | null;
  created_at: string;
}

export interface PsicologiaEstadisticas {
  total: number;
  programadas: number;
  seguimientos: number;
  confidenciales: number;
}
