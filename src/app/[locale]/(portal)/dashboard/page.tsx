/**
 * Panel principal (placeholder de S4). Confirma la sesión y el rol activo;
 * las tarjetas, gráficos y métricas se implementan en S5.
 */
import { getTranslations } from "next-intl/server";
import { currentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await currentUser();
  const t = await getTranslations("nav");

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">{t("dashboard")}</h1>
      <p className="text-muted-foreground">
        {user ? `${user.nombre} (${user.rol})` : ""}
      </p>
    </div>
  );
}
