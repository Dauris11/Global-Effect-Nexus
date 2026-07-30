/**
 * Consultas de lectura (SELECT parametrizado) del dominio Estudiantes.
 * Nunca se interpola entrada del usuario: todo va como parámetro posicional.
 */
import { query } from "@/lib/db";
import type {
  DocumentoExpediente,
  Estudiante,
  EstudianteListItem,
  ExpedienteCompleto,
  Familiar,
  PerfilSalud,
  PerfilSocioeconomico,
  PerfilVivienda,
  PuntoHistorial,
  ResumenExpedientes,
} from "./types";

/**
 * Lista expedientes con filtros opcionales y su GPA acumulado.
 *
 * El GPA llega por subconsulta y no por `JOIN` + `GROUP BY` a propósito: con
 * `JOIN` habría que agrupar por todas las columnas del estudiante y un joven
 * sin historial desaparecería del listado si el `JOIN` fuera interno. Aquí un
 * expediente recién abierto sale con `gpa: null`, que es lo correcto —existe,
 * simplemente todavía no tiene notas.
 */
export async function listarEstudiantes(filtro?: {
  tipo?: string;
  estado?: string;
  buscar?: string;
}): Promise<EstudianteListItem[]> {
  const cond: string[] = [];
  const params: unknown[] = [];

  if (filtro?.tipo) {
    params.push(filtro.tipo);
    cond.push(`e.tipo = $${params.length}::tipo_estudiante`);
  }
  if (filtro?.estado) {
    params.push(filtro.estado);
    cond.push(`e.estado = $${params.length}::estado_estudiante`);
  }
  if (filtro?.buscar) {
    // Se busca por nombre, cédula y programa: el personal tiene a mano el
    // documento del joven tan a menudo como su nombre.
    params.push(`%${filtro.buscar}%`);
    cond.push(
      `(e.nombre ILIKE $${params.length}
        OR e.cedula ILIKE $${params.length}
        OR e.programa ILIKE $${params.length})`,
    );
  }

  const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";
  const { rows } = await query(
    `SELECT e.id, e.nombre, e.tipo, e.estado, e.programa,
            (SELECT ROUND(AVG(h.gpa)::numeric, 2)
               FROM historial_calificacion h
              WHERE h.estudiante_id = e.id) AS gpa
       FROM estudiante e
       ${where}
      ORDER BY e.nombre
      LIMIT 200`,
    params,
  );

  return rows.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    tipo: r.tipo,
    estado: r.estado,
    programa: r.programa,
    // `AVG` de NUMERIC vuelve como cadena por el driver; sin este Number()
    // las comparaciones de banda (>= 90) se harían entre texto y número.
    gpa: r.gpa != null ? Number(r.gpa) : null,
  })) as EstudianteListItem[];
}

/** Conteos de la cabecera del listado. Una sola pasada sobre la tabla. */
export async function resumenExpedientes(): Promise<ResumenExpedientes> {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE tipo = 'becado')::int AS becados,
            COUNT(*) FILTER (WHERE estado = 'activo')::int AS activos,
            COUNT(*) FILTER (
              WHERE estado IN ('reclutado', 'postulado', 'academia_liderazgo', 'standby_tecnico')
            )::int AS en_proceso
       FROM estudiante`,
  );
  const r = rows[0] ?? {};
  return {
    total: r.total ?? 0,
    becados: r.becados ?? 0,
    activos: r.activos ?? 0,
    en_proceso: r.en_proceso ?? 0,
  };
}

/** Obtiene un estudiante por id (datos base del expediente). */
export async function obtenerEstudiante(id: string): Promise<Estudiante | null> {
  const { rows } = await query(
    // Las DATE salen con to_char, no crudas: el driver las convertiría a Date
    // en la zona del servidor y una fecha de nacimiento puede retroceder un día.
    `SELECT e.id, e.nombre, e.cedula, e.email, e.telefono,
            to_char(e.fecha_nacimiento, 'YYYY-MM-DD') AS fecha_nacimiento,
            e.lugar_nacimiento, e.nacionalidad, e.genero, e.religion,
            e.tipo, e.estado, e.programa, e.donde_estudia, e.universidad,
            to_char(e.fecha_ingreso, 'YYYY-MM-DD') AS fecha_ingreso,
            e.centro_educativo, e.facilitador_habitudes, e.breve_historia_habitudes,
            e.notas_adicionales, e.patrocinador_id, p.nombre AS patrocinador_nombre,
            e.created_at
       FROM estudiante e
       LEFT JOIN patrocinador p ON p.id = e.patrocinador_id
      WHERE e.id = $1`,
    [id],
  );
  return (rows[0] as Estudiante) ?? null;
}

/**
 * Expediente integral del estudiante: núcleo + familiares + perfiles + GPA
 * + evolución por cuatrimestre + documentos.
 *
 * NO toca las tablas de psicología: son confidenciales y se leen solo desde su
 * módulo, con su propio permiso (docs/03-modulos-funcionales.md).
 */
export async function obtenerExpedienteCompleto(
  id: string,
): Promise<ExpedienteCompleto | null> {
  const estudiante = await obtenerEstudiante(id);
  if (!estudiante) return null;

  const [fam, viv, sal, soc, gpa, evo, docs] = await Promise.all([
    query(
      `SELECT id, parentesco, nombre, edad, telefono, profesion
         FROM familiar WHERE estudiante_id = $1 ORDER BY parentesco`,
      [id],
    ),
    query(
      `SELECT con_quien_vive, por_que_vive_con_esa_persona, hermanos_cantidad,
              casa_propia, tipo_casa, bano_dentro, habitaciones, camas,
              quienes_duermen_cama, direccion, comunidad, ciudad_residencia
         FROM perfil_vivienda WHERE estudiante_id = $1`,
      [id],
    ),
    query(
      `SELECT enfermedades, alergias, contacto_emergencia_nombre, contacto_emergencia_telefono
         FROM perfil_salud WHERE estudiante_id = $1`,
      [id],
    ),
    query(
      `SELECT historia_de_vida, situacion_familiar, situacion_economica, motivo_beca, metas_academicas
         FROM perfil_socioeconomico WHERE estudiante_id = $1`,
      [id],
    ),
    query(
      `SELECT ROUND(AVG(gpa)::numeric, 2) AS gpa
         FROM historial_calificacion WHERE estudiante_id = $1`,
      [id],
    ),
    // Evolución cronológica (ASC): el gráfico se lee de izquierda a derecha.
    query(
      `SELECT cuatrimestre,
              ROUND(AVG(gpa)::numeric, 2) AS gpa,
              COUNT(*)::int AS materias
         FROM historial_calificacion
        WHERE estudiante_id = $1
        GROUP BY cuatrimestre
        ORDER BY cuatrimestre ASC`,
      [id],
    ),
    query(
      `SELECT x.id, x.documento_id, d.nombre, d.tipo, d.storage_key,
              x.created_at, x.estado AS ocr_estado, x.confianza AS ocr_confianza,
              x.datos_extraidos, x.mensaje_error
         FROM extraccion_ocr x
         LEFT JOIN documento d ON d.id = x.documento_id
        WHERE x.estudiante_id = $1
        ORDER BY x.created_at DESC`,
      [id],
    ),
  ]);

  return {
    estudiante,
    familiares: fam.rows as Familiar[],
    vivienda: (viv.rows[0] as PerfilVivienda) ?? null,
    salud: (sal.rows[0] as PerfilSalud) ?? null,
    socioeconomico: (soc.rows[0] as PerfilSocioeconomico) ?? null,
    gpa: gpa.rows[0]?.gpa != null ? Number(gpa.rows[0].gpa) : null,
    evolucion: evo.rows.map((r) => ({
      cuatrimestre: r.cuatrimestre,
      gpa: Number(r.gpa),
      materias: r.materias,
    })) as PuntoHistorial[],
    documentos: docs.rows.map((r) => ({
      ...r,
      ocr_confianza: r.ocr_confianza != null ? Number(r.ocr_confianza) : null,
    })) as DocumentoExpediente[],
  };
}
