/**
 * Tipos del dominio Estudiantes (Expedientes). Interfaces que reflejan las
 * columnas de la tabla `estudiante` consumidas por la UI. El expediente
 * completo (familiares, vivienda, salud, socioeconómico) se compone en
 * queries adicionales durante S5.
 */

export type TipoEstudiante = "becado" | "regular";

export interface EstudianteListItem {
  id: string;
  nombre: string;
  tipo: TipoEstudiante;
  estado: string;
  programa: string | null;
}

export interface Estudiante {
  id: string;
  nombre: string;
  cedula: string | null;
  email: string | null;
  telefono: string | null;
  tipo: TipoEstudiante;
  estado: string;
  programa: string | null;
  patrocinador_id: string | null;
  created_at: string;
}

export interface Familiar {
  id: string;
  parentesco: string;
  nombre: string;
  edad: number | null;
  telefono: string | null;
  profesion: string | null;
}

export interface PerfilVivienda {
  con_quien_vive: string | null;
  casa_propia: string | null;
  habitaciones: number | null;
  camas: number | null;
  direccion: string | null;
  comunidad: string | null;
}

export interface PerfilSalud {
  enfermedades: string | null;
  alergias: string | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
}

export interface PerfilSocioeconomico {
  historia_de_vida: string | null;
  situacion_familiar: string | null;
  situacion_economica: string | null;
  motivo_beca: string | null;
  metas_academicas: string | null;
}

/** Expediente integral: núcleo + tablas hijas + GPA acumulado. */
export interface ExpedienteCompleto {
  estudiante: Estudiante;
  familiares: Familiar[];
  vivienda: PerfilVivienda | null;
  salud: PerfilSalud | null;
  socioeconomico: PerfilSocioeconomico | null;
  gpa: number | null;
}
