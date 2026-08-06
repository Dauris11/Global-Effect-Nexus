/**
 * Edición de expediente — ClickUp S5 · #357.
 *
 * Página propia y no diálogo, por lo mismo que el alta: son seis secciones de
 * ficha social y un modal las ahoga (estándar §6). Reutiliza el mismo
 * formulario, que se prellena con lo que ya hay.
 *
 * Es la mitad que faltaba de "crear/ver/editar/eliminar": hasta ahora un
 * expediente se abría y se consultaba, pero un apellido mal tecleado o una
 * dirección que cambia obligaban a borrarlo y volverlo a levantar entero.
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Lock } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { obtenerExpedienteCompleto } from "@/server/estudiantes/queries";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FormularioExpediente,
  type TextosExpediente,
} from "../../nuevo/formulario-expediente";

export default async function EditarExpedientePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const [puedeEscribir, t] = await Promise.all([
    can(user.rol, "expedientes.escribir"),
    getTranslations("records"),
  ]);

  if (!puedeEscribir) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow={t("eyebrow")} title={t("form.titleEdit")} />
        <EmptyState
          icon={Lock}
          title={t("forbidden")}
          description={t("forbiddenHint")}
          action={
            <Button variant="outline" asChild>
              <Link href={`/${locale}/expedientes/${id}`}>
                <ArrowLeft aria-hidden />
                {t("backToRecord")}
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const expediente = await obtenerExpedienteCompleto(id).catch(() => null);
  if (!expediente) notFound();

  const textos: TextosExpediente = {
    form: t.raw("form"),
    tab: t.raw("tab"),
    field: t.raw("field"),
    family: t.raw("family"),
    gender: t.raw("gender"),
    relation: t.raw("relation"),
    type: t.raw("type"),
    status: t.raw("status"),
  };

  return (
    <div className="space-y-8">
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={expediente.estudiante.nombre}
          description={t("form.subtitleEdit")}
          actions={
            <Button variant="ghost" asChild>
              <Link href={`/${locale}/expedientes/${id}`}>
                <ArrowLeft aria-hidden />
                {t("backToRecord")}
              </Link>
            </Button>
          }
        />
      </div>

      <FormularioExpediente
        textos={textos}
        rutaListado={`/${locale}/expedientes`}
        registro={expediente}
      />
    </div>
  );
}
