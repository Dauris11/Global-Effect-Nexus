import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ServiciosMensualesClient } from "./servicios-mensuales-client";

export default function ServiciosMensualesPage() {
  return (
    <div>
      <PageHeader
        title="Servicios Mensuales"
        description="Control mensual de servicios comunitarios y reuniones de estudiantes."
      />
      <ServiciosMensualesClient />
    </div>
  );
}
