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
  solicitada_por_estudiante: boolean;
  motivo_estudiante: string | null;
  estudiante_nombre?: string;
  psicologo_nombre?: string | null;
  /**
   * Última nota clínica de la cita, para el resumen de la tarjeta.
   *
   * Solo viaja a `listarCitas`, que exige `psicologia.leer`. La vista del
   * estudiante usa `CitaDelEstudiante`, donde este campo no existe: el joven no
   * lee lo que el psicólogo escribe sobre él.
   */
  ultima_nota?: string | null;
}

/**
 * La cita tal como la ve el propio estudiante.
 *
 * Es un tipo aparte y no un `Pick<CitaPsicologia>` para que la omisión sea
 * explícita: aquí NO viajan `nivel_confidencialidad` ni `riesgos`. Esos campos
 * los escribe el psicólogo sobre el joven, y enviarlos al navegador para luego
 * no pintarlos no los protege —quedan en el HTML—. Ver `citasDeEstudiante`.
 */
export interface CitaDelEstudiante {
  id: string;
  fecha: string;
  hora: string | null;
  estado: string;
  tipo_registro: string;
  motivo_estudiante: string | null;
  psicologo_nombre: string | null;
}

/** Psicólogo de cabecera del estudiante (migración 0021). */
export interface PsicologoAsignado {
  id: string;
  nombre: string;
  email: string;
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
