/**
 * Página de inicio (placeholder del Sprint 0). Muestra el título y estado
 * del proyecto usando textos traducidos. Se reemplazará por la landing
 * pública y los portales por rol en sprints posteriores.
 */
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function Home() {
  const t = useTranslations("home");
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
      <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      <p className="rounded-md bg-muted px-4 py-2 text-sm text-muted-foreground">
        {t("status")}
      </p>
      <Button>Comenzar</Button>
    </main>
  );
}
