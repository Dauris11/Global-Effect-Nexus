import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { GraduationCap } from "lucide-react";

export default function AcademiasProgramasPage() {
  return (
    <div className="portal-page space-y-6">
      <PageHeader
        title="Programas"
        description="Academias de liderazgo y habilidades"
      />

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <EmptyState
          icon={GraduationCap}
          title="Programas"
          description="Gestión de programas de academias y facilitadores del modelo Global Effect."
        />
      </div>
    </div>
  );
}
