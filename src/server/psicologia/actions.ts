/**
 * Server Actions del dominio Psicología. Citas y notas exigen
 * `psicologia.escribir`. La solicitud de cita por el estudiante crea un
 * registro `programada` sin exponer datos confidenciales.
 */
"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { CrearCita, CrearNota, SolicitarCita } from "./schema";

export async function crearCita(input: unknown): Promise<string> {
  const user = await requirePermission("psicologia.escribir");
  const d = CrearCita.parse(input);
  const { rows } = await query(
    `INSERT INTO cita_psicologia (estudiante_id, psicologo_id, tipo_registro, fecha,
                                  hora, nivel_confidencialidad, riesgos)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      d.estudiante_id,
      user.id,
      d.tipo_registro,
      d.fecha,
      d.hora || null,
      d.nivel_confidencialidad,
      d.riesgos || null,
    ],
  );
  revalidatePath("/psicologia");
  return rows[0].id as string;
}

export async function crearNota(input: unknown): Promise<string> {
  const user = await requirePermission("psicologia.escribir");
  const d = CrearNota.parse(input);
  const { rows } = await query(
    `INSERT INTO nota_psicologica (cita_id, estudiante_id, contenido, creado_por_id)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [d.cita_id || null, d.estudiante_id, d.contenido, user.id],
  );
  revalidatePath("/psicologia");
  return rows[0].id as string;
}

/** Agenda una cita solicitada por el propio estudiante (sesión requerida). */
export async function solicitarCita(input: unknown): Promise<string> {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");
  const d = SolicitarCita.parse(input);
  const { rows } = await query(
    `INSERT INTO cita_psicologia (estudiante_id, tipo_registro, fecha, hora, estado)
     VALUES ($1, 'cita', $2, $3, 'programada') RETURNING id`,
    [d.estudiante_id, d.fecha, d.hora || null],
  );
  revalidatePath("/cita-psicologia");
  return rows[0].id as string;
}
