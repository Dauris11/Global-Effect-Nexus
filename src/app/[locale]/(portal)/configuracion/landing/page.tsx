/**
 * Configuración de la landing: gestión de las diapositivas (publicidad) del
 * hero. Exige `landing.administrar`; si no, redirige al panel.
 */
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { todosLosSlides } from "@/server/landing/queries";
import { SlidesManager } from "./slides-manager";

export const dynamic = "force-dynamic";

export default async function ConfigLandingPage() {
  const locale = await getLocale();
  const user = await currentUser();
  if (!user || !(await can(user.rol, "landing.administrar"))) {
    redirect(`/${locale}/dashboard`);
  }

  const slides = await todosLosSlides();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Página de inicio — Hero</h1>
        <p className="text-muted-foreground">
          Crea, activa/desactiva y ordena las diapositivas de publicidad.
        </p>
      </div>
      <SlidesManager slides={slides} />
    </div>
  );
}
