/**
 * Server Actions de autenticación (login). Inicia sesión con Supabase Auth
 * (email + contraseña); las cookies del token las escribe el cliente de
 * servidor. En éxito redirige al destino solicitado o al panel.
 */
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "es");
  const redirectTo = String(formData.get("redirectTo") ?? "");

  if (!email || !password) return { error: "required" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "invalidCredentials" };

  // redirect() lanza internamente para cortar la ejecución (patrón de Next).
  redirect(`/${locale}${redirectTo || "/dashboard"}`);
}
