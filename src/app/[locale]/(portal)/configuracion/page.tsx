/**
 * Configuración — hub de administración. Enlaza a la gestión del contenido
 * público (hero de la landing) y otros ajustes. Requiere sesión (el layout
 * del portal ya la exige); cada subsección aplica su propio permiso.
 */
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { ImageIcon, ChevronRight } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";

export default async function ConfiguracionPage() {
  const locale = await getLocale();
  const user = await currentUser();
  const puedeLanding = user ? await can(user.rol, "landing.administrar") : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Administración del sistema y contenido público.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {puedeLanding && (
          <Link
            href={`/${locale}/configuracion/landing`}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition hover:border-primary"
          >
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ImageIcon className="size-6" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">Página de inicio (hero)</div>
              <div className="text-sm text-muted-foreground">
                Configura la publicidad rotativa de la landing.
              </div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </Link>
        )}
      </div>
    </div>
  );
}
