/**
 * Configuración de la página de inicio: las dos superficies que administración
 * controla directamente —el carrusel del hero y las noticias del blog—.
 *
 * Van en la misma pantalla porque son la misma decisión editorial: qué cuenta
 * la Fundación en su portada. Exige `landing.administrar`; si no, redirige.
 */
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { todosLosSlides, todasLasNoticias } from "@/server/landing/queries";
import { SlidesManager } from "./slides-manager";
import { NoticiasManager } from "./noticias-manager";

export const dynamic = "force-dynamic";

export default async function ConfigLandingPage() {
  const locale = await getLocale();
  const user = await currentUser();
  if (!user || !(await can(user.rol, "landing.administrar"))) {
    redirect(`/${locale}/dashboard`);
  }

  const [slides, noticias] = await Promise.all([todosLosSlides(), todasLasNoticias()]);

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Página de inicio — Hero</h1>
          <p className="text-muted-foreground">
            Crea, activa/desactiva y ordena las diapositivas de publicidad.
          </p>
        </div>
        <SlidesManager slides={slides} />
      </section>

      <NoticiasManager noticias={noticias} />
    </div>
  );
}
