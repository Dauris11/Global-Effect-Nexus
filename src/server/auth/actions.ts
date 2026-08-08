/**
 * Server Actions de sesión compartidas por el portal. Cerrar sesión termina
 * la sesión de Supabase y devuelve al login del idioma activo.
 */
"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";

export async function cerrarSesion(locale: string): Promise<void> {
  await signOut();
  redirect(`/${locale}`);
}
