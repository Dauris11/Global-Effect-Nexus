/**
 * Callback de OAuth (Google) — Supabase Auth (flujo PKCE).
 * Intercambia el `code` por una sesión, refuerza la regla de invitación
 * (`resolverUsuario`) y redirige según el rol. Si el email no corresponde a un
 * usuario invitado y activo, cierra la sesión y vuelve al login con error.
 *
 * Fuera del segmento [locale] (excluido del middleware i18n en proxy.ts).
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolverUsuario } from "@/lib/auth";
import { rutaPorRol } from "@/lib/nav";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const locale = url.searchParams.get("locale") ?? "es";
  const origin = url.origin;
  const loginUrl = (err: string) => `${origin}/${locale}/login?error=${err}`;

  if (!code) return NextResponse.redirect(loginUrl("oauth"));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(loginUrl("oauth"));

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const usuario = await resolverUsuario(authUser);
  if (!usuario) {
    await supabase.auth.signOut();
    return NextResponse.redirect(loginUrl("notRegistered"));
  }

  return NextResponse.redirect(`${origin}/${locale}${rutaPorRol(usuario.rol)}`);
}
