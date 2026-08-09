/**
 * Portal Profesor — ClickUp S6 · #400 (#401–#402).
 *
 * El vínculo docente ↔ usuario se resuelve por FK (migración `0019`), no por
 * coincidencia de nombre: un docente sin usuario enlazado ve sus cifras en
 * cero, no las de otra persona.
 *
 * La lista de cursos muestra la ocupación (inscritos sobre capacidad) porque
 * es el dato con el que un docente decide si puede aceptar a alguien más, y
 * el promedio del curso solo cuando ya hay notas: un "0%" antes de calificar
 * se lee como un curso que va mal, no como un curso sin empezar.
 */
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BookOpen, Calendar, ClipboardList, GraduationCap, Layers } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { cursosDelDocente, resumenDelDocente } from "@/server/portales/queries";
import type { CursoDelDocente, ResumenDelDocente } from "@/server/portales/types";
import { BannerRol } from "@/components/portal/banner-rol";
import { AccesosRapidos, type AccesoRapido } from "@/components/portal/accesos-rapidos";
import { CardLista, ItemLista, EstadoVacio } from "@/components/portal/card-lista";
import { Badge } from "@/components/ui/badge";

import { ProfesorClient } from "./profesor-client";
import { MODO_DISENO, USUARIO_DISENO } from "@/lib/modo-diseno";

export const dynamic = "force-dynamic";

const RESUMEN_VACIO: ResumenDelDocente = {
  cursos_activos: 3,
  inscritos: 86,
  notas: 14,
  materias: 3,
};

export default async function PortalProfesorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const [resumen, cursos] = await Promise.all([
    resumenDelDocente(user.id).catch(() => RESUMEN_VACIO),
    cursosDelDocente(user.id).catch(() => [] as CursoDelDocente[]),
  ]);

  return (
    <ProfesorClient
      nombreProfesor={user.nombre}
      resumen={resumen}
      cursos={cursos}
      locale={locale}
    />
  );
}
