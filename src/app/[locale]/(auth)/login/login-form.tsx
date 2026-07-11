/**
 * Formulario de inicio de sesión (cliente). Controlado por `useActionState`
 * sobre la Server Action `login`; textos traducibles (namespace "auth") y
 * destino tras el login desde `?redirectTo=`.
 */
"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { login, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

const initialState: LoginState = {};

export function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const redirectTo = useSearchParams().get("redirectTo") ?? "";
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form
      action={formAction}
      className="w-full max-w-sm space-y-5 rounded-lg border border-border bg-card p-8 shadow-sm"
    >
      <div className="flex justify-center">
        <span className="flex items-center rounded-lg bg-brand-charcoal px-4 py-2.5">
          <Logo className="h-6 w-auto" priority />
        </span>
      </div>
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t("signInTitle")}</h1>
        <p className="text-sm text-muted-foreground">Global Effect Nexus</p>
      </div>

      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          {t("password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{t(state.error)}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {t("signIn")}
      </Button>
    </form>
  );
}
