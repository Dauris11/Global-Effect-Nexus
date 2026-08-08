/**
 * Consultas de los portales por rol — ClickUp S6 · #395 y #400.
 *
 * Todo lo de aquí está recortado a **una persona**: el estudiante o el docente
 * que tiene la sesión abierta. Por eso ninguna función recibe un filtro libre
 * ni un `buscar` — reciben el id de quien pregunta, y ese id sale siempre de
 * `currentUser()` en el servidor, nunca de la URL.
 *
 * Esa es la diferencia de fondo con `server/academico/queries.ts`: allí las
 * consultas responden "cómo va la fundación" y exigen `academico.leer`; aquí
 * responden "cómo voy yo", y el permiso es ser el dueño de la fila.
 */
import { query } from "@/lib/db";
import type {
  CondicionEnLaFundacion,
  CuatrimestreDelEstudiante,
  CursoDelDocente,
  EstudianteDelUsuario,
  EventoDelPortal,
  MateriaDelDocente,
  MateriaDelEstudiante,
  MesDeCondicion,
  NotaDelEstudiante,
  ResumenDelDocente,
  ResumenDelEstudiante,
} from "./types";

// ---------------------------------------------------------------------------
// Portal Estudiante — #395
// ---------------------------------------------------------------------------

/**
 * El expediente que corresponde a un usuario, si lo hay.
 *
 * El enlace es `estudiante.usuario_id` (migración 0005), no el email: un joven
 * puede cambiar de correo y su expediente no debe dejar de ser suyo por eso.
 *
 * Devuelve `null` cuando el usuario tiene rol `estudiante` pero todavía nadie
 * le ha enlazado un expediente. Es un caso real —se invita al usuario antes de
 * terminar de armar la ficha— y la pantalla lo trata como tal, no como error.
 */
export async function estudianteDelUsuario(
  usuarioId: string,
): Promise<EstudianteDelUsuario | null> {
  const { rows } = await query(
    `SELECT id, nombre, tipo, estado, programa, universidad, donde_estudia,
            to_char(fecha_ingreso, 'YYYY-MM-DD') AS fecha_ingreso
       FROM estudiante
      WHERE usuario_id = $1
      LIMIT 1`,
    [usuarioId],
  );
  return (rows[0] as EstudianteDelUsuario) ?? null;
}

/**
 * Cifras del banner del estudiante (#396).
 *
 * Las dos mitades vienen de tablas distintas y no se pueden juntar en una sola
 * consulta sin inflar los conteos: el historial tiene una fila por materia
 * cursada y la matrícula una por materia en curso, así que un `JOIN` entre
 * ambas multiplicaría las filas (el *fan-out* clásico). Van por separado y se
 * unen en TypeScript, que es donde no cuesta nada.
 */
export async function resumenDelEstudiante(
  estudianteId: string,
): Promise<ResumenDelEstudiante> {
  const [historial, matricula] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS cursadas,
              ROUND(AVG(gpa)::numeric, 2)           AS gpa,
              ROUND(AVG(nota_numerica)::numeric, 1) AS promedio,
              COUNT(*) FILTER (WHERE estado = 'aprobada')::int         AS aprobadas,
              COUNT(*) FILTER (WHERE estado = 'reprobada')::int        AS reprobadas,
              COUNT(*) FILTER (WHERE estado = 'prueba_academica')::int AS en_prueba
         FROM historial_calificacion
        WHERE estudiante_id = $1`,
      [estudianteId],
    ),
    query(
      `SELECT COUNT(*)::int AS activas,
              COALESCE(SUM(m.creditos), 0)::int AS creditos_activos
         FROM inscripcion i
         JOIN materia m ON m.id = i.materia_id
        WHERE i.estudiante_id = $1 AND i.estado = 'activa'`,
      [estudianteId],
    ),
  ]);

  const h = historial.rows[0] ?? {};
  const m = matricula.rows[0] ?? {};
  return {
    gpa: h.gpa != null ? Number(h.gpa) : null,
    promedio: h.promedio != null ? Number(h.promedio) : null,
    cursadas: h.cursadas ?? 0,
    aprobadas: h.aprobadas ?? 0,
    reprobadas: h.reprobadas ?? 0,
    en_prueba: h.en_prueba ?? 0,
    activas: m.activas ?? 0,
    creditos_activos: m.creditos_activos ?? 0,
  };
}

/**
 * Las materias que el estudiante tiene inscritas (#397).
 *
 * El corte es `inscripcion.estado = 'activa'` y nada más. La tentación era
 * añadir "y que el período no haya terminado", y sería un error: el ciclo de
 * vida ya vive en el estado —al cerrar el cuatrimestre la coordinación pasa
 * cada inscripción a aprobada o reprobada— y una fecha por encima haría
 * desaparecer de la pantalla del joven justo las materias que siguen abiertas
 * porque todavía nadie las ha cerrado. El día que más necesita verlas.
 *
 * Se ordena por período descendente para que, si algo así ocurre, lo vigente
 * quede arriba.
 */
export async function materiasDelEstudiante(
  estudianteId: string,
): Promise<MateriaDelEstudiante[]> {
  const { rows } = await query(
    `SELECT i.id AS inscripcion_id, i.estado,
            m.id AS materia_id, m.nombre, m.codigo, m.creditos,
            m.profesor_nombre, m.horario, m.aula,
            p.nombre AS periodo_nombre
       FROM inscripcion i
       JOIN materia m ON m.id = i.materia_id
       JOIN periodo p ON p.id = i.periodo_id
      WHERE i.estudiante_id = $1
        AND i.estado = 'activa'
      ORDER BY p.fecha_inicio DESC, m.nombre`,
    [estudianteId],
  );
  return rows as MateriaDelEstudiante[];
}

/**
 * El historial del estudiante agrupado por cuatrimestre (#397).
 *
 * Se trae plano y se agrupa en TypeScript, en vez de pedirle a Postgres un
 * `json_agg` por cuatrimestre: son decenas de filas por persona, el coste es
 * nulo, y así la consulta se lee de un vistazo y el tipado no depende de la
 * forma de un JSON construido en SQL.
 *
 * El orden es del cuatrimestre más reciente al más antiguo porque el formato
 * `AAAA-N` ('2025-I', '2025-II') ordena bien como texto.
 */
export async function notasPorCuatrimestre(
  estudianteId: string,
): Promise<CuatrimestreDelEstudiante[]> {
  const { rows } = await query(
    `SELECT id, cuatrimestre, materia, nota_numerica, nota_letra, gpa, estado
       FROM historial_calificacion
      WHERE estudiante_id = $1
      ORDER BY cuatrimestre DESC, materia`,
    [estudianteId],
  );

  const porCuatrimestre = new Map<string, NotaDelEstudiante[]>();
  for (const r of rows) {
    const nota: NotaDelEstudiante = {
      id: r.id,
      materia: r.materia,
      // NUMERIC llega como cadena desde el driver: sin Number(), la banda de
      // color (`>= 90`) compararía texto contra número.
      nota_numerica: Number(r.nota_numerica),
      nota_letra: r.nota_letra,
      gpa: Number(r.gpa),
      estado: r.estado,
    };
    const lista = porCuatrimestre.get(r.cuatrimestre);
    if (lista) lista.push(nota);
    else porCuatrimestre.set(r.cuatrimestre, [nota]);
  }

  return [...porCuatrimestre.entries()].map(([cuatrimestre, notas]) => ({
    cuatrimestre,
    notas,
    gpa: promedio(notas.map((n) => n.gpa), 2),
    promedio: promedio(notas.map((n) => n.nota_numerica), 1),
  }));
}

/** Media redondeada de una lista; `null` si está vacía. */
function promedio(valores: number[], decimales: number): number | null {
  if (valores.length === 0) return null;
  const suma = valores.reduce((a, b) => a + b, 0);
  const factor = 10 ** decimales;
  return Math.round((suma / valores.length) * factor) / factor;
}

/**
 * Condición del estudiante en la fundación: servicio y reunión de los últimos
 * tres meses (#398).
 *
 * Los tres meses se generan en SQL y el registro se cuelga con `LEFT JOIN`, en
 * vez de listar solo las filas que existen. La diferencia importa: un mes sin
 * fila no es un mes en blanco que se pueda omitir, es un mes **sin registrar**,
 * y omitirlo haría que un joven con dos meses sin anotar pareciera al día.
 * Por eso cada mes viaja con su bandera `registrado`.
 */
export async function condicionEnLaFundacion(
  estudianteId: string,
): Promise<CondicionEnLaFundacion> {
  const { rows } = await query(
    `WITH meses AS (
       SELECT to_char(date_trunc('month', CURRENT_DATE) - (n || ' month')::interval,
                      'YYYY-MM') AS mes
         FROM generate_series(0, 2) AS n
     )
     SELECT ms.mes,
            COALESCE(r.hizo_servicio, FALSE)   AS hizo_servicio,
            COALESCE(r.asistio_reunion, FALSE) AS asistio_reunion,
            r.notas,
            (r.id IS NOT NULL)                 AS registrado
       FROM meses ms
       LEFT JOIN registro_servicio r
              ON r.mes = ms.mes AND r.estudiante_id = $1
      ORDER BY ms.mes DESC`,
    [estudianteId],
  );

  const meses = rows as MesDeCondicion[];
  return {
    meses,
    servicios: meses.filter((m) => m.hizo_servicio).length,
    reuniones: meses.filter((m) => m.asistio_reunion).length,
    de: meses.length,
  };
}

/**
 * Próximos eventos del calendario institucional (#399).
 *
 * Es la agenda de la fundación, no una agenda personal: `evento` no tiene
 * destinatarios, así que no hay a quién filtrar. Se excluyen los cancelados
 * —un evento cancelado en una lista de "próximos" hace que alguien se presente
 * a la puerta— y se ordena por fecha y hora.
 *
 * `excluirTipos` está por el Portal Estudiante. La tabla no distingue eventos
 * internos de eventos abiertos, y sin ese recorte al joven le aparecen cosas
 * como "auditoría interna de inventario": ruido en su pantalla y un detalle de
 * operación interna que no le corresponde. El recorte va aquí, y no en la
 * pantalla, para que la consulta no traiga lo que después se va a tirar.
 */
export async function proximosEventosDelPortal(
  limite = 5,
  excluirTipos: string[] = [],
): Promise<EventoDelPortal[]> {
  const { rows } = await query(
    `SELECT id, titulo, tipo, hora_inicio, ubicacion,
            to_char(fecha, 'YYYY-MM-DD') AS fecha
       FROM evento
      WHERE fecha >= CURRENT_DATE
        AND estado <> 'cancelado'
        AND NOT (tipo = ANY($2::text[]))
      ORDER BY fecha, hora_inicio NULLS LAST
      LIMIT $1`,
    [limite, excluirTipos],
  );
  return rows as EventoDelPortal[];
}

/**
 * Próximas asignaciones del Aula Virtual (#LMS).
 * NOTA: Esta función utiliza datos simulados temporales para el prototipo 
 * hasta que se aplique la migración 0021_aula_virtual.sql.
 */
export async function proximasAsignacionesDelEstudiante(
  estudianteId: string,
): Promise<import('./types').AsignacionDelEstudiante[]> {
  // Simulamos datos de asignaciones. En producción se hará un query a la tabla `asignacion` 
  // cruzada con `entrega_estudiante` y `inscripcion`.
  const now = new Date();
  
  // Tarea que vence hoy
  const today = new Date();
  
  // Tarea en 3 días
  const in3Days = new Date();
  in3Days.setDate(now.getDate() + 3);

  // Material (sin fecha límite)
  // Entregadas...

  return [
    {
      id: "a1",
      materia_id: "m1",
      materia_nombre: "Estructura de Datos",
      materia_codigo: "ISC-215",
      titulo: "Tarea 4 · Árboles binarios de búsqueda",
      descripcion: "Implementa inserción, eliminación y recorrido in-order de un BST en el lenguaje visto en clase. Sube tu código como .zip o enlace a repositorio.",
      tipo: "tarea",
      fecha_vencimiento: today.toISOString(),
      estado_entrega: "pendiente",
      calificacion: null,
    },
    {
      id: "a2",
      materia_id: "m2",
      materia_nombre: "Bases de Datos II",
      materia_codigo: "ISC-233",
      titulo: "Informe de normalización",
      descripcion: "Realiza el proceso de normalización hasta 3NF para el caso de estudio dado.",
      tipo: "tarea",
      fecha_vencimiento: in3Days.toISOString(),
      estado_entrega: "pendiente",
      calificacion: null,
    },
    {
      id: "a3",
      materia_id: "m1",
      materia_nombre: "Estructura de Datos",
      materia_codigo: "ISC-215",
      titulo: "Segundo parcial",
      descripcion: "Cubre listas enlazadas, pilas, colas y árboles. Modalidad presencial, dura 90 minutos. Trae tu carnet estudiantil.",
      tipo: "examen",
      fecha_vencimiento: in3Days.toISOString(),
      estado_entrega: "pendiente",
      calificacion: null,
    },
    {
      id: "a4",
      materia_id: "m1",
      materia_nombre: "Estructura de Datos",
      materia_codigo: "ISC-215",
      titulo: "Slides · Árboles balanceados (AVL)",
      descripcion: "",
      tipo: "material",
      fecha_vencimiento: null,
      estado_entrega: null,
      calificacion: null,
    },
    {
      id: "a5",
      materia_id: "m1",
      materia_nombre: "Estructura de Datos",
      materia_codigo: "ISC-215",
      titulo: "Tarea 3 · Pilas y colas",
      descripcion: "",
      tipo: "tarea",
      fecha_vencimiento: null,
      estado_entrega: "entregado",
      calificacion: null,
    },
    {
      id: "a6",
      materia_id: "m1",
      materia_nombre: "Estructura de Datos",
      materia_codigo: "ISC-215",
      titulo: "Tarea 2 · Listas enlazadas",
      descripcion: "Buena implementación de la lista doble. Te faltó manejar el caso de eliminar el único nodo — revísalo antes del parcial.",
      tipo: "tarea",
      fecha_vencimiento: null,
      estado_entrega: "calificado",
      calificacion: 92,
    }
  ];
}

// ---------------------------------------------------------------------------
// Portal Profesor — #400
// ---------------------------------------------------------------------------

/**
 * Cifras del banner del docente (#401).
 *
 * "Suyo" se decide por `docente_usuario_id` / `profesor_usuario_id` (migración
 * 0019) y nunca por el nombre en texto: comparar cadenas le enseñaría a un
 * homónimo los cursos de otra persona. Un docente cuyos cursos aún no estén
 * enlazados ve ceros — y eso es correcto, porque significa exactamente que la
 * coordinación todavía no le ha asignado nada en el sistema.
 *
 * Las notas se cuentan sobre los cursos del docente, no sobre las que él
 * registró: `calificacion` no guarda autor, y "cuántas notas hay en mis cursos"
 * es de todos modos la pregunta útil para saber qué falta por evaluar.
 */
export async function resumenDelDocente(usuarioId: string): Promise<ResumenDelDocente> {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM curso
         WHERE docente_usuario_id = $1 AND estado = 'activo')::int AS cursos_activos,
       (SELECT COALESCE(SUM(inscritos), 0) FROM curso
         WHERE docente_usuario_id = $1 AND estado = 'activo')::int AS inscritos,
       (SELECT COUNT(*) FROM calificacion cal
          JOIN curso c ON c.id = cal.curso_id
         WHERE c.docente_usuario_id = $1)::int                     AS notas,
       (SELECT COUNT(*) FROM materia
         WHERE profesor_usuario_id = $1 AND estado = 'activa')::int AS materias`,
    [usuarioId],
  );
  const r = rows[0] ?? {};
  return {
    cursos_activos: r.cursos_activos ?? 0,
    inscritos: r.inscritos ?? 0,
    notas: r.notas ?? 0,
    materias: r.materias ?? 0,
  };
}

/**
 * Los cursos del docente (#402).
 *
 * Trae también los finalizados y los planificados, ordenados con los activos
 * primero: un docente necesita llegar al curso que acaba de cerrar para repasar
 * notas, y esconderlo obligaría a salir del portal a buscarlo en el catálogo.
 *
 * `notas` y `promedio` van por subconsulta escalar y no por `JOIN` + `GROUP BY`
 * para no arrastrar el `GROUP BY` a todas las columnas del curso.
 */
export async function cursosDelDocente(usuarioId: string): Promise<CursoDelDocente[]> {
  const { rows } = await query(
    `SELECT c.id, c.nombre, c.descripcion, c.estado, c.modalidad,
            c.capacidad, c.inscritos, c.horario,
            p.nombre AS periodo_nombre,
            (SELECT COUNT(*) FROM calificacion WHERE curso_id = c.id)::int AS notas,
            (SELECT ROUND(AVG(nota)::numeric, 1) FROM calificacion WHERE curso_id = c.id)
              AS promedio
       FROM curso c
       LEFT JOIN periodo p ON p.id = c.periodo_id
      WHERE c.docente_usuario_id = $1
      ORDER BY (c.estado = 'activo') DESC, c.nombre
      LIMIT 100`,
    [usuarioId],
  );
  return rows.map((r) => ({
    ...r,
    promedio: r.promedio != null ? Number(r.promedio) : null,
  })) as CursoDelDocente[];
}

/** Las materias del catálogo a nombre del docente, con su matrícula activa. */
export async function materiasDelDocente(
  usuarioId: string,
): Promise<MateriaDelDocente[]> {
  const { rows } = await query(
    `SELECT m.id, m.nombre, m.codigo, m.creditos, m.estado, m.horario, m.aula,
            p.nombre AS periodo_nombre,
            (SELECT COUNT(*) FROM inscripcion
              WHERE materia_id = m.id AND estado = 'activa')::int AS inscritos
       FROM materia m
       LEFT JOIN periodo p ON p.id = m.periodo_id
      WHERE m.profesor_usuario_id = $1
      ORDER BY (m.estado = 'activa') DESC, m.nombre
      LIMIT 100`,
    [usuarioId],
  );
  return rows as MateriaDelDocente[];
}
