/**
 * Alta de expediente — ClickUp S5 · #207.
 *
 * Página propia y no diálogo: son seis secciones de ficha social y un modal las
 * ahogaría (estándar §6). El servidor solo hace tres cosas: comprobar el
 * permiso, resolver los diccionarios y montar el formulario.
 *
 * Los textos viajan con `t.raw()`, que devuelve el objeto del namespace
 * completo, en vez de enumerar cuarenta claves a mano en este archivo.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Lock } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormularioExpediente, type TextosExpediente } from "./formulario-expediente";

export default async function NuevoExpedientePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const [puedeEscribir, t] = await Promise.all([
    can(user.rol, "expedientes.escribir"),
    getTranslations("records"),
  ]);

  if (!puedeEscribir) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow={t("eyebrow")} title={t("form.title")} />
        <EmptyState
          icon={Lock}
          title={t("forbidden")}
          description={t("forbiddenHint")}
          action={
            <Button variant="outline" asChild>
              <Link href={`/${locale}/expedientes`}>
                <ArrowLeft aria-hidden />
                {t("backToList")}
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const textos: TextosExpediente = {
    form: t.raw("form"),
    tab: t.raw("tab"),
    field: t.raw("field"),
    family: t.raw("family"),
    gender: t.raw("gender"),
    relation: t.raw("relation"),
    type: t.raw("type"),
    status: t.raw("status"),
    followUp: t.raw("followUp"),
  };

  return (
    <div className="space-y-8">
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("form.title")}
          description={t("form.subtitle")}
          actions={
            <Button variant="ghost" asChild>
              <Link href={`/${locale}/expedientes`}>
                <ArrowLeft aria-hidden />
                {t("backToList")}
              </Link>
            </Button>
          }
        />
      </div>

      <FormularioExpediente textos={textos} rutaListado={`/${locale}/expedientes`} />
    </div>
  );
}
