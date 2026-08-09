import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { cursosDelDocente } from "@/server/portales/queries";
import type { CursoDelDocente } from "@/server/portales/types";
import { MisCursosClient } from "./mis-cursos-client";

export const dynamic = "force-dynamic";

export default async function MisCursosProfesorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const cursos = await cursosDelDocente(user.id).catch(() => [] as CursoDelDocente[]);

  return <MisCursosClient locale={locale} cursos={cursos} />;
}
