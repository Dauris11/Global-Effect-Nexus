/**
 * Portal Estudiante — ClickUp S6 · #395 (#396–#399).
 *
 * Es la única pantalla del sistema escrita para el joven y no para quien lo
 * administra, y eso sigue mandando sobre el estilo:
 *
 * **El GPA manda.** Es el número del que depende su beca, así que va en el
 * banner y coloreado por banda. El resto de cifras lo acompañan.
 *
 * **Nada se compara con nadie.** No hay percentiles ni "vas mejor que el 60%".
 * Un portal que ranquea a los becados de una fundación convierte una ayuda en
 * una competencia.
 *
 * **Un mes sin registrar no es una falta.** El bloque de condición distingue
 * las dos cosas (ver `MesDeCondicion.registrado`): un vacío administrativo no
 * puede leerse como un incumplimiento del joven.
 *
 * **Sin sesión no hay portal; sin expediente, tampoco.** El acceso no lo da un
 * permiso sino la propiedad de la fila: `estudiante.usuario_id`.
 */
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { es as esLocale, enUS } from "date-fns/locale";
import {
  BookOpen,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Heart,
  MinusCircle,
  UserRound,
  Wrench,
  XCircle,
} from "lucide-react";
import { currentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  condicionEnLaFundacion,
  estudianteDelUsuario,
  materiasDelEstudiante,
  notasPorCuatrimestre,
  proximosEventosDelPortal,
  resumenDelEstudiante,
} from "@/server/portales/queries";
import type {
  CondicionEnLaFundacion,
  CuatrimestreDelEstudiante,
  EventoDelPortal,
  MateriaDelEstudiante,
  ResumenDelEstudiante,
} from "@/server/portales/types";
import { BannerRol } from "@/components/portal/banner-rol";
import { AccesosRapidos, type AccesoRapido } from "@/components/portal/accesos-rapidos";
import { CardLista, ItemLista, EstadoVacio } from "@/components/portal/card-lista";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

const RESUMEN_VACIO: ResumenDelEstudiante = {
  gpa: null,
  promedio: null,
  cursadas: 0,
  aprobadas: 0,
  reprobadas: 0,
  en_prueba: 0,
  activas: 0,
  creditos_activos: 0,
};

const CONDICION_VACIA: CondicionEnLaFundacion = { meses: [], servicios: 0, reuniones: 0, de: 0 };

/** Color de la letra por banda. Literales: Tailwind no compila concatenaciones. */
const COLOR_LETRA: Record<string, string> = {
  A: "border-emerald-200 bg-emerald-50 text-emerald-600",
  B: "border-blue-200 bg-blue-50 text-blue-600",
  C: "border-amber-200 bg-amber-50 text-amber-600",
  D: "border-orange-200 bg-orange-50 text-orange-600",
  F: "border-red-200 bg-red-50 text-red-500",
};

const ACCESOS: AccesoRapido[] = [
  {
    href: "/academico/materias",
    icono: BookOpen,
    titulo: "Mis Materias",
    descripcion: "Catálogo y cupos del cuatrimestre",
    azulejo: "bg-emerald-50 text-emerald-600",
  },
  {
    href: "/academico/historial",
    icono: ClipboardList,
    titulo: "Calificaciones",
    descripcion: "Tu historial completo",
    azulejo: "bg-orange-50 text-orange-600",
  },
  {
    // El módulo de psicología aún no tiene pantalla; se marca apagado en vez
    // de enlazar a un 404. Ver `NavItem.disponible` en `lib/nav.ts`.
    href: "/psicologia",
    icono: Heart,
    titulo: "Cita de Psicología",
    descripcion: "Agenda confidencial",
    azulejo: "bg-rose-50 text-rose-600",
    disponible: false,
  },
];

/**
 * Cada bloque va en su propio `catch`.
 *
 * Si la agenda de eventos falla, el joven debe seguir viendo sus notas: en un
 * portal personal, vaciar la pantalla entera por un bloque secundario cuesta
 * más que mostrar ese bloque vacío.
 */
async function cargar(estudianteId: string) {
  const [resumen, materias, cuatrimestres, condicion, eventos] = await Promise.all([
    resumenDelEstudiante(estudianteId).catch(() => RESUMEN_VACIO),
    materiasDelEstudiante(estudianteId).catch(() => [] as MateriaDelEstudiante[]),
    notasPorCuatrimestre(estudianteId).catch(() => [] as CuatrimestreDelEstudiante[]),
    condicionEnLaFundacion(estudianteId).catch(() => CONDICION_VACIA),
    // Sin los eventos administrativos: la agenda del joven es la de la
    // Fundación de cara a él, no la operación interna (ver la consulta).
    proximosEventosDelPortal(5, ["administrativo"]).catch(() => [] as EventoDelPortal[]),
  ]);
  return { resumen, materias, cuatrimestres, condicion, eventos };
}

export default async function PortalEstudiantePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const t = await getTranslations("studentPortal");
  const fechaLocale = locale === "en" ? enUS : esLocale;
  const estudiante = await estudianteDelUsuario(user.id).catch(() => null);

  if (!estudiante) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <EmptyState
          icon={UserRound}
          title={t("noRecord")}
          description={t("noRecordHint")}
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard">{t("toDashboard")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const { resumen, materias, cuatrimestres, condicion, eventos } = await cargar(estudiante.id);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <BannerRol
        icono={Wrench}
        eyebrow={t("eyebrow")}
        iconoEyebrow={Wrench}
        titulo={t("greeting", { name: user.nombre.split(" ")[0] })}
        subtitulo={t("summary")}
        gradiente="bg-gradient-to-br from-[#2096BA] to-[#0a6a8a]"
        padding="p-5 md:p-6"
        insignia={estudiante.tipo === "becado" ? "Becado" : "Estudiante Regular"}
        kpis={[
          {
            valor: resumen.promedio !== null ? `${resumen.promedio}%` : "—",
            label: t("stats.average"),
          },
          {
            valor: resumen.gpa !== null ? resumen.gpa.toFixed(2) : "—",
            label: t("gpaLabel"),
            // El GPA es el número del que depende la beca: se colorea por
            // banda incluso sobre el degradado del banner.
            tono: resumen.gpa === null ? undefined : resumen.gpa < 2 ? "text-red-200" : undefined,
          },
          { valor: String(resumen.aprobadas), label: t("stats.passed") },
        ]}
      />

      <AccesosRapidos accesos={ACCESOS} columnas="sm:grid-cols-3" />

      <div className="grid gap-6 lg:grid-cols-2">
        <CardLista titulo={t("subjectsTitle")} icono={BookOpen}>
          {materias.length === 0 ? (
            <EstadoVacio mensaje={t("subjectsEmpty")} />
          ) : (
            materias.map((m) => (
              <ItemLista
                key={m.inscripcion_id}
                icono={BookOpen}
                azulejo="bg-blue-100 text-blue-600"
                titulo={m.nombre}
                detalle={m.profesor_nombre ?? m.periodo_nombre}
                derecha={
                  <Badge variant="neutral" className="text-[10px]">
                    {/* El mensaje ya lleva la cifra dentro ("{count} cr."):
                        se le pasa el argumento, no se concatena delante. */}
                    {t("creditsShort", { count: m.creditos })}
                  </Badge>
                }
              />
            ))
          )}
        </CardLista>

        <CardLista titulo={t("eventsTitle")} icono={CalendarClock}>
          {eventos.length === 0 ? (
            <EstadoVacio mensaje={t("eventsEmpty")} />
          ) : (
            eventos.map((e) => (
              <ItemLista
                key={e.id}
                icono={Calendar}
                azulejo="bg-primary/10 text-primary"
                titulo={e.titulo}
                detalle={[
                  format(new Date(e.fecha), "dd MMM", { locale: fechaLocale }),
                  e.hora_inicio,
                  e.ubicacion,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                derecha={
                  <Badge variant="neutral" className="text-[10px] capitalize">
                    {e.tipo}
                  </Badge>
                }
              />
            ))
          )}
        </CardLista>
      </div>

      {/* Calificaciones por cuatrimestre. */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <GraduationCap aria-hidden className="h-4 w-4" />
          {t("gradesTitle")}
        </h2>

        {cuatrimestres.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EstadoVacio mensaje={t("gradesEmpty")} />
            </CardContent>
          </Card>
        ) : (
          cuatrimestres.map((c) => (
            <Card key={c.cuatrimestre} className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-5 py-3">
                <h3 className="text-sm font-semibold">{c.cuatrimestre}</h3>
                <div className="flex items-center gap-2">
                  {c.promedio !== null && (
                    <Badge
                      className={
                        c.promedio >= 70
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-red-100 text-red-700 hover:bg-red-100"
                      }
                    >
                      {c.promedio}%
                    </Badge>
                  )}
                  {c.gpa !== null && (
                    <Badge
                      className={
                        c.gpa >= 2
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                          : "bg-orange-100 text-orange-700 hover:bg-orange-100"
                      }
                    >
                      {t("gpaLabel")} {c.gpa.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>

              <ul className="divide-y">
                {c.notas.map((n) => (
                  <li key={n.id} className="flex items-center gap-4 px-5 py-3">
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold",
                        COLOR_LETRA[n.nota_letra] ?? "border-slate-200 bg-slate-50 text-slate-600",
                      )}
                    >
                      {n.nota_letra}
                    </span>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">{n.materia}</p>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold">{n.nota_numerica}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {t("gpaLabel")} {n.gpa.toFixed(1)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ))
        )}
      </section>

      {/* Condición en la fundación. Un mes sin registrar se marca aparte: no
          es lo mismo que no haber cumplido. */}
      <CardLista
        titulo={t("standingTitle")}
        icono={CheckCircle2}
        accion={
          condicion.meses.length > 0 ? (
            <span className="text-xs text-muted-foreground">
              {t("standingSummary", {
                services: condicion.servicios,
                meetings: condicion.reuniones,
                months: condicion.de,
              })}
            </span>
          ) : null
        }
      >
        {condicion.meses.length === 0 ? (
          <EstadoVacio mensaje={t("standingEmpty")} />
        ) : (
          condicion.meses.map((m) => (
            <div
              key={m.mes}
              className="flex flex-wrap items-center gap-4 rounded-xl border bg-muted/20 p-3"
            >
              <p className="w-20 shrink-0 text-sm font-semibold">
                {format(new Date(`${m.mes}-01T00:00:00`), "MMM yyyy", { locale: fechaLocale })}
              </p>

              {!m.registrado ? (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MinusCircle aria-hidden className="h-4 w-4" />
                  {t("notRecorded")}
                </span>
              ) : (
                <div className="flex flex-wrap items-center gap-5">
                  <span className="flex items-center gap-2 text-sm">
                    {m.hizo_servicio ? (
                      <CheckCircle2 aria-hidden className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle aria-hidden className="h-4 w-4 text-red-400" />
                    )}
                    {m.hizo_servicio ? t("service") : t("noService")}
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    {m.asistio_reunion ? (
                      <CheckCircle2 aria-hidden className="h-4 w-4 text-violet-600" />
                    ) : (
                      <XCircle aria-hidden className="h-4 w-4 text-red-400" />
                    )}
                    {m.asistio_reunion ? t("meeting") : t("noMeeting")}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </CardLista>
    </div>
  );
}
