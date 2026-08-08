import React from "react";
import { Calendar } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function CalendarioPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Calendario Institucional"
        description="Consulta las fechas importantes y eventos."
      />
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <EmptyState
          icon={Calendar}
          title="Próximamente"
          description="El módulo de calendario estará disponible en una actualización futura."
        />
      </div>
    </div>
  );
}
