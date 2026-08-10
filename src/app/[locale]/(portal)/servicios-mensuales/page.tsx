import React from "react";
import { format } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { ServiciosMensualesClient } from "./servicios-mensuales-client";
import { serviciosDelMes } from "@/server/operaciones/queries";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { can } from "@/lib/rbac";

export default async function ServiciosMensualesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mes?: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);
  
  const puedeEscribir = await can(user.rol, "operaciones.escribir");

  const sp = await searchParams;
  const mesSeleccionado = sp.mes || format(new Date(), "yyyy-MM");
  
  const registros = await serviciosDelMes(mesSeleccionado);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Servicios Mensuales"
        description="Control mensual de servicios comunitarios y reuniones de estudiantes."
      />
      <ServiciosMensualesClient 
        mesInicial={mesSeleccionado} 
        registros={registros} 
        puedeEscribir={puedeEscribir}
      />
    </div>
  );
}
