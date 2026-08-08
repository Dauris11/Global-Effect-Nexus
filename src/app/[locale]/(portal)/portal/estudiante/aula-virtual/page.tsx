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

  // Si no hay materias (ej: prototipo), inyectar datos falsos para poder ver el diseño
  if (materias.length === 0) {
    materias = [
      { id: "m1", codigo: "ISC-215", nombre: "Estructura de Datos", creditos: 4, profesor: "Manuel Reynoso", color: "blue", horario: "Lun/Mié 4:00 PM" },
      { id: "m2", codigo: "ISC-233", nombre: "Bases de Datos II", creditos: 4, profesor: "Felix Almonte", color: "green", horario: "Mar/Jue 8:00 AM" },
      { id: "m3", codigo: "MAT-201", nombre: "Cálculo Integral", creditos: 5, profesor: "Dariana Peña", color: "red", horario: "Vie 2:00 PM" },
      { id: "m4", codigo: "ISC-310", nombre: "Filosofía de Sistemas", creditos: 3, profesor: "Domínguez", color: "yellow", horario: "Lun 10:00 AM" },
      { id: "m5", codigo: "AMB-105", nombre: "Ecología y Medio Ambiente", creditos: 2, profesor: "Ciencias Ambientales", color: "blue", horario: "Jue 10:00 AM" },
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
