/**
 * Server Actions (escritura) del dominio Estudiantes. Cada acción exige el
 * permiso correspondiente con `requirePermission` antes de validar y escribir.
 */
"use server";

import { revalidatePath } from "next/cache";
import { query, transaction } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import { obtenerExpedienteCompleto } from "./queries";
import { notasPorCuatrimestre } from "@/server/portales/queries";
import {
  ActualizarExpediente,
  CrearEstudiante,
  CrearExpediente,
  EliminarExpediente,
} from "./schema";

/**
 * Crea un expediente con lo mínimo (alta rápida). Requiere
 * `expedientes.escribir`. Para la ficha completa, ver `crearExpediente`.
 */
export async function crearEstudiante(input: unknown): Promise<string> {
  await requirePermission("expedientes.escribir");

  const data = CrearEstudiante.parse(input);
  const { rows } = await query(
    `INSERT INTO estudiante (nombre, cedula, email, telefono, tipo, programa)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      data.nombre,
      data.cedula || null,
      data.email || null,
      data.telefono || null,
      data.tipo,
      data.programa || null,
    ],
  );

  revalidatePath("/expedientes");
  return rows[0].id as string;
}

/**
 * Crea el expediente completo: núcleo + familiares + los tres perfiles.
 *
 * Todo va en UNA transacción. Si falla el perfil de salud después de haber
 * insertado al estudiante y a su familia, lo correcto es no dejar nada: un
 * expediente a medias no avisa de que está incompleto y el personal lo daría
 * por bueno. Ver `transaction()` en lib/db.ts.
 *
 * Los perfiles se insertan solo si traen algún dato. Una fila de vivienda con
 * los doce campos en NULL no es información, es ruido que luego se lee como
 * "ya se levantó la ficha de vivienda".
 */
export async function crearExpediente(input: unknown): Promise<string> {
  await requirePermission("expedientes.escribir");
  const d = CrearExpediente.parse(input);

  const id = await transaction(async (q) => {
    const { rows } = await q(
      `INSERT INTO estudiante (
         nombre, cedula, email, telefono, fecha_nacimiento, lugar_nacimiento,
         nacionalidad, genero, sexo_documento, religion, tipo, estado, programa,
         donde_estudia, universidad, fecha_ingreso, centro_educativo,
         director_centro, facilitador_habitudes, breve_historia_habitudes,
         notas_adicionales, amonestaciones, solicitudes_pendientes,
         envio_correo_patrocinador, asistio_reunion_mensual
       ) VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8::genero, $9, $10, $11::tipo_estudiante, $12::estado_estudiante, $13,
         $14, $15, $16, $17,
         $18, $19, $20,
         $21, $22, $23,
         $24, $25
       ) RETURNING id`,
      [
        d.nombre,
        d.cedula,
        d.email,
        d.telefono,
        d.fecha_nacimiento,
        d.lugar_nacimiento,
        d.nacionalidad,
        d.genero,
        d.sexo_documento,
        d.religion,
        d.tipo,
        d.estado,
        d.programa,
        d.donde_estudia,
        d.universidad,
        d.fecha_ingreso,
        d.centro_educativo,
        d.director_centro,
        d.facilitador_habitudes,
        d.breve_historia_habitudes,
        d.notas_adicionales,
        d.amonestaciones,
        d.solicitudes_pendientes,
        d.envio_correo_patrocinador,
        d.asistio_reunion_mensual,
      ],
    );
    const estudianteId = rows[0].id as string;

    for (const f of d.familiares) {
      await q(
        `INSERT INTO familiar (estudiante_id, parentesco, nombre, edad, telefono, profesion)
         VALUES ($1, $2::parentesco, $3, $4, $5, $6)`,
        [estudianteId, f.parentesco, f.nombre, f.edad, f.telefono, f.profesion],
      );
    }

    const v = d.vivienda;
    if (v && Object.values(v).some((x) => x !== null && x !== undefined)) {
      await q(
        `INSERT INTO perfil_vivienda (
           estudiante_id, con_quien_vive, por_que_vive_con_esa_persona,
           hermanos_cantidad, casa_propia, tipo_casa, bano_dentro,
           habitaciones, camas, quienes_duermen_cama, direccion, comunidad,
           ciudad_residencia
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          estudianteId,
          v.con_quien_vive,
          v.por_que_vive_con_esa_persona,
          v.hermanos_cantidad,
          v.casa_propia,
          v.tipo_casa,
          v.bano_dentro,
          v.habitaciones,
          v.camas,
          v.quienes_duermen_cama,
          v.direccion,
          v.comunidad,
          v.ciudad_residencia,
        ],
      );
    }

    const s = d.salud;
    if (s && Object.values(s).some((x) => x !== null && x !== undefined)) {
      await q(
        `INSERT INTO perfil_salud (
           estudiante_id, enfermedades, alergias,
           contacto_emergencia_nombre, contacto_emergencia_telefono
         ) VALUES ($1, $2, $3, $4, $5)`,
        [
          estudianteId,
          s.enfermedades,
          s.alergias,
          s.contacto_emergencia_nombre,
          s.contacto_emergencia_telefono,
        ],
      );
    }

    const e = d.socioeconomico;
    if (e && Object.values(e).some((x) => x !== null && x !== undefined)) {
      await q(
        `INSERT INTO perfil_socioeconomico (
           estudiante_id, historia_de_vida, situacion_familiar,
           situacion_economica, motivo_beca, metas_academicas
         ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          estudianteId,
          e.historia_de_vida,
          e.situacion_familiar,
          e.situacion_economica,
          e.motivo_beca,
          e.metas_academicas,
        ],
      );
    }

    return estudianteId;
  });

  revalidatePath("/expedientes");
  revalidatePath("/dashboard");
  return id;
}

// ---------------------------------------------------------------------------
// Edición y borrado — ClickUp S5 · #357
// ---------------------------------------------------------------------------

/**
 * Actualiza el expediente completo: núcleo + familiares + los tres perfiles.
 *
 * En una sola transacción, por lo mismo que el alta: media ficha guardada no
 * avisa de que está a medias y el personal la daría por buena.
 *
 * **Los familiares se reemplazan enteros.** El formulario es dueño de la lista
 * —se añaden y se quitan filas ahí mismo— así que casarlas una a una por id
 * para decidir qué actualizar, qué insertar y qué borrar solo añadiría formas
 * de equivocarse. Se borran y se vuelven a insertar dentro de la transacción,
 * que desde fuera es indistinguible y no puede quedar a medio camino.
 *
 * **Los perfiles se insertan, se actualizan o se borran** según traigan datos o
 * no. Ese último caso importa: si alguien vacía la ficha de vivienda, la fila
 * tiene que desaparecer, no quedarse con doce NULL. Una fila vacía se lee luego
 * como "ya se levantó la ficha", que es justo lo contrario de lo que pasó
 * (mismo criterio que en `crearExpediente`).
 */
export async function actualizarExpediente(input: unknown): Promise<void> {
  await requirePermission("expedientes.escribir");
  const d = ActualizarExpediente.parse(input);

  await transaction(async (q) => {
    await q(
      `UPDATE estudiante SET
         nombre = $2, cedula = $3, email = $4, telefono = $5,
         fecha_nacimiento = $6, lugar_nacimiento = $7, nacionalidad = $8,
         genero = $9::genero, sexo_documento = $10, religion = $11,
         tipo = $12::tipo_estudiante, estado = $13::estado_estudiante,
         programa = $14, donde_estudia = $15, universidad = $16,
         fecha_ingreso = $17, centro_educativo = $18, director_centro = $19,
         facilitador_habitudes = $20, breve_historia_habitudes = $21,
         notas_adicionales = $22, amonestaciones = $23,
         solicitudes_pendientes = $24, envio_correo_patrocinador = $25,
         asistio_reunion_mensual = $26
       WHERE id = $1`,
      [
        d.id,
        d.nombre,
        d.cedula,
        d.email,
        d.telefono,
        d.fecha_nacimiento,
        d.lugar_nacimiento,
        d.nacionalidad,
        d.genero,
        d.sexo_documento,
        d.religion,
        d.tipo,
        d.estado,
        d.programa,
        d.donde_estudia,
        d.universidad,
        d.fecha_ingreso,
        d.centro_educativo,
        d.director_centro,
        d.facilitador_habitudes,
        d.breve_historia_habitudes,
        d.notas_adicionales,
        d.amonestaciones,
        d.solicitudes_pendientes,
        d.envio_correo_patrocinador,
        d.asistio_reunion_mensual,
      ],
    );

    await q(`DELETE FROM familiar WHERE estudiante_id = $1`, [d.id]);
    for (const f of d.familiares) {
      await q(
        `INSERT INTO familiar (estudiante_id, parentesco, nombre, edad, telefono, profesion)
         VALUES ($1, $2::parentesco, $3, $4, $5, $6)`,
        [d.id, f.parentesco, f.nombre, f.edad, f.telefono, f.profesion],
      );
    }

    /** ¿Trae algún dato de verdad, o son todos los campos vacíos? */
    const tieneAlgo = (o: object | undefined) =>
      o !== undefined && Object.values(o).some((x) => x !== null && x !== undefined);

    const v = d.vivienda;
    if (tieneAlgo(v)) {
      await q(
        `INSERT INTO perfil_vivienda (
           estudiante_id, con_quien_vive, por_que_vive_con_esa_persona,
           hermanos_cantidad, casa_propia, tipo_casa, bano_dentro,
           habitaciones, camas, quienes_duermen_cama, direccion, comunidad,
           ciudad_residencia
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (estudiante_id) DO UPDATE SET
           con_quien_vive = EXCLUDED.con_quien_vive,
           por_que_vive_con_esa_persona = EXCLUDED.por_que_vive_con_esa_persona,
           hermanos_cantidad = EXCLUDED.hermanos_cantidad,
           casa_propia = EXCLUDED.casa_propia,
           tipo_casa = EXCLUDED.tipo_casa,
           bano_dentro = EXCLUDED.bano_dentro,
           habitaciones = EXCLUDED.habitaciones,
           camas = EXCLUDED.camas,
           quienes_duermen_cama = EXCLUDED.quienes_duermen_cama,
           direccion = EXCLUDED.direccion,
           comunidad = EXCLUDED.comunidad,
           ciudad_residencia = EXCLUDED.ciudad_residencia`,
        [
          d.id,
          v!.con_quien_vive,
          v!.por_que_vive_con_esa_persona,
          v!.hermanos_cantidad,
          v!.casa_propia,
          v!.tipo_casa,
          v!.bano_dentro,
          v!.habitaciones,
          v!.camas,
          v!.quienes_duermen_cama,
          v!.direccion,
          v!.comunidad,
          v!.ciudad_residencia,
        ],
      );
    } else {
      await q(`DELETE FROM perfil_vivienda WHERE estudiante_id = $1`, [d.id]);
    }

    const s = d.salud;
    if (tieneAlgo(s)) {
      await q(
        `INSERT INTO perfil_salud (
           estudiante_id, enfermedades, alergias,
           contacto_emergencia_nombre, contacto_emergencia_telefono
         ) VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (estudiante_id) DO UPDATE SET
           enfermedades = EXCLUDED.enfermedades,
           alergias = EXCLUDED.alergias,
           contacto_emergencia_nombre = EXCLUDED.contacto_emergencia_nombre,
           contacto_emergencia_telefono = EXCLUDED.contacto_emergencia_telefono`,
        [
          d.id,
          s!.enfermedades,
          s!.alergias,
          s!.contacto_emergencia_nombre,
          s!.contacto_emergencia_telefono,
        ],
      );
    } else {
      await q(`DELETE FROM perfil_salud WHERE estudiante_id = $1`, [d.id]);
    }

    const e = d.socioeconomico;
    if (tieneAlgo(e)) {
      await q(
        `INSERT INTO perfil_socioeconomico (
           estudiante_id, historia_de_vida, situacion_familiar,
           situacion_economica, motivo_beca, metas_academicas
         ) VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (estudiante_id) DO UPDATE SET
           historia_de_vida = EXCLUDED.historia_de_vida,
           situacion_familiar = EXCLUDED.situacion_familiar,
           situacion_economica = EXCLUDED.situacion_economica,
           motivo_beca = EXCLUDED.motivo_beca,
           metas_academicas = EXCLUDED.metas_academicas`,
        [
          d.id,
          e!.historia_de_vida,
          e!.situacion_familiar,
          e!.situacion_economica,
          e!.motivo_beca,
          e!.metas_academicas,
        ],
      );
    } else {
      await q(`DELETE FROM perfil_socioeconomico WHERE estudiante_id = $1`, [d.id]);
    }
  });

  revalidatePath("/expedientes");
  revalidatePath(`/expedientes/${d.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/portal/estudiante");
}

/**
 * Resultado de borrar un expediente. Mismo criterio que en Académico: lo
 * esperable viaja como dato porque Next.js oculta en producción el mensaje de
 * un error no controlado de una Server Action.
 */
export type ResultadoEliminarExpediente =
  | { ok: true }
  | { ok: false; motivo: "en_uso"; dependencias: { clave: string; total: number }[] };

/**
 * Elimina un expediente, y **se niega si el joven tiene vida registrada**.
 *
 * Aquí la distinción es más fina que en el catálogo Académico. Un expediente
 * tiene siempre tablas hijas —familiares, vivienda, salud, situación— pero esas
 * *son* el expediente: se van con él y está bien que se vayan. Lo que no puede
 * irse en un `DELETE` es lo que otros módulos registraron sobre esa persona: sus
 * notas, su matrícula, sus citas de psicología, su servicio comunitario. Todas
 * esas FK son `ON DELETE CASCADE`, así que borrar al estudiante las arrastra sin
 * preguntar, y eso no es corregir un error de tecleo: es hacer desaparecer el
 * paso de un joven por la fundación.
 *
 * Para eso está `estado`: `inactivo`, `graduado` o `suspendido` sacan a la
 * persona del trabajo diario sin perder una sola fila. El borrado queda para lo
 * único que de verdad se borra — el expediente abierto por equivocación, que
 * todavía no tiene nada colgando.
 *
 * Exige `expedientes.eliminar`, que en `db/seed.sql` solo tiene `super_admin`.
 */
export async function eliminarExpediente(
  input: unknown,
): Promise<ResultadoEliminarExpediente> {
  await requirePermission("expedientes.eliminar");
  const { id } = EliminarExpediente.parse(input);

  const dependencias: { clave: string; sql: string }[] = [
    { clave: "enrollments", sql: `SELECT COUNT(*)::int AS total FROM inscripcion WHERE estudiante_id = $1` },
    { clave: "grades", sql: `SELECT COUNT(*)::int AS total FROM calificacion WHERE estudiante_id = $1` },
    { clave: "history", sql: `SELECT COUNT(*)::int AS total FROM historial_calificacion WHERE estudiante_id = $1` },
    { clave: "appointments", sql: `SELECT COUNT(*)::int AS total FROM cita_psicologia WHERE estudiante_id = $1` },
    { clave: "notes", sql: `SELECT COUNT(*)::int AS total FROM nota_psicologica WHERE estudiante_id = $1` },
    { clave: "service", sql: `SELECT COUNT(*)::int AS total FROM registro_servicio WHERE estudiante_id = $1` },
  ];

  const conteos = (
    await Promise.all(
      dependencias.map(async ({ clave, sql }) => ({
        clave,
        total: Number((await query(sql, [id])).rows[0]?.total ?? 0),
      })),
    )
  ).filter((c) => c.total > 0);

  if (conteos.length > 0) {
    return { ok: false, motivo: "en_uso", dependencias: conteos };
  }

  // Las tablas hijas del propio expediente (familiar, perfil_*) caen en cascada:
  // son parte de la ficha, no registros de otros módulos.
  await query(`DELETE FROM estudiante WHERE id = $1`, [id]);

  revalidatePath("/expedientes");
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Carga el expediente completo bajo demanda, para el diálogo que se abre desde
 * Psicología.
 *
 * Es una lectura, pero vive aquí y no en `queries.ts` porque el cliente la
 * invoca al pulsar: una Server Action es la única forma de que el navegador
 * pida datos sin exponer la consulta ni montar un endpoint propio. El permiso
 * se comprueba igual que en las escrituras — `expedientes.leer`, el que tiene
 * el rol `psicologo`.
 *
 * Devuelve el expediente y las notas por cuatrimestre juntas: el diálogo las
 * necesita a la vez y así el usuario paga una sola espera.
 */
export async function cargarExpedienteParaDialogo(estudianteId: string) {
  await requirePermission("expedientes.leer");
  const [expediente, cuatrimestres] = await Promise.all([
    obtenerExpedienteCompleto(estudianteId),
    notasPorCuatrimestre(estudianteId).catch(() => []),
  ]);
  return { expediente, cuatrimestres };
}
