/**
 * Formulario de inicio de sesión (Impact Editorial). Solo entran usuarios ya
 * invitados. Dos vías, ambas restringidas y con redirección por rol:
 *   • Google (OAuth, para todos) — cliente Supabase → /auth/callback.
 *   • Correo + contraseña — Server Action `login`.
 * Muestra errores traducibles, incluidos los devueltos por el callback (?error=).
 */
"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { login, type LoginState } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const initialState: LoginState = {};

/** Icono de Google (SVG oficial multicolor). */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") ?? "";
  const urlError = params.get("error") ?? "";
  const [state, formAction, pending] = useActionState(login, initialState);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Mensaje de error: prioriza el de la Server Action; si no, el de la URL (callback).
  const errorKey = state.error || urlError;

  async function loginConGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?locale=${locale}`,
      },
    });
    if (error) setGoogleLoading(false);
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          {t("signInTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("inviteOnly")}</p>
      </div>

      {/* Google (para todos) */}
      <button
        type="button"
        onClick={loginConGoogle}
        disabled={googleLoading}
        className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground transition duration-150 ease-out hover:bg-muted active:scale-[0.98] disabled:opacity-60"
      >
        <GoogleIcon />
        {t("continueWithGoogle")}
      </button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t("orEmail")}
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Correo + contraseña */}
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            {t("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="flex h-11 w-full rounded-xl border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            {t("password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="flex h-11 w-full rounded-xl border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
          />
        </div>

        {errorKey && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {t(errorKey)}
          </p>
        )}

        <Button type="submit" className="h-11 w-full rounded-xl" disabled={pending}>
          {t("signIn")}
        </Button>
      </form>
    </div>
  );
}
