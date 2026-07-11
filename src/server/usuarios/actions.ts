/**
 * Server Actions del dominio Usuarios. Invitar usuarios y cambiar rol/estado.
 * Requieren `usuarios.administrar`. La creación de la identidad (contraseña)
 * se hace en Supabase Auth; aquí se gestiona el perfil de aplicación y el rol.
 */
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";

const InvitarUsuario = z.object({
  email: z.string().email(),
  nombre: z.string().min(1),
  rol_id: z.string().uuid(),
  idioma: z.enum(["es", "en", "fr", "it"]).default("es"),
});

const CambiarRol = z.object({
  id: z.string().uuid(),
  rol_id: z.string().uuid(),
});

const CambiarEstado = z.object({
  id: z.string().uuid(),
  activo: z.coerce.boolean(),
});

/**
 * Crea el perfil de usuario (se invita, no se registra). El trigger de
 * Supabase Auth lo enlazará por email cuando se cree su identidad.
 */
export async function invitarUsuario(input: unknown): Promise<string> {
  await requirePermission("usuarios.administrar");
  const d = InvitarUsuario.parse(input);
  const { rows } = await query(
    `INSERT INTO usuario (email, nombre, rol_id, idioma, activo)
     VALUES ($1, $2, $3, $4, TRUE)
     ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre, rol_id = EXCLUDED.rol_id
     RETURNING id`,
    [d.email, d.nombre, d.rol_id, d.idioma],
  );
  revalidatePath("/configuracion");
  return rows[0].id as string;
}

export async function cambiarRol(input: unknown): Promise<void> {
  await requirePermission("usuarios.administrar");
  const d = CambiarRol.parse(input);
  await query(`UPDATE usuario SET rol_id = $2 WHERE id = $1`, [d.id, d.rol_id]);
  revalidatePath("/configuracion");
}

export async function cambiarEstadoUsuario(input: unknown): Promise<void> {
  await requirePermission("usuarios.administrar");
  const d = CambiarEstado.parse(input);
  await query(`UPDATE usuario SET activo = $2 WHERE id = $1`, [d.id, d.activo]);
  revalidatePath("/configuracion");
}
