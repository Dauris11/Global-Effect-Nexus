/**
 * Server Actions de sesión compartidas por el portal. Cerrar sesión termina
 * la sesión de Supabase y devuelve al login del idioma activo.
 */
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { MODO_DISENO } from "@/lib/modo-diseno";
import { rutaPorRol } from "@/lib/nav";

export async function cerrarSesion(locale: string): Promise<void> {
  await signOut();
  redirect(`/${locale}`);
}

export async function cambiarRolDiseno(rol: string, locale: string = "es"): Promise<void> {
  if (MODO_DISENO) {
    try {
      const cookieStore = await cookies();
      cookieStore.set("modo_diseno_rol", rol, { path: "/" });
    } catch {
      // ignore
    }
    redirect(`/${locale}${rutaPorRol(rol)}`);
  }
}
