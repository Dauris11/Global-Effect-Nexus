/**
 * Login de un portal concreto — `/login/estudiante`, `/login/psicologia`…
 *
 * La interactividad (animación de swap de paneles al ver todos los accesos)
 * se delega al `PortalLoginShell`, que es un Client Component. Solo se le
 * pasan props serializables: `clave` (string) y `nombre` (ya traducido).
 */
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PORTALES, portalPorClave } from "@/lib/portales";
import { PortalLoginShell } from "./portal-login-shell";

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

  const tl = await getTranslations("landing");
  const nombre = tl(portal.nombreKey as "portal_estudiante");

  return <PortalLoginShell clave={clave} locale={locale} nombre={nombre} />;
}
