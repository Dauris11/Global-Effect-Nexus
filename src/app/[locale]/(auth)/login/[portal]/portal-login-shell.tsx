/**
 * PortalLoginShell — envoltorio cliente del login por portal.
 *
 * Estrategia de animación (v2, sin solapamientos):
 *
 * - El panel DERECHO (formulario) permanece completamente estático.
 * - El panel IZQUIERDO es un contenedor con `overflow-hidden` que aloja
 *   DOS sub-paneles superpuestos:
 *     · Panel A (marca / degradado): sale por la izquierda al abrir el selector.
 *     · Panel B (cuadrícula de portales): entra desde la derecha al mismo tiempo.
 *   La transición queda perfectamente contenida dentro de la mitad izquierda:
 *   nada se sale ni se solapa con el formulario.
 */
"use client";

import { Suspense, useState, useTransition } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "../login-form";
import { Logo } from "@/components/brand/logo";
import { PORTALES, portalPorClave } from "@/lib/portales";
import { cn } from "@/lib/utils";

interface Props {
  /** Segmento de la URL, p.ej. "estudiante" o "psicologia". */
  clave: string;
  locale: string;
  /** Nombre ya traducido por el server. */
  nombre: string;
}

export function PortalLoginShell({ clave, locale, nombre }: Props) {
  const t = useTranslations("auth");
  const tl = useTranslations("landing");
  const router = useRouter();

  const portal = portalPorClave(clave)!;
  const Icono = portal.icono;

  const [selector, setSelector] = useState(false);
  const [, startTransition] = useTransition();

  function abrirSelector() {
    setSelector(true);
  }

  function elegirPortal(pClave: string) {
    if (pClave === clave) {
      setSelector(false);
      return;
    }
    // Primero cerramos el selector (arranca la animación de salida de 500ms).
    // El navigate espera a que la transición CSS termine antes de cargar la
    // nueva página, dándole el mismo tiempo que la transición de apertura.
    setSelector(false);
    setTimeout(() => {
      startTransition(() => {
        router.push(`/login/${pClave}`);
      });
    }, 500);
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">

      {/* ══════════════════════════════════════════════════════════════════
          COLUMNA IZQUIERDA — contenedor con overflow-hidden.
          Contiene dos paneles absolutos que se deslizan dentro de él.
          Nada sale de este contenedor: sin solapamientos con el formulario.
         ══════════════════════════════════════════════════════════════════ */}
      <div className="relative hidden overflow-hidden lg:block">

        {/* ── Panel A: marca / degradado del portal ────────────────────── */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-between p-12 text-white",
            "transition-transform duration-500 ease-in-out",
            selector ? "-translate-x-full" : "translate-x-0",
            portal.gradiente,
          )}
        >
          {/* Velo oscuro para contraste */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/25" />

          <Logo className="relative h-9 w-auto" priority />

          <div className="relative max-w-md">
            <span
              aria-hidden
              className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20"
            >
              <Icono className="h-7 w-7" />
            </span>

            <p className="text-xs uppercase tracking-widest text-white/70">
              {t("portalGateEyebrow")}
            </p>
            <h2 className="font-heading mt-1 text-3xl font-bold leading-tight">{nombre}</h2>
            <p
              className={cn(
                "mt-5 border-l-2 pl-4 text-sm leading-relaxed text-white/85",
                portal.acento,
              )}
            >
              {t("portalGateNote")}
            </p>
          </div>

          <p className="relative text-xs text-white/60">{t("brandTagline")}</p>
        </div>

        {/* ── Panel B: cuadrícula de portales ──────────────────────────── */}
        {/*   Entra desde la derecha mientras el Panel A sale por la izq. */}
        <div
          aria-hidden={!selector}
          className={cn(
            "absolute inset-0 flex flex-col justify-center bg-white px-10 py-12",
            "transition-transform duration-500 ease-in-out",
            selector ? "translate-x-0" : "translate-x-full",
          )}
        >
          {/* Cerrar selector */}
          <button
            type="button"
            onClick={() => setSelector(false)}
            className="mb-8 inline-flex items-center gap-1.5 self-start text-xs text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
            Volver al login
          </button>

          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Todos los accesos
          </p>
          <h2 className="font-heading mb-6 text-2xl font-bold text-slate-900">
            ¿A cuál portal vas?
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {PORTALES.map((p) => {
              const PIcono = p.icono;
              const pNombre = tl(p.nombreKey as "portal_estudiante");
              const esActual = p.clave === clave;

              return (
                <button
                  key={p.clave}
                  type="button"
                  onClick={() => elegirPortal(p.clave)}
                  disabled={!selector}
                  className={cn(
                    "group relative flex flex-col items-center gap-2.5 rounded-2xl border-2 p-4 text-center",
                    "transition-all duration-200 hover:scale-[1.04] hover:shadow-lg active:scale-[0.97]",
                    esActual
                      ? "border-[#2096BA] bg-[#2096BA]/5 shadow-md ring-1 ring-[#2096BA]/20"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white",
                  )}
                >
                  {/* Azulejo — color institucional único para mantener la estética */}
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl text-white",
                      "shadow-sm transition-transform duration-200 group-hover:scale-105",
                      "bg-gradient-to-br from-[#2096BA] to-[#0a6a8a]",
                    )}
                  >
                    <PIcono className="h-6 w-6" />
                  </span>

                  <span className="text-xs font-semibold leading-snug text-slate-700">
                    {pNombre}
                  </span>

                  {/* Indicador del portal actual */}
                  {esActual && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#2096BA]" />
                  )}

                  <ChevronRight
                    aria-hidden
                    className="absolute bottom-2 right-2 h-3 w-3 text-slate-300 transition-colors group-hover:text-slate-500"
                  />
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-xs leading-relaxed text-slate-400">
            Cada puerta abre solo para su rol. El sistema te lleva a tu portal si entras con otra cuenta.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          COLUMNA DERECHA — formulario, siempre estático, nunca se mueve.
         ══════════════════════════════════════════════════════════════════ */}
      <div className="relative flex flex-col justify-center bg-slate-50 px-6 py-12">
        <Link
          href="/"
          className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
          {t("backHome")}
        </Link>

        <div className="mx-auto w-full max-w-sm">
          {/* Identificador del portal en móvil (panel izq. oculto en < lg) */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span
              aria-hidden
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl text-white",
                portal.gradiente,
              )}
            >
              <Icono className="h-5 w-5" />
            </span>
            <p className="font-heading text-lg font-bold text-slate-900">{nombre}</p>
          </div>

          <Suspense>
            <LoginForm redirectPorDefecto={`/${locale}${portal.destino}`} />
          </Suspense>

          <p className="mt-6 text-center">
            <button
              type="button"
              onClick={abrirSelector}
              className="text-xs text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
            >
              {t("otherPortals")}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
