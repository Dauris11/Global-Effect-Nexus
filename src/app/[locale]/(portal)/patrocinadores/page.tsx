import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { HeartHandshake } from "lucide-react";

export default function PatrocinadoresPage() {
  return (
    <div className="portal-page space-y-6">
      <PageHeader
        title="Patrocinadores"
        description="Gestión de patrocinadores y becas"
      />

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <EmptyState
          icon={HeartHandshake}
          title="Patrocinadores"
          description="El módulo de patrocinadores y becas se conecta con el catálogo del sistema y queda preparado para el siguiente paso de UI específica."
        />
      </div>
    </div>
  );
}
