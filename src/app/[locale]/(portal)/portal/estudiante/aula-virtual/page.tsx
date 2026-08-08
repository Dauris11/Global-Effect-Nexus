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
  
  let [asignaciones, materias] = await Promise.all([
    proximasAsignacionesDelEstudiante(estudianteId).catch(() => []),
    materiasDelEstudiante(estudianteId).catch(() => []),
  ]);

  // Si no hay materias (ej: prototipo), inyectar datos falsos coherentes con
  // el contrato `MateriaDelEstudiante` del portal.
  if (materias.length === 0) {
    materias = [
      {
        inscripcion_id: "mock-inscripcion-1",
        materia_id: "m1",
        nombre: "Estructura de Datos",
        codigo: "ISC-215",
        creditos: 4,
        profesor_nombre: "Manuel Reynoso",
        horario: "Lun/Mié 4:00 PM",
        aula: "Lab 2",
        periodo_nombre: "2026-I",
        estado: "activa",
      },
      {
        inscripcion_id: "mock-inscripcion-2",
        materia_id: "m2",
        nombre: "Bases de Datos II",
        codigo: "ISC-233",
        creditos: 4,
        profesor_nombre: "Felix Almonte",
        horario: "Mar/Jue 8:00 AM",
        aula: "Aula 3",
        periodo_nombre: "2026-I",
        estado: "activa",
      },
      {
        inscripcion_id: "mock-inscripcion-3",
        materia_id: "m3",
        nombre: "Cálculo Integral",
        codigo: "MAT-201",
        creditos: 5,
        profesor_nombre: "Dariana Peña",
        horario: "Vie 2:00 PM",
        aula: "Aula 2",
        periodo_nombre: "2026-I",
        estado: "activa",
      },
      {
        inscripcion_id: "mock-inscripcion-4",
        materia_id: "m4",
        nombre: "Filosofía de Sistemas",
        codigo: "ISC-310",
        creditos: 3,
        profesor_nombre: "Domínguez",
        horario: "Lun 10:00 AM",
        aula: "Aula 4",
        periodo_nombre: "2026-I",
        estado: "activa",
      },
      {
        inscripcion_id: "mock-inscripcion-5",
        materia_id: "m5",
        nombre: "Ecología y Medio Ambiente",
        codigo: "AMB-105",
        creditos: 2,
        profesor_nombre: "Ciencias Ambientales",
        horario: "Jue 10:00 AM",
        aula: "Aula 10",
        periodo_nombre: "2026-I",
        estado: "activa",
      },
    ];
  }

  return (
    <AulaVirtualClient 
      materias={materias} 
      asignaciones={asignaciones} 
      locale={locale} 
    />
  );
}
