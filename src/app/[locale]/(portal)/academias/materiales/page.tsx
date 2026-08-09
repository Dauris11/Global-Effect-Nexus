import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Library } from "lucide-react";

export default function AcademiasMaterialesPage() {
  return (
    <div className="portal-page space-y-6">
      <PageHeader
        title="Materiales"
        description="Recursos educativos por academia"
      />

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <EmptyState
          icon={Library}
          title="Materiales"
          description="Recursos, documentos y ayudas de formación de cada programa académico."
        />
      </div>
    </div>
  );
}
