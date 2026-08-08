import React from "react";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import { proximasAsignacionesDelEstudiante, materiasDelEstudiante } from "@/server/portales/queries";
import { AulaVirtualClient } from "./aula-virtual-client";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AulaVirtualPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);
  
  const dateLocale = locale === "en" ? enUS : es;
  const estudianteId = "mock-id"; // Omitiremos currentUser() real para prototipo rápido si no hay DB
  
  const [asignaciones, materias] = await Promise.all([
    proximasAsignacionesDelEstudiante(estudianteId).catch(() => []),
    materiasDelEstudiante(estudianteId).catch(() => []),
  ]);

  return (
    <AulaVirtualClient 
      materias={materias} 
      asignaciones={asignaciones} 
      locale={locale} 
    />
  );
}
