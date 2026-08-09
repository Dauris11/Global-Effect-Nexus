import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";

export default function ReportesPage() {
  return (
    <div className="portal-page space-y-6">
      <PageHeader
        title="Reportes"
        description="Reportes generales y balances de la organización"
      />

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <EmptyState
          icon={BarChart3}
          title="Reportes"
          description="Este módulo queda conectado al servicio de reportes del backend para su visualización estructural."
        />
      </div>
    </div>
  );
}
