/**
 * Server Actions (escritura) del dominio Estudiantes. Cada acción exige el
 * permiso correspondiente con `requirePermission` antes de validar y escribir.
 */
"use server";

import { revalidatePath } from "next/cache";
import { query, transaction } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import { CrearEstudiante, CrearExpediente } from "./schema";

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
         nacionalidad, genero, religion, tipo, estado, programa, donde_estudia,
         universidad, fecha_ingreso, centro_educativo, facilitador_habitudes,
         breve_historia_habitudes, notas_adicionales
       ) VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8::genero, $9, $10::tipo_estudiante, $11::estado_estudiante, $12, $13,
         $14, $15, $16, $17,
         $18, $19
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
        d.religion,
        d.tipo,
        d.estado,
        d.programa,
        d.donde_estudia,
        d.universidad,
        d.fecha_ingreso,
        d.centro_educativo,
        d.facilitador_habitudes,
        d.breve_historia_habitudes,
        d.notas_adicionales,
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
