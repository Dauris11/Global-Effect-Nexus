/**
 * Formulario de inicio de sesión (Impact Editorial) con diseño de doble cara deslizable.
 * Permite cambiar entre el portal de Estudiante y el portal de Personal/Docente.
 * Si el usuario entra desde un enlace directo de un portal específico, muestra únicamente
 * la tarjeta de acceso dedicada sin el conmutador deslizable para una mejor experiencia de usuario.
 */
"use client";

import { useActionState, useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { login, type LoginState } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const initialState: LoginState = {};

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
  const portalParam = params.get("portal");
  const urlError = params.get("error") ?? "";
  const [state, formAction, pending] = useActionState(login, initialState);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const errorKey = state.error || googleError || urlError;

  // Detecta si es un acceso directo a un portal específico
  const isDirectStudent = portalParam === "estudiante" || redirectTo.includes("/portal/estudiante") || redirectTo.includes("/cita-psicologia");
  const isDirectPersonal = portalParam === "personal" || portalParam === "docente" || redirectTo.includes("/portal/profesor") || redirectTo.includes("/dashboard") || redirectTo.includes("/expedientes") || redirectTo.includes("/academico") || redirectTo.includes("/calendario") || redirectTo.includes("/psicologia") || redirectTo.includes("/contabilidad");

  const isDirect = isDirectStudent || isDirectPersonal;

  // Estado del conmutador deslizable (para cuando no es acceso directo): false = Estudiante, true = Personal
  const [isStaff, setIsStaff] = useState(false);

  // Sincroniza el estado inicial del panel con el parámetro si existe, para que empiece en el correcto
  useEffect(() => {
    if (isDirectPersonal) {
      setIsStaff(true);
    } else if (isDirectStudent) {
      setIsStaff(false);
    }
  }, [isDirectStudent, isDirectPersonal]);

  async function loginConGoogle() {
    setGoogleLoading(true);
    setGoogleError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?locale=${locale}`,
      },
    });
    if (error) {
      setGoogleError("oauth");
      setGoogleLoading(false);
    }
  }

  // ── RENDER ACCESO DIRECTO (Tarjeta de Formulario Único Dedicado) ──
  if (isDirect) {
    const showStudentForm = isDirectStudent;
    return (
      <div className="w-full max-w-md relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f1d]/50 backdrop-blur-md shadow-2xl p-8 sm:p-10 text-white">
        {/* Glow de fondo */}
        <div className="absolute top-[-10%] right-[-10%] size-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        
        {/* Logo superior */}
        <div className="flex justify-center mb-8">
          <Logo className="h-8 w-auto brightness-0 invert drop-shadow-[0_0_12px_rgba(96,165,250,0.5)]" />
        </div>

        <div className="space-y-6">
          <div className="space-y-1.5 text-center">
            <span className={cn(
              "inline-block rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em]",
              showStudentForm ? "bg-primary/10 text-primary" : "bg-emerald-400/10 text-emerald-400"
            )}>
              {showStudentForm ? "Portal Estudiante" : "Portal Personal & Docente"}
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {t("signInTitle")}
            </h1>
            <p className="text-xs text-white/40">{t("inviteOnly")}</p>
          </div>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={loginConGoogle}
            disabled={googleLoading}
            className="w-full px-4 font-semibold border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <GoogleIcon />
            {t("continueWithGoogle")}
          </Button>

          <div className="flex items-center gap-3 text-xs text-white/30">
            <span className="h-px flex-1 bg-white/10" />
            {t("orEmail")}
            <span className="h-px flex-1 bg-white/10" />
          </div>

          {/* Formulario */}
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <Field label={t("email")} requerido htmlFor="direct-email">
              {(campo) => (
                <Input 
                  {...campo} 
                  id="direct-email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  className={cn(
                    "bg-white/5 border-white/10 text-white placeholder:text-white/20",
                    showStudentForm ? "focus:border-primary/50" : "focus:border-emerald-500/50"
                  )} 
                />
              )}
            </Field>

            <Field label={t("password")} requerido htmlFor="direct-password">
              {(campo) => (
                <Input
                  {...campo}
                  id="direct-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={cn(
                    "bg-white/5 border-white/10 text-white placeholder:text-white/20",
                    showStudentForm ? "focus:border-primary/50" : "focus:border-emerald-500/50"
                  )}
                />
              )}
            </Field>

            {errorKey && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {t(errorKey)}
              </p>
            )}

            <Button 
              type="submit" 
              size="lg" 
              className={cn(
                "w-full text-white transition-all duration-300",
                showStudentForm 
                  ? "bg-primary hover:bg-primary/95 shadow-[0_0_20px_rgba(29,78,216,0.3)]" 
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              )} 
              disabled={pending}
            >
              {t("signIn")}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // ── RENDER CON CONMUTADOR DESLIZABLE (Acceso General / Selector) ──
  return (
    <div className="w-full max-w-4xl relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a0f1d]/50 backdrop-blur-md shadow-2xl min-h-[600px] flex transition-all duration-300">
      
      {/* ── VISTA DESKTOP (Efecto Deslizable Pinterest) ── */}
      <div className="hidden lg:flex w-full relative min-h-[600px]">
        
        {/* PANEL DE FORMULARIO ESTUDIANTE (Izquierda por defecto, se mueve a la derecha) */}
        <div className={cn(
          "absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center px-16 py-10 transition-all duration-600 ease-in-out",
          isStaff ? "translate-x-full opacity-0 pointer-events-none z-10" : "translate-x-0 opacity-100 z-20"
        )}>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
                Portal Estudiante
              </span>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white">
                {t("signInTitle")}
              </h1>
              <p className="text-sm text-white/40">{t("inviteOnly")}</p>
            </div>

            {/* Google OAuth */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={loginConGoogle}
              disabled={googleLoading}
              className="w-full px-4 font-semibold border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <GoogleIcon />
              {t("continueWithGoogle")}
            </Button>

            <div className="flex items-center gap-3 text-xs text-white/30">
              <span className="h-px flex-1 bg-white/10" />
              {t("orEmail")}
              <span className="h-px flex-1 bg-white/10" />
            </div>

            {/* Formulario Correo + Contraseña */}
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="redirectTo" value={redirectTo} />

              <Field label={t("email")} requerido htmlFor="student-email">
                {(campo) => (
                  <Input {...campo} id="student-email" name="email" type="email" autoComplete="email" required className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50" />
                )}
              </Field>

              <Field label={t("password")} requerido htmlFor="student-password">
                {(campo) => (
                  <Input
                    {...campo}
                    id="student-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50"
                  />
                )}
              </Field>

              {errorKey && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {t(errorKey)}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full bg-primary text-white hover:bg-primary/95 shadow-[0_0_20px_rgba(29,78,216,0.3)]" disabled={pending}>
                {t("signIn")}
              </Button>
            </form>
          </div>
        </div>

        {/* PANEL DE FORMULARIO PERSONAL/DOCENTE (Izquierda por defecto, se mueve a la derecha, oculto al inicio) */}
        <div className={cn(
          "absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center px-16 py-10 transition-all duration-600 ease-in-out",
          isStaff ? "translate-x-full opacity-100 z-20" : "translate-x-0 opacity-0 pointer-events-none z-10"
        )}>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="inline-block rounded-full bg-emerald-400/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-400">
                Portal Docente & Personal
              </span>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white">
                {t("signInTitle")}
              </h1>
              <p className="text-sm text-white/40">{t("inviteOnly")}</p>
            </div>

            {/* Google OAuth */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={loginConGoogle}
              disabled={googleLoading}
              className="w-full px-4 font-semibold border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <GoogleIcon />
              {t("continueWithGoogle")}
            </Button>

            <div className="flex items-center gap-3 text-xs text-white/30">
              <span className="h-px flex-1 bg-white/10" />
              {t("orEmail")}
              <span className="h-px flex-1 bg-white/10" />
            </div>

            {/* Formulario Correo + Contraseña */}
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="redirectTo" value={redirectTo} />

              <Field label={t("email")} requerido htmlFor="staff-email">
                {(campo) => (
                  <Input {...campo} id="staff-email" name="email" type="email" autoComplete="email" required className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50" />
                )}
              </Field>

              <Field label={t("password")} requerido htmlFor="staff-password">
                {(campo) => (
                  <Input
                    {...campo}
                    id="staff-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50"
                  />
                )}
              </Field>

              {errorKey && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {t(errorKey)}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" disabled={pending}>
                {t("signIn")}
              </Button>
            </form>
          </div>
        </div>

        {/* CONTENEDOR DESLIZABLE DE TOGGLE (Derecha por defecto, se mueve a la izquierda) */}
        <div className={cn(
          "absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-600 ease-in-out rounded-[2.2rem] z-[100] p-1.5",
          isStaff ? "-translate-x-full" : "translate-x-0"
        )}>
          {/* Panel interno de doble ancho */}
          <div className={cn(
            "absolute top-0 -left-full w-[200%] h-full bg-gradient-to-br from-[#1d4ed8] to-[#0b2574] transition-all duration-600 ease-in-out relative overflow-hidden",
            isStaff ? "translate-x-1/2" : "translate-x-0"
          )}>
            {/* Círculos decorativos en el panel */}
            <div className="absolute top-[-20%] left-[-10%] size-60 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute bottom-[-30%] right-[-10%] size-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

            {/* Cara Izquierda (Se muestra cuando isStaff es true) */}
            <div className={cn(
              "absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center p-12 text-center transition-all duration-600 ease-in-out text-white",
              isStaff ? "translate-x-0" : "-translate-x-[200%]"
            )}>
              <Logo className="h-9 w-auto mb-6 brightness-0 invert drop-shadow-[0_0_12px_rgba(96,165,250,0.6)]" />
              <h2 className="font-display text-2xl font-bold mb-3">¿Eres Estudiante?</h2>
              <p className="text-sm text-white/70 mb-8 max-w-xs leading-relaxed">
                Entra por aquí para consultar tus materias abiertas, calificaciones de tus períodos activos e inscribirte al comedor diario.
              </p>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setIsStaff(false)}
                className="border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full px-8 font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Portal Estudiante
              </Button>
            </div>

            {/* Cara Derecha (Se muestra cuando isStaff es false) */}
            <div className={cn(
              "absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center p-12 text-center transition-all duration-600 ease-in-out text-white",
              isStaff ? "translate-x-[200%]" : "translate-x-0"
            )}>
              <Logo className="h-9 w-auto mb-6 brightness-0 invert drop-shadow-[0_0_12px_rgba(96,165,250,0.6)]" />
              <h2 className="font-display text-2xl font-bold mb-3">¿Docente o Personal?</h2>
              <p className="text-sm text-white/70 mb-8 max-w-xs leading-relaxed">
                Accede por este portal para registrar tus calificaciones, dar seguimiento a expedientes o administrar las operaciones de la fundación.
              </p>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setIsStaff(true)}
                className="border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full px-8 font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Portal Personal / Docente
              </Button>
            </div>

          </div>
        </div>

      </div>

      {/* ── VISTA MÓVIL (Pestaña Switcher Adaptable) ── */}
      <div className="flex lg:hidden w-full flex-col p-6 space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo className="h-8 w-auto brightness-0 invert drop-shadow-[0_0_12px_rgba(96,165,250,0.6)]" />
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-1.5 bg-white/5 p-1 rounded-full border border-white/10">
          <button 
            type="button" 
            onClick={() => setIsStaff(false)}
            className={cn(
              "py-2.5 text-xs font-bold rounded-full transition-all duration-300",
              !isStaff ? "bg-primary text-white shadow-[0_0_12px_rgba(29,78,216,0.3)]" : "text-white/40 hover:text-white/80"
            )}
          >
            Estudiante
          </button>
          <button 
            type="button" 
            onClick={() => setIsStaff(true)}
            className={cn(
              "py-2.5 text-xs font-bold rounded-full transition-all duration-300",
              isStaff ? "bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]" : "text-white/40 hover:text-white/80"
            )}
          >
            Personal
          </button>
        </div>

        {/* Formulario adaptativo */}
        <div className="transition-all duration-300">
          <div className="space-y-1.5 mb-6">
            <span className={cn(
              "inline-block rounded-full px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em]",
              isStaff ? "bg-emerald-400/10 text-emerald-400" : "bg-primary/10 text-primary"
            )}>
              {isStaff ? "Portal Docente & Personal" : "Portal Estudiante"}
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">
              {t("signInTitle")}
            </h1>
            <p className="text-xs text-white/40">{t("inviteOnly")}</p>
          </div>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={loginConGoogle}
            disabled={googleLoading}
            className="w-full px-4 font-semibold border-white/10 bg-white/5 text-white hover:bg-white/10 mb-6"
          >
            <GoogleIcon />
            {t("continueWithGoogle")}
          </Button>

          <div className="flex items-center gap-3 text-xs text-white/30 mb-6">
            <span className="h-px flex-1 bg-white/10" />
            {t("orEmail")}
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <Field label={t("email")} requerido htmlFor="mobile-email">
              {(campo) => (
                <Input 
                  {...campo} 
                  id="mobile-email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  className={cn(
                    "bg-white/5 border-white/10 text-white placeholder:text-white/20",
                    isStaff ? "focus:border-emerald-500/50" : "focus:border-primary/50"
                  )} 
                />
              )}
            </Field>

            <Field label={t("password")} requerido htmlFor="mobile-password">
              {(campo) => (
                <Input
                  {...campo}
                  id="mobile-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={cn(
                    "bg-white/5 border-white/10 text-white placeholder:text-white/20",
                    isStaff ? "focus:border-emerald-500/50" : "focus:border-primary/50"
                  )}
                />
              )}
            </Field>

            {errorKey && (
              <p role="alert" className="text-sm font-medium text-destructive mt-2">
                {t(errorKey)}
              </p>
            )}

            <Button 
              type="submit" 
              size="lg" 
              className={cn(
                "w-full text-white mt-4 transition-all duration-300",
                isStaff 
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                  : "bg-primary hover:bg-primary/95 shadow-[0_0_20px_rgba(29,78,216,0.3)]"
              )} 
              disabled={pending}
            >
              {t("signIn")}
            </Button>
          </form>
        </div>
      </div>

    </div>
  );
}
