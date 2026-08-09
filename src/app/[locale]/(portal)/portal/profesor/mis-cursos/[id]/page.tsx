import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { CursoDetalleClient } from "./curso-detalle-client";

export const dynamic = "force-dynamic";

export default async function CursoDetallePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  return <CursoDetalleClient courseId={id} locale={locale} />;
}
