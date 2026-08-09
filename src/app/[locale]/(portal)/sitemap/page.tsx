import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Map } from "lucide-react";

export default function SitemapPage() {
  return (
    <div className="portal-page space-y-6">
      <PageHeader
        title="Sitemap"
        description="Mapa del sitio y módulos de acceso"
      />

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <EmptyState
          icon={Map}
          title="Mapa del sitio"
          description="Se ofrece el punto de entrada al conjunto de portales y módulos migrados por rol."
        />
      </div>
    </div>
  );
}
