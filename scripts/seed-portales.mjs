/**
 * Datos de demostración de los portales por rol — ClickUp S6 · #395 y #400.
 *
 * El Portal Estudiante no se puede enseñar sin un estudiante: la base venía con
 * el usuario `estudiante@globaleffect.org` invitado pero sin expediente, y en
 * esas condiciones la pantalla solo puede mostrar su estado vacío ("todavía no
 * tienes expediente enlazado"), que es correcto pero no demuestra nada.
 *
 * Este script crea ese expediente y lo llena con lo justo para que las cuatro
 * piezas del portal tengan algo que decir:
 *
 *   • Historial de dos cuatrimestres, con notas en tres bandas distintas —una
 *     A, varias B y una en riesgo— para que el código de color se vea de
 *     verdad y no todo en verde.
 *   • Matrícula activa del período en curso, para el bloque de materias.
 *   • Registro de servicio de los últimos tres meses, con **un mes sin fila**
 *     a propósito: es el caso que distingue "no cumplió" de "nadie lo ha
 *     anotado", y sin él esa rama de la pantalla no se prueba nunca.
 *
 * Del lado del docente, la migración 0019 ya enlazó la materia "Introducción al
 * Liderazgo" con su usuario, pero ninguno de los dos cursos técnicos del
 * sembrado original es suyo —uno lo da un tallerista externo y el otro la
 * contabilidad— así que su lista de cursos saldría vacía. En vez de
 * reasignarle un curso ajeno, que sería falsear el dato, el script **añade uno
 * propio** con su matrícula y sus notas.
 *
 * Idempotente: borra y rehace solo lo suyo —el expediente que él mismo creó y
 * el curso marcado con `metadata->>'demo' = 'true'`—. No toca datos reales.
 *
 * Uso: npm run db:seed:portales
 */
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });

const EMAIL_ESTUDIANTE = "estudiante@globaleffect.org";
const EMAIL_DOCENTE = "docente@globaleffect.org";

/** Notas del curso de demostración: una excelente, una buena y una en riesgo. */
const NOTAS_CURSO = [
  [95, "examen", "Excelente dominio del direccionamiento IP."],
  [82, "proyecto", "Proyecto funcional; falta documentar la topología."],
  [64, "tarea", "Entrega incompleta; repasar subredes."],
];

/** Mes relativo a hoy, en formato YYYY-MM (el que usa `registro_servicio`). */
function mesAtras(n) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Historial de dos cuatrimestres.
 *
 * El GPA no se calcula aquí: la tabla lo guarda por fila porque es un registro
 * histórico y la escala de conversión puede cambiar de un año a otro (ver
 * `historial_calificacion` en la migración 0006). Va escrito, como en la
 * certificación de notas de la que se transcribe.
 */
const HISTORIAL = [
  // cuatrimestre, materia, nota, letra, gpa, estado
  ["2025-I", "Introducción al Liderazgo", 94.0, "A", 4.0, "aprobada"],
  ["2025-I", "Inglés como Segundo Idioma (Básico)", 87.5, "B", 3.0, "aprobada"],
  ["2025-I", "Matemática Básica", 78.0, "C", 2.0, "aprobada"],
  ["2025-II", "Inglés como Segundo Idioma (Intermedio)", 91.0, "A", 4.0, "aprobada"],
  ["2025-II", "Ofimática Aplicada", 83.0, "B", 3.0, "aprobada"],
  // La de riesgo: aprobada por poco, pero pinta la banda ámbar en la tabla.
  ["2025-II", "Contabilidad I", 66.0, "D", 1.0, "prueba_academica"],
];

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

try {
  const { rows: usuarios } = await db.query(
    `SELECT id, nombre FROM usuario WHERE email = $1`,
    [EMAIL_ESTUDIANTE],
  );
  if (usuarios.length === 0) {
    console.error(
      `! no existe el usuario ${EMAIL_ESTUDIANTE}. Ejecuta antes: npm run db:seed`,
    );
    process.exitCode = 1;
  } else {
    const usuario = usuarios[0];
    await db.query("BEGIN");

    // El expediente se busca por `usuario_id`, no por nombre: es el enlace real
    // y el que usa el portal.
    const { rows: existentes } = await db.query(
      `SELECT id FROM estudiante WHERE usuario_id = $1`,
      [usuario.id],
    );

    let estudianteId;
    if (existentes.length > 0) {
      estudianteId = existentes[0].id;
      // Las tres tablas hijas se rehacen enteras; `inscripcion` e
      // `historial_calificacion` no tienen marca de demo, así que el criterio
      // es "todo lo de este expediente", que es de este script.
      await db.query(`DELETE FROM historial_calificacion WHERE estudiante_id = $1`, [
        estudianteId,
      ]);
      await db.query(`DELETE FROM inscripcion WHERE estudiante_id = $1`, [estudianteId]);
      await db.query(`DELETE FROM registro_servicio WHERE estudiante_id = $1`, [
        estudianteId,
      ]);
    } else {
      const { rows } = await db.query(
        `INSERT INTO estudiante (nombre, email, tipo, estado, programa, universidad,
                                 fecha_ingreso, usuario_id)
         VALUES ($1, $2, 'becado', 'activo',
                 'Licenciatura en Contabilidad',
                 'Universidad Católica Tecnológica del Cibao',
                 CURRENT_DATE - INTERVAL '18 months', $3)
         RETURNING id`,
        [usuario.nombre, EMAIL_ESTUDIANTE, usuario.id],
      );
      estudianteId = rows[0].id;
    }

    for (const [cuatri, materia, nota, letra, gpa, estado] of HISTORIAL) {
      await db.query(
        `INSERT INTO historial_calificacion
           (estudiante_id, cuatrimestre, materia, nota_numerica, nota_letra, gpa, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [estudianteId, cuatri, materia, nota, letra, gpa, estado],
      );
    }

    // Matrícula del período en curso: todas las materias que tenga el catálogo
    // del período activo. Si no hay período activo, no se inscribe nada — es
    // preferible a inventar una matrícula en un cuatrimestre cerrado.
    const { rowCount: inscritas } = await db.query(
      `INSERT INTO inscripcion (estudiante_id, materia_id, periodo_id, estado)
       SELECT $1, m.id, m.periodo_id, 'activa'
         FROM materia m
         JOIN periodo p ON p.id = m.periodo_id
        WHERE m.estado = 'activa' AND p.estado = 'activo'
       ON CONFLICT (estudiante_id, materia_id, periodo_id) DO NOTHING`,
      [estudianteId],
    );

    // Tres meses: el más reciente completo, el anterior a medias y el de hace
    // dos meses SIN registrar (no se inserta) para probar esa rama.
    await db.query(
      `INSERT INTO registro_servicio (estudiante_id, mes, hizo_servicio, asistio_reunion, notas)
       VALUES ($1, $2, TRUE, TRUE, 'Jornada de limpieza en el centro comunitario.'),
              ($1, $3, TRUE, FALSE, 'Faltó a la reunión mensual por examen final.')`,
      [estudianteId, mesAtras(0), mesAtras(1)],
    );

    // ------------------------------------------------------------------
    // Portal Profesor: un curso propio del docente de demostración.
    // ------------------------------------------------------------------
    const { rows: docentes } = await db.query(
      `SELECT id, nombre FROM usuario WHERE email = $1`,
      [EMAIL_DOCENTE],
    );

    let notasCurso = 0;
    if (docentes.length > 0) {
      const docente = docentes[0];

      // `calificacion` cae en cascada al borrar el curso (FK ON DELETE CASCADE),
      // así que basta con borrar el curso de demostración.
      await db.query(`DELETE FROM curso WHERE metadata->>'demo' = 'true'`);

      const { rows: periodos } = await db.query(
        `SELECT id FROM periodo WHERE estado = 'activo' ORDER BY fecha_inicio DESC LIMIT 1`,
      );
      const periodoId = periodos[0]?.id ?? null;

      const { rows: cursos } = await db.query(
        `INSERT INTO curso (nombre, descripcion, docente, docente_usuario_id, periodo_id,
                            estado, capacidad, inscritos, horario, modalidad, metadata)
         VALUES ($1, $2, $3, $4, $5, 'activo', 18, 12, $6, 'presencial',
                 '{"demo":"true"}'::jsonb)
         RETURNING id`,
        [
          "Técnico en Redes y Ciberseguridad",
          "Fundamentos de redes, cableado estructurado y buenas prácticas de seguridad.",
          docente.nombre,
          docente.id,
          periodoId,
          "Sábados 8:00–12:00",
        ],
      );
      const cursoId = cursos[0].id;

      // Las notas necesitan período: `calificacion.periodo_id` es NOT NULL.
      if (periodoId) {
        for (const [nota, tipo, observaciones] of NOTAS_CURSO) {
          await db.query(
            `INSERT INTO calificacion (estudiante_id, curso_id, periodo_id, nota,
                                       tipo_evaluacion, observaciones)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [estudianteId, cursoId, periodoId, nota, tipo, observaciones],
          );
          notasCurso++;
        }
      }
    }

    await db.query("COMMIT");
    console.log(
      `✓ expediente de ${usuario.nombre}: ${HISTORIAL.length} notas de historial, ` +
        `${inscritas} materias inscritas y 2 de 3 meses registrados`,
    );
    console.log(
      docentes.length > 0
        ? `✓ curso de demostración para ${docentes[0].nombre} con ${notasCurso} notas`
        : `= sin usuario ${EMAIL_DOCENTE}: no se sembró el Portal Profesor`,
    );
  }
} catch (e) {
  await db.query("ROLLBACK").catch(() => {});
  console.error("! error sembrando los portales:", e.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
