/**
 * Server Actions (escritura) del dominio Estudiantes. Cada acción exige el
 * permiso correspondiente con `requirePermission` antes de validar y escribir.
 */
"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import { CrearEstudiante } from "./schema";

/** Crea un expediente de estudiante. Requiere `expedientes.escribir`. */
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
