import React from "react";
import { Bot } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function ChatIAPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Chat IA para Estudiantes"
        description="Interactúa con nuestra inteligencia artificial para resolver dudas y obtener ayuda académica."
      />
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <EmptyState
          icon={Bot}
          title="Próximamente"
          description="El módulo de Chat IA estará disponible en una actualización futura."
        />
      </div>
    </div>
  );
}
