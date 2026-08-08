import React from "react";
import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function CalificacionesPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Calificaciones"
        description="Consulta tu historial académico y calificaciones."
      />
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <EmptyState
          icon={ClipboardCheck}
          title="Próximamente"
          description="El módulo de calificaciones estará disponible en una actualización futura."
        />
      </div>
    </div>
  );
}
