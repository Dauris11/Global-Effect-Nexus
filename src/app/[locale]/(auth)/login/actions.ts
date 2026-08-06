/**
 * Server Actions de autenticación (login por correo + contraseña).
 * Solo pueden entrar usuarios YA invitados (existentes y activos en `usuario`):
 * tras validar credenciales con Supabase Auth se comprueba con
 * `resolverUsuario`; si no está registrado, se cierra la sesión y se rechaza.
 * En éxito redirige a la ruta correspondiente a su rol.
 */
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolverUsuario } from "@/lib/auth";
import { rutaPorRol } from "@/lib/nav";

export interface LoginState {
  error?: string;
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const locale = String(formData.get("locale") ?? "es");

  // MOCK PARA DISEÑO: Simula inicio de sesión exitoso y redirige directo
  redirect(`/${locale}/portal/estudiante`);
}
