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

export const dynamic = "force-dynamic";

const RESUMEN_VACIO: ResumenDelDocente = {
  cursos_activos: 0,
  inscritos: 0,
  notas: 0,
  materias: 0,
};

export default async function PortalProfesorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const t = await getTranslations("teacherPortal");

  // Cada bloque con su propio `catch`: si falla el listado de cursos, las
  // cifras del banner siguen siendo útiles, y al revés.
  const [resumen, cursos] = await Promise.all([
    resumenDelDocente(user.id).catch(() => RESUMEN_VACIO),
    cursosDelDocente(user.id).catch(() => [] as CursoDelDocente[]),
  ]);

  const accesos: AccesoRapido[] = [
    {
      href: "/academico/cursos",
      icono: BookOpen,
      titulo: t("shortcuts.courses.label"),
      descripcion: t("shortcuts.courses.hint"),
      azulejo: "bg-emerald-50 text-emerald-600",
    },
    {
      href: "/academico/materias",
      icono: Layers,
      titulo: t("shortcuts.subjects.label"),
      descripcion: t("shortcuts.subjects.hint"),
      azulejo: "bg-blue-50 text-blue-600",
    },
    {
      href: "/academico/calificaciones",
      icono: ClipboardList,
      titulo: t("shortcuts.grades.label"),
      descripcion: t("shortcuts.grades.hint"),
      azulejo: "bg-orange-50 text-orange-600",
    },
    {
      href: "/calendario",
      icono: Calendar,
      titulo: t("shortcuts.calendar.label"),
      descripcion: t("shortcuts.calendar.hint"),
      azulejo: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <BannerRol
        icono={BookOpen}
        eyebrow={t("eyebrow")}
        iconoEyebrow={GraduationCap}
        titulo={t("greeting", { name: user.nombre.split(" ")[0] })}
        subtitulo={t("summary")}
        gradiente="bg-gradient-to-br from-emerald-500 to-emerald-700"
        kpis={[
          { valor: String(resumen.cursos_activos), label: t("stats.courses") },
          { valor: String(resumen.inscritos), label: t("stats.students") },
          { valor: String(resumen.notas), label: t("stats.grades") },
        ]}
      />

      <AccesosRapidos accesos={accesos} />

      <CardLista titulo={t("coursesTitle")} icono={BookOpen}>
        {cursos.length === 0 ? (
          <EstadoVacio mensaje={t("coursesEmpty")} />
        ) : (
          cursos.map((c) => (
            <ItemLista
              key={c.id}
              icono={BookOpen}
              azulejo="bg-emerald-100 text-emerald-600"
              titulo={c.nombre}
              detalle={[
                c.periodo_nombre,
                // `enrolledCount` es un plural ICU y `averageShort` lleva su
                // valor dentro: ambos reciben el argumento en vez de que se
                // les pegue la cifra por fuera.
                `${t("enrolledCount", { count: c.inscritos })} / ${c.capacidad}`,
                // El promedio solo aparece cuando ya hay algo calificado.
                c.promedio !== null
                  ? t("averageShort", { value: `${c.promedio}%` })
                  : t("noGradesYet"),
              ]
                .filter(Boolean)
                .join(" · ")}
              derecha={
                <Badge variant="neutral" className="text-[10px] capitalize">
                  {c.modalidad}
                </Badge>
              }
            />
          ))
        )}
      </CardLista>
    </div>
  );
}
