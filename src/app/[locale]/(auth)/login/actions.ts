/**
 * Server Actions de autenticación (login por correo + contraseña).
 * Solo pueden entrar usuarios YA invitados (existentes y activos en `usuario`):
 * tras validar credenciales con Supabase Auth se comprueba con
 * `resolverUsuario`; si no está registrado, se cierra la sesión y se rechaza.
 * En éxito redirige a la ruta correspondiente a su rol.
 */
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolverUsuario } from "@/lib/auth";
import { rutaPorRol } from "@/lib/nav";
import { MODO_DISENO, PERFILES_DISENO } from "@/lib/modo-diseno";

export interface LoginState {
  error?: string;
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const locale = String(formData.get("locale") ?? "es");

  // En modo diseño no hay Supabase contra el que validar: se entra directo.
  if (MODO_DISENO) {
    const email = String(formData.get("email") ?? "").toLowerCase().trim();
    let rol = "estudiante";
    if (email.includes("psico") || email.includes("bienestar")) {
      rol = "psicologo";
    } else if (email.includes("docente") || email.includes("profesor")) {
      rol = "docente";
    } else if (email.includes("admin") || email.includes("coordinad")) {
      rol = "administrativo";
    } else if (email.includes("conta") || email.includes("finanz")) {
      rol = "contabilidad";
    } else if (email.includes("super")) {
      rol = "super_admin";
    }

    try {
      const cookieStore = await cookies();
      cookieStore.set("modo_diseno_rol", rol, { path: "/" });
    } catch {
      // ignore
    }

    redirect(`/${locale}${rutaPorRol(rol)}`);
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "required" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "invalidCredentials" };

  // Refuerzo de invitación: debe existir un `usuario` activo enlazable.
  const usuario = await resolverUsuario();
  if (!usuario) {
    await supabase.auth.signOut();
    return { error: "notRegistered" };
  }

  redirect(`/${locale}${rutaPorRol(usuario.rol)}`);
}
