import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Bot } from "lucide-react";

export default function ChatIAAdministrativoPage() {
  return (
    <div className="portal-page space-y-6">
      <PageHeader
        title="Chat IA"
        description="Consultas operativas sobre la fundación"
      />

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <EmptyState
          icon={Bot}
          title="Chat IA"
          description="La conversación con IA administrativa queda preparada para la capa de consultas y acciones del dominio."
        />
      </div>
    </div>
  );
}
