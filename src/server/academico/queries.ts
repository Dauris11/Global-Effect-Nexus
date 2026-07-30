/**
 * Consultas de lectura del dominio Académico (SELECT parametrizado).
 */
import { query } from "@/lib/db";
import type {
  Periodo,
  PeriodoConConteos,
  Materia,
  Curso,
  Inscripcion,
  Calificacion,
  HistorialCalificacion,
  HistorialEstudiante,
} from "./types";

export async function listarPeriodos(): Promise<Periodo[]> {
  const { rows } = await query(
    // Las DATE salen con to_char: el driver las convertiría a Date en la zona
    // del servidor y un período podría empezar un día antes de lo que dice.
    `SELECT id, nombre, estado,
            to_char(fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
            to_char(fecha_fin,    'YYYY-MM-DD') AS fecha_fin
       FROM periodo
      ORDER BY fecha_inicio DESC`,
  );
  return rows as Periodo[];
}

/**
 * Materias del catálogo, con el nombre de su período.
 *
 * El `LEFT JOIN` a `periodo` es lo que hace la fila legible: la tabla guarda
 * `periodo_id`, y sin el JOIN la pantalla tendría que mostrar un UUID o nada.
 * Es `LEFT` y no interno porque una materia sin período asignado debe seguir
 * apareciendo en el catálogo.
 */
export async function listarMaterias(buscar?: string): Promise<Materia[]> {
  const params: unknown[] = [];
  let where = "";
  if (buscar) {
    params.push(`%${buscar}%`);
    where = `WHERE m.nombre ILIKE $1 OR m.codigo ILIKE $1 OR m.profesor_nombre ILIKE $1`;
  }
  const { rows } = await query(
    `SELECT m.id, m.nombre, m.codigo, m.descripcion, m.periodo_id, m.creditos,
            m.profesor_nombre, m.profesor_usuario_id, m.estado, m.horario, m.aula,
            p.nombre AS periodo_nombre
       FROM materia m
       LEFT JOIN periodo p ON p.id = m.periodo_id
       ${where}
      ORDER BY m.nombre
      LIMIT 200`,
    params,
  );
  return rows as Materia[];
}

/** Conteos de la cabecera del catálogo de materias. */
export async function resumenMaterias(): Promise<{
  total: number;
  activas: number;
  creditos: number;
}> {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE estado = 'activa')::int AS activas,
            COALESCE(SUM(creditos) FILTER (WHERE estado = 'activa'), 0)::int AS creditos
       FROM materia`,
  );
  const r = rows[0] ?? {};
  return { total: r.total ?? 0, activas: r.activas ?? 0, creditos: r.creditos ?? 0 };
}

/** Cursos técnicos, con el nombre de su período. */
export async function listarCursos(buscar?: string): Promise<Curso[]> {
  const params: unknown[] = [];
  let where = "";
  if (buscar) {
    params.push(`%${buscar}%`);
    where = `WHERE c.nombre ILIKE $1 OR c.docente ILIKE $1`;
  }
  const { rows } = await query(
    `SELECT c.id, c.nombre, c.descripcion, c.docente, c.docente_usuario_id,
            c.periodo_id, c.estado,
            c.capacidad, c.inscritos, c.horario, c.modalidad,
            p.nombre AS periodo_nombre
       FROM curso c
       LEFT JOIN periodo p ON p.id = c.periodo_id
       ${where}
      ORDER BY c.nombre
      LIMIT 200`,
    params,
  );
  return rows as Curso[];
}

/** Conteos de la cabecera de cursos técnicos. */
export async function resumenCursos(): Promise<{
  total: number;
  activos: number;
  inscritos: number;
  cupos: number;
}> {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE estado = 'activo')::int AS activos,
            COALESCE(SUM(inscritos)  FILTER (WHERE estado = 'activo'), 0)::int AS inscritos,
            COALESCE(SUM(capacidad)  FILTER (WHERE estado = 'activo'), 0)::int AS cupos
       FROM curso`,
  );
  const r = rows[0] ?? {};
  return {
    total: r.total ?? 0,
    activos: r.activos ?? 0,
    inscritos: r.inscritos ?? 0,
    cupos: r.cupos ?? 0,
  };
}

/** Inscripciones (prematrícula), filtrables por período y por nombre. */
export async function listarInscripciones(filtro?: {
  periodoId?: string;
  buscar?: string;
}): Promise<Inscripcion[]> {
  const cond: string[] = [];
  const params: unknown[] = [];

  if (filtro?.periodoId) {
    params.push(filtro.periodoId);
    cond.push(`i.periodo_id = $${params.length}`);
  }
  if (filtro?.buscar) {
    params.push(`%${filtro.buscar}%`);
    cond.push(`(e.nombre ILIKE $${params.length} OR m.nombre ILIKE $${params.length})`);
  }
  const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";

  const { rows } = await query(
    `SELECT i.id, i.estudiante_id, i.materia_id, i.periodo_id, i.estado,
            e.nombre AS estudiante_nombre,
            m.nombre AS materia_nombre,
            m.creditos,
            p.nombre AS periodo_nombre
       FROM inscripcion i
       JOIN estudiante e ON e.id = i.estudiante_id
       JOIN materia m    ON m.id = i.materia_id
       JOIN periodo p    ON p.id = i.periodo_id
       ${where}
      ORDER BY e.nombre, m.nombre
      LIMIT 500`,
    params,
  );
  return rows as Inscripcion[];
}

/**
 * Resumen de la prematrícula del período elegido.
 *
 * Los estados son los del enum real de `inscripcion` (activa · retirada ·
 * aprobada · reprobada). No se derivan de la nota: una inscripción retirada no
 * es "una nota en cero", es una materia que el estudiante dejó de cursar, y son
 * dos cosas distintas para la coordinación.
 */
export async function resumenInscripciones(periodoId?: string): Promise<{
  total: number;
  estudiantes: number;
  activas: number;
  aprobadas: number;
  reprobadas: number;
  retiradas: number;
  creditos: number;
}> {
  const params: unknown[] = [];
  let where = "";
  if (periodoId) {
    params.push(periodoId);
    where = `WHERE i.periodo_id = $1`;
  }
  const { rows } = await query(
    `SELECT COUNT(*)::int                                    AS total,
            COUNT(DISTINCT i.estudiante_id)::int             AS estudiantes,
            COUNT(*) FILTER (WHERE i.estado = 'activa')::int     AS activas,
            COUNT(*) FILTER (WHERE i.estado = 'aprobada')::int   AS aprobadas,
            COUNT(*) FILTER (WHERE i.estado = 'reprobada')::int  AS reprobadas,
            COUNT(*) FILTER (WHERE i.estado = 'retirada')::int   AS retiradas,
            COALESCE(SUM(m.creditos) FILTER (WHERE i.estado = 'activa'), 0)::int AS creditos
       FROM inscripcion i
       JOIN materia m ON m.id = i.materia_id
       ${where}`,
    params,
  );
  const r = rows[0] ?? {};
  return {
    total: r.total ?? 0,
    estudiantes: r.estudiantes ?? 0,
    activas: r.activas ?? 0,
    aprobadas: r.aprobadas ?? 0,
    reprobadas: r.reprobadas ?? 0,
    retiradas: r.retiradas ?? 0,
    creditos: r.creditos ?? 0,
  };
}

/** Materias en forma ligera, para el desplegable de la prematrícula. */
export async function materiasParaSelector(): Promise<
  { id: string; nombre: string }[]
> {
  const { rows } = await query(
    `SELECT id, nombre FROM materia WHERE estado = 'activa' ORDER BY nombre LIMIT 300`,
  );
  return rows as { id: string; nombre: string }[];
}

/**
 * Períodos con lo que cuelga de cada uno.
 *
 * Los tres conteos van por subconsulta y no por `JOIN` + `GROUP BY`: con tres
 * `JOIN` a la vez las filas se multiplicarían entre sí (10 materias × 4 cursos
 * daría 40) y los conteos saldrían inflados. Es el clásico *fan-out* de SQL.
 */
export async function periodosConConteos(): Promise<PeriodoConConteos[]> {
  const { rows } = await query(
    `SELECT p.id, p.nombre, p.estado,
            to_char(p.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
            to_char(p.fecha_fin,    'YYYY-MM-DD') AS fecha_fin,
            (SELECT COUNT(*) FROM materia     WHERE periodo_id = p.id)::int AS materias,
            (SELECT COUNT(*) FROM curso       WHERE periodo_id = p.id)::int AS cursos,
            (SELECT COUNT(*) FROM inscripcion WHERE periodo_id = p.id)::int AS inscripciones,
            (p.fecha_inicio <= CURRENT_DATE AND p.fecha_fin >= CURRENT_DATE) AS en_curso
       FROM periodo p
      ORDER BY p.fecha_inicio DESC`,
  );
  return rows as PeriodoConConteos[];
}

/**
 * Historial académico consolidado, **una fila por estudiante**.
 *
 * `historial_calificacion` guarda una fila por materia cursada, con el nombre de
 * la materia como texto y no como FK. Eso es deliberado en el esquema: es un
 * registro histórico, y si años después se renombra o se borra una materia, el
 * expediente del joven no debe cambiar ni perder la fila.
 *
 * `MAX(cuatrimestre)` funciona como "el más reciente" porque el formato es
 * `AAAA-N` ('2025-I', '2025-II'), que ordena bien como texto.
 */
export async function historialPorEstudiante(filtro?: {
  buscar?: string;
  cuatrimestre?: string;
}): Promise<HistorialEstudiante[]> {
  const cond: string[] = [];
  const params: unknown[] = [];

  if (filtro?.buscar) {
    params.push(`%${filtro.buscar}%`);
    cond.push(`(e.nombre ILIKE $${params.length} OR h.materia ILIKE $${params.length})`);
  }
  if (filtro?.cuatrimestre) {
    params.push(filtro.cuatrimestre);
    cond.push(`h.cuatrimestre = $${params.length}`);
  }
  const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";

  const { rows } = await query(
    `SELECT h.estudiante_id,
            e.nombre AS estudiante_nombre,
            COUNT(*)::int AS materias,
            ROUND(AVG(h.gpa)::numeric, 2)           AS gpa,
            ROUND(AVG(h.nota_numerica)::numeric, 1) AS promedio,
            COUNT(*) FILTER (WHERE h.estado = 'aprobada')::int          AS aprobadas,
            COUNT(*) FILTER (WHERE h.estado = 'reprobada')::int         AS reprobadas,
            COUNT(*) FILTER (WHERE h.estado = 'prueba_academica')::int  AS en_prueba,
            MAX(h.cuatrimestre) AS ultimo_cuatrimestre
       FROM historial_calificacion h
       JOIN estudiante e ON e.id = h.estudiante_id
       ${where}
      GROUP BY h.estudiante_id, e.nombre
      ORDER BY e.nombre
      LIMIT 300`,
    params,
  );
  return rows.map((r) => ({
    ...r,
    gpa: r.gpa != null ? Number(r.gpa) : null,
    promedio: r.promedio != null ? Number(r.promedio) : null,
  })) as HistorialEstudiante[];
}

/** Cifras globales del historial (para la cabecera). */
export async function resumenHistorial(): Promise<{
  registros: number;
  estudiantes: number;
  gpa: number | null;
  aprobadas: number;
  reprobadas: number;
}> {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS registros,
            COUNT(DISTINCT estudiante_id)::int AS estudiantes,
            ROUND(AVG(gpa)::numeric, 2) AS gpa,
            COUNT(*) FILTER (WHERE estado = 'aprobada')::int  AS aprobadas,
            COUNT(*) FILTER (WHERE estado = 'reprobada')::int AS reprobadas
       FROM historial_calificacion`,
  );
  const r = rows[0] ?? {};
  return {
    registros: r.registros ?? 0,
    estudiantes: r.estudiantes ?? 0,
    gpa: r.gpa != null ? Number(r.gpa) : null,
    aprobadas: r.aprobadas ?? 0,
    reprobadas: r.reprobadas ?? 0,
  };
}

/** Cuatrimestres presentes en el historial, del más reciente al más antiguo. */
export async function cuatrimestresDelHistorial(): Promise<string[]> {
  const { rows } = await query(
    `SELECT DISTINCT cuatrimestre FROM historial_calificacion ORDER BY cuatrimestre DESC`,
  );
  return rows.map((r) => r.cuatrimestre as string);
}

export async function listarCalificaciones(buscar?: string): Promise<Calificacion[]> {
  const params: unknown[] = [];
  let where = "";
  if (buscar) {
    params.push(`%${buscar}%`);
    where = `WHERE e.nombre ILIKE $1 OR c.nombre ILIKE $1`;
  }
  const { rows } = await query(
    `SELECT cal.id, cal.estudiante_id, cal.curso_id, cal.periodo_id,
            cal.nota, cal.tipo_evaluacion, cal.observaciones,
            e.nombre AS estudiante_nombre,
            c.nombre AS curso_nombre,
            p.nombre AS periodo_nombre
       FROM calificacion cal
       JOIN estudiante e ON e.id = cal.estudiante_id
       JOIN curso c      ON c.id = cal.curso_id
       LEFT JOIN periodo p ON p.id = cal.periodo_id
       ${where}
      ORDER BY cal.created_at DESC LIMIT 500`,
    params,
  );
  // `nota` es NUMERIC(5,2): el driver la devuelve como cadena, y sin este
  // Number() las comparaciones de banda (>= 90) se harían entre texto y número.
  return rows.map((r) => ({ ...r, nota: Number(r.nota) })) as Calificacion[];
}

/**
 * Resumen de calificaciones **por banda del estándar** (≥90 · 70–89 · 60–69 · <60).
 *
 * La distribución se cuenta en SQL y no en el cliente porque la pantalla solo
 * trae 500 filas: contar sobre lo paginado daría una distribución de la página,
 * no del curso, y eso se leería como un dato institucional cuando no lo es.
 *
 * El corte de aprobado es 70, el mismo de docs/03-modulos-funcionales.md.
 */
export async function resumenCalificaciones(): Promise<{
  total: number;
  promedio: number | null;
  excelentes: number;
  buenas: number;
  riesgo: number;
  criticas: number;
  aprobadas: number;
}> {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS total,
            ROUND(AVG(nota)::numeric, 1) AS promedio,
            COUNT(*) FILTER (WHERE nota >= 90)::int              AS excelentes,
            COUNT(*) FILTER (WHERE nota >= 70 AND nota < 90)::int AS buenas,
            COUNT(*) FILTER (WHERE nota >= 60 AND nota < 70)::int AS riesgo,
            COUNT(*) FILTER (WHERE nota < 60)::int                AS criticas,
            COUNT(*) FILTER (WHERE nota >= 70)::int               AS aprobadas
       FROM calificacion`,
  );
  const r = rows[0] ?? {};
  return {
    total: r.total ?? 0,
    promedio: r.promedio != null ? Number(r.promedio) : null,
    excelentes: r.excelentes ?? 0,
    buenas: r.buenas ?? 0,
    riesgo: r.riesgo ?? 0,
    criticas: r.criticas ?? 0,
    aprobadas: r.aprobadas ?? 0,
  };
}

/**
 * Cursos en una forma ligera, para los desplegables del registro de notas.
 *
 * Deliberadamente más pobre que `listarCursos`: aquí no hacen falta cupo,
 * modalidad ni descripción, y arrastrarlos a un `<select>` es peso sin uso
 * (mismo criterio que `listarAsignables` en operaciones).
 */
/**
 * Quién puede figurar como docente de una materia o un curso.
 *
 * Todo el personal activo — todos los roles menos `estudiante`. La tentación
 * era limitarlo al rol `docente`, y los datos de la propia fundación dicen que
 * sería un error: el curso "Técnico en Contabilidad y Finanzas" lo imparte
 * quien lleva la contabilidad, no un docente de plantilla. En una institución
 * de este tamaño el rol dice de qué se ocupa alguien en el sistema, no si sabe
 * dar una clase.
 *
 * El único excluido es `estudiante`, porque ahí sí hay una regla: un becado no
 * imparte los cursos en los que se matricula.
 *
 * Quien no está aquí —un tallerista externo— se sigue escribiendo a mano en el
 * formulario: la relación es opcional a propósito (ver migración 0019).
 */
export async function docentesParaSelector(): Promise<
  { id: string; nombre: string }[]
> {
  const { rows } = await query(
    `SELECT u.id, u.nombre
       FROM usuario u
       JOIN rol r ON r.id = u.rol_id
      WHERE u.activo = TRUE
        AND r.nombre <> 'estudiante'
      ORDER BY u.nombre
      LIMIT 200`,
  );
  return rows as { id: string; nombre: string }[];
}

export async function cursosParaSelector(): Promise<{ id: string; nombre: string }[]> {
  const { rows } = await query(
    `SELECT id, nombre FROM curso WHERE estado = 'activo' ORDER BY nombre LIMIT 300`,
  );
  return rows as { id: string; nombre: string }[];
}

export async function historialDeEstudiante(
  estudianteId: string,
): Promise<HistorialCalificacion[]> {
  const { rows } = await query(
    `SELECT id, estudiante_id, cuatrimestre, materia, nota_numerica,
            nota_letra, gpa, estado
       FROM historial_calificacion
      WHERE estudiante_id = $1
      ORDER BY cuatrimestre DESC, materia`,
    [estudianteId],
  );
  return rows as HistorialCalificacion[];
}

/** GPA acumulado de un estudiante (promedio de gpa del historial). */
export async function gpaDeEstudiante(estudianteId: string): Promise<number | null> {
  const { rows } = await query(
    `SELECT ROUND(AVG(gpa)::numeric, 2) AS gpa
       FROM historial_calificacion WHERE estudiante_id = $1`,
    [estudianteId],
  );
  return rows[0]?.gpa != null ? Number(rows[0].gpa) : null;
}
