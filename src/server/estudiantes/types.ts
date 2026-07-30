/**
 * Tipos del dominio Estudiantes (Expedientes). Interfaces que reflejan las
 * columnas de la tabla `estudiante` consumidas por la UI. El expediente
 * completo (familiares, vivienda, salud, socioeconómico) se compone en
 * `obtenerExpedienteCompleto`.
 */

export type TipoEstudiante = "becado" | "regular";

/** Estados del pipeline de reclutamiento (enum `estado_estudiante`, 0005). */
export type EstadoEstudiante =
  | "reclutado"
  | "postulado"
  | "academia_liderazgo"
  | "standby_tecnico"
  | "activo"
  | "inactivo"
  | "graduado"
  | "suspendido";

export interface EstudianteListItem {
  id: string;
  nombre: string;
  tipo: TipoEstudiante;
  estado: EstadoEstudiante;
  programa: string | null;
  /**
   * GPA acumulado (escala 0–4) o `null` si aún no tiene historial. La lista lo
   * necesita porque es lo que colorea el riel de cada fila: el estado
   * académico es la señal que el personal busca al recorrer el listado.
   */
  gpa: number | null;
}

export interface Estudiante {
  id: string;
  nombre: string;
  cedula: string | null;
  email: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  lugar_nacimiento: string | null;
  nacionalidad: string | null;
  genero: string | null;
  religion: string | null;
  tipo: TipoEstudiante;
  estado: EstadoEstudiante;
  programa: string | null;
  donde_estudia: string | null;
  universidad: string | null;
  fecha_ingreso: string | null;
  centro_educativo: string | null;
  facilitador_habitudes: string | null;
  breve_historia_habitudes: string | null;
  notas_adicionales: string | null;
  patrocinador_id: string | null;
  /** Nombre del patrocinador, si tiene beca asignada (viene de un JOIN). */
  patrocinador_nombre: string | null;
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
  por_que_vive_con_esa_persona: string | null;
  hermanos_cantidad: number | null;
  casa_propia: string | null;
  tipo_casa: string | null;
  bano_dentro: string | null;
  habitaciones: number | null;
  camas: number | null;
  quienes_duermen_cama: string | null;
  direccion: string | null;
  comunidad: string | null;
  ciudad_residencia: string | null;
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

/** Una materia del historial, para la línea de evolución del GPA. */
export interface PuntoHistorial {
  cuatrimestre: string;
  gpa: number;
  materias: number;
}

/** Expediente integral: núcleo + tablas hijas + GPA acumulado. */
export interface ExpedienteCompleto {
  estudiante: Estudiante;
  familiares: Familiar[];
  vivienda: PerfilVivienda | null;
  salud: PerfilSalud | null;
  socioeconomico: PerfilSocioeconomico | null;
  gpa: number | null;
  /** GPA por cuatrimestre, en orden cronológico, para el gráfico de evolución. */
  evolucion: PuntoHistorial[];
  /** Documentos adjuntos del expediente (escaneos, OCR). */
  documentos: DocumentoExpediente[];
}

/**
 * Documento adjunto a un expediente.
 *
 * No existe `documento.estudiante_id`: la tabla `documento` es transversal
 * (0003) y el vínculo con el estudiante lo establece `extraccion_ocr`, que es
 * justamente por donde entran los documentos del expediente.
 */
export interface DocumentoExpediente {
  /** Id de la extracción, no del documento: es la fila que se consulta. */
  id: string;
  documento_id: string | null;
  nombre: string | null;
  tipo: string | null;
  storage_key: string | null;
  created_at: string;
  ocr_estado: "pendiente" | "procesando" | "completado" | "error";
  ocr_confianza: number | null;
  /** Campos detectados por la IA (JSONB), si la extracción terminó. */
  datos_extraidos: Record<string, unknown> | null;
  mensaje_error: string | null;
}

/** Conteos para la cabecera de la lista de expedientes. */
export interface ResumenExpedientes {
  total: number;
  becados: number;
  activos: number;
  /** En el pipeline previo a activo: reclutado, postulado, academia, standby. */
  en_proceso: number;
}
