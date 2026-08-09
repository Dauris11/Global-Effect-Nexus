import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { GraduationCap } from "lucide-react";

export default function AcademiasPage() {
  return (
    <div className="portal-page space-y-6">
      <PageHeader
        title="Academias"
        description="Programas, materiales y recursos de liderazgo"
      />

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <EmptyState
          icon={GraduationCap}
          title="Academias"
          description="Programas y materiales del eje de formación institucional."
        />
      </div>
    </div>
  );
}
