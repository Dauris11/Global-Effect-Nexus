/**
 * Cita de Psicología (estudiante) — módulo 22 del catálogo.
 *
 * Es la mitad estudiantil del módulo de Psicología, y existe precisamente
 * porque el joven **no** puede entrar en `/psicologia`: ese módulo exige
 * `psicologia.leer` y el rol `estudiante` solo tiene `academico.leer` e
 * `ia.usar`. Sin esta pantalla, el acceso "Cita de Psicología" de su portal
 * era un enlace a una puerta cerrada.
 *
 * La asimetría es deliberada, no una limitación: el estudiante **pide** una
 * cita y ve las suyas; no ve la agenda de nadie más, ni el nivel de
 * confidencialidad, ni los riesgos anotados, ni las notas. Todo eso vive en el
 * módulo del psicólogo.
 *
 * `solicitarCita` no exige permiso —solo sesión— y crea la cita en estado
 * `programada`, sin tocar campos confidenciales.
 */
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { CitaPsicologiaClient } from "./cita-psicologia-client";

export default async function CitaPsicologiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  return (
    <CitaPsicologiaClient locale={locale} />
  );
}
