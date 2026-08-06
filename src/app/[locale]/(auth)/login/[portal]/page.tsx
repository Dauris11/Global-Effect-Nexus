/**
 * Login de un portal concreto — `/login/estudiante`, `/login/psicologia`…
 *
 * **Por qué uno por portal y no solo el genérico.** Desde el landing, pulsar
 * "Psicología" llevaba a la ruta protegida y el middleware rebotaba al login
 * con un `redirectTo` en la URL: la persona veía una pantalla neutra sin
 * relación con lo que acababa de pulsar. Aquí la puerta lleva el color, el
 * icono y el nombre del portal al que va, y el destino ya está resuelto antes
 * de escribir la contraseña.
 *
 * **La autenticación es exactamente la misma.** Este archivo solo decide cómo
 * se ve el panel de marca y a dónde se vuelve al terminar; el formulario, el
 * OAuth de Google y la Server Action son los del login genérico, sin ninguna
 * variante por portal. Si el rol de la cuenta no corresponde a esta puerta, la
 * redirección por rol manda sobre el destino sugerido —el sistema lleva a cada
 * quien a lo suyo— y por eso el panel lo advierte.
 *
 * El formulario usa `useSearchParams`, por eso va dentro de un `Suspense`.
 */
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "../login-form";
import { Logo } from "@/components/brand/logo";
import { PORTALES, portalPorClave } from "@/lib/portales";
import { cn } from "@/lib/utils";

/** Prerrenderiza las seis puertas: son fijas y conocidas. */
export function generateStaticParams() {
  return PORTALES.map((p) => ({ portal: p.clave }));
}

export default async function LoginPortalPage({
  params,
}: {
  params: Promise<{ locale: string; portal: string }>;
}) {
  const { locale, portal: clave } = await params;
  const portal = portalPorClave(clave);
  if (!portal) notFound();

  const t = await getTranslations("auth");
  const tl = await getTranslations("landing");
  const Icono = portal.icono;
  const nombre = tl(portal.nombreKey as "portal_estudiante");

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Panel de marca, teñido con el color de este portal. */}
      <div
        className={cn(
          "relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex",
          portal.gradiente,
        )}
      >
        {/* Velo oscuro: los degradados claros —ámbar, naranja— no dan
            contraste suficiente con texto blanco por sí solos. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/25" />

        <Logo className="relative h-9 w-auto" priority />

        <div className="relative max-w-md">
          <span
            aria-hidden
            className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20"
          >
            <Icono className="h-7 w-7" />
          </span>

          {/* Eyebrow + nombre, en vez de "Acceso al {portal}": los nombres
              son femeninos ("Psicología"), plurales ("Estudiantes") y
              masculinos ("Cursos técnicos"), y ningún artículo fijo concuerda
              con los seis. */}
          <p className="text-xs uppercase tracking-widest text-white/70">
            {t("portalGateEyebrow")}
          </p>
          <h2 className="font-heading mt-1 text-3xl font-bold leading-tight">{nombre}</h2>
          <p className={cn("mt-5 border-l-2 pl-4 text-sm leading-relaxed text-white/85", portal.acento)}>
            {t("portalGateNote")}
          </p>
        </div>

        <p className="relative text-xs text-white/60">{t("brandTagline")}</p>
      </div>

      {/* Formulario. */}
      <div className="relative flex flex-col justify-center bg-slate-50 px-6 py-12">
        <Link
          href="/"
          className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
          {t("backHome")}
        </Link>

        <div className="mx-auto w-full max-w-sm">
          {/* En móvil el panel no se pinta, así que el portal se identifica
              aquí con su azulejo y su nombre. */}
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
            <Link href="/login" className="text-xs text-slate-500 hover:text-slate-900">
              {t("otherPortals")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
