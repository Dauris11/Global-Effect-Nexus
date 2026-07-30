/**
 * Portal Estudiante — ClickUp S6 · #395 (#396–#399).
 *
 * Es la única pantalla del sistema escrita para el joven y no para quien lo
 * administra, y eso cambia todo lo demás. Los módulos de Académico responden
 * "cómo va la fundación" con tablas de trescientas filas y un buscador; aquí no
 * hay nada que buscar, porque solo hay una persona: la que está mirando.
 *
 * De ahí las cuatro decisiones de esta pantalla:
 *
 * **El GPA manda.** Es el número del que depende su beca, así que ocupa el
 * banner entero y va coloreado por banda (§3.2). El resto de cifras lo
 * acompañan en pequeño, no compiten con él.
 *
 * **Nada se compara con nadie.** No hay percentiles ni "vas mejor que el 60%".
 * Un portal estudiantil que ranquea a los becados de una fundación convierte
 * una ayuda en una competencia, y eso no es lo que esta institución hace.
 *
 * **Un mes sin registrar no es una falta.** El bloque de condición distingue
 * las dos cosas explícitamente (ver `condicionEnLaFundacion`): un vacío
 * administrativo no puede leerse como un incumplimiento del joven.
 *
 * **Sin sesión no hay portal; sin expediente, tampoco.** El acceso no lo da un
 * permiso sino la propiedad de la fila: `estudiante.usuario_id`. Un usuario con
 * rol estudiante al que todavía no le han enlazado el expediente ve una
 * explicación, no un error ni un panel vacío.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  HeartHandshake,
  MapPin,
  UserRound,
} from "lucide-react";
import { currentUser } from "@/lib/auth";
import { bandaDeGpa, bandaDeNota, paletaDe } from "@/lib/estados";
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
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChipEstado } from "@/components/ui/chip-estado";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const CONDICION_VACIA: CondicionEnLaFundacion = {
  meses: [],
  servicios: 0,
  reuniones: 0,
  de: 0,
};

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
    proximosEventosDelPortal(5, ["administrativo"]).catch(
      () => [] as EventoDelPortal[],
    ),
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
  const estudiante = await estudianteDelUsuario(user.id).catch(() => null);

  if (!estudiante) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("greeting", { name: user.nombre.split(" ")[0] })}
        />
        <EmptyState
          icon={UserRound}
          title={t("noRecord")}
          description={t("noRecordHint")}
          action={
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard`}>{t("toDashboard")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const { resumen, materias, cuatrimestres, condicion, eventos } = await cargar(
    estudiante.id,
  );

  const bandaGpa = bandaDeGpa(resumen.gpa);
  const paletaGpa = paletaDe(bandaGpa);

  const fechaCorta = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" });
  const mesLargo = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });

  /** `YYYY-MM-DD` → día y mes, sin pasar por la zona horaria del servidor. */
  const formatearDia = (f: string) => {
    const [a, m, d] = f.split("-").map(Number);
    return fechaCorta.format(new Date(a, m - 1, d));
  };
  /** `YYYY-MM` → nombre del mes. */
  const formatearMes = (f: string) => {
    const [a, m] = f.split("-").map(Number);
    return mesLargo.format(new Date(a, m - 1, 1));
  };

  /** Dónde estudia: lo primero que haya, que no siempre es lo mismo por joven. */
  const lugar = estudiante.universidad ?? estudiante.donde_estudia;
  const subtitulo = [estudiante.programa, lugar].filter(Boolean).join(" · ");

  // Cifras que acompañan al GPA. Deliberadamente en texto pequeño y no en
  // StatCards: en esta pantalla la única cifra que merece tamaño es el GPA.
  const acompanan = [
    { clave: "average", valor: resumen.promedio != null ? resumen.promedio.toFixed(1) : "—" },
    { clave: "passed", valor: `${resumen.aprobadas} / ${resumen.cursadas}` },
    { clave: "enrolled", valor: String(resumen.activas) },
    { clave: "credits", valor: String(resumen.creditos_activos) },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("greeting", { name: estudiante.nombre.split(" ")[0] })}
          description={subtitulo || t("summary")}
          actions={
            <ChipEstado estado={estudiante.tipo === "becado" ? "confid-bajo" : "neutral"}>
              {t(`type.${estudiante.tipo}` as never)}
            </ChipEstado>
          }
        />
      </div>

      {/* Banner de GPA — #396 */}
      <Card
        className={cn("animate-fade-up border-l-[3px] p-6", paletaGpa.riel)}
        style={{ animationDelay: "40ms" }}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {t("gpaLabel")}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={cn(
                  "font-mono text-5xl font-semibold tabular-nums tracking-tight",
                  resumen.gpa != null ? paletaGpa.texto : "text-muted-foreground",
                )}
              >
                {resumen.gpa != null ? resumen.gpa.toFixed(2) : "—"}
              </span>
              <span className="font-mono text-sm text-muted-foreground">
                {t("gpaScale")}
              </span>
            </div>
            <p className="mt-2 max-w-md text-[13px] text-muted-foreground">
              {resumen.gpa != null ? t(`gpaHint.${bandaGpa}` as never) : t("gpaEmpty")}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4 sm:text-right">
            {acompanan.map((c) => (
              <div key={c.clave}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  {t(`stats.${c.clave}` as never)}
                </dt>
                <dd className="mt-1 font-mono text-xl font-semibold tabular-nums">
                  {c.valor}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Materias en curso — #397 */}
          <Card className="animate-fade-up" style={{ animationDelay: "80ms" }}>
            <CardHeader>
              <CardTitle>{t("subjectsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {materias.length > 0 ? (
                materias.map((m) => (
                  <div
                    key={m.inscripcion_id}
                    className="rounded-md px-3 py-2.5 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-sm font-medium text-foreground">
                        {m.nombre}
                      </p>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {t("creditsShort", { count: m.creditos })}
                      </span>
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-muted-foreground">
                      {m.codigo && <span className="font-mono">{m.codigo}</span>}
                      {m.profesor_nombre && <span>{m.profesor_nombre}</span>}
                      {m.horario && <span>{m.horario}</span>}
                      {m.aula && <span>{m.aula}</span>}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title={t("subjectsEmpty")}
                  description={t("subjectsEmptyHint")}
                  className="border-0"
                />
              )}
            </CardContent>
          </Card>

          {/* Calificaciones por cuatrimestre — #397 */}
          <Card className="animate-fade-up" style={{ animationDelay: "120ms" }}>
            <CardHeader>
              <CardTitle>{t("gradesTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {cuatrimestres.length > 0 ? (
                cuatrimestres.map((c) => (
                  <section key={c.cuatrimestre} className="space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        {c.cuatrimestre}
                      </h3>
                      <p className="font-mono text-xs tabular-nums text-muted-foreground">
                        {t("termSummary", {
                          gpa: c.gpa != null ? c.gpa.toFixed(2) : "—",
                          average: c.promedio != null ? c.promedio.toFixed(1) : "—",
                        })}
                      </p>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("table.subject")}</TableHead>
                          <TableHead className="text-right">{t("table.grade")}</TableHead>
                          <TableHead className="text-right">{t("table.letter")}</TableHead>
                          <TableHead className="text-right">{t("table.gpa")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {c.notas.map((n) => {
                          const banda = bandaDeNota(n.nota_numerica);
                          return (
                            <TableRow key={n.id}>
                              <TableCell className="font-medium">{n.materia}</TableCell>
                              <TableCell
                                className={cn(
                                  "text-right font-mono tabular-nums",
                                  paletaDe(banda).texto,
                                )}
                              >
                                {n.nota_numerica.toFixed(1)}
                              </TableCell>
                              <TableCell className="text-right">
                                {/* La letra repite en texto lo que dice el color:
                                    el color solo nunca comunica un estado (§3.2). */}
                                <ChipEstado estado={banda}>{n.nota_letra}</ChipEstado>
                              </TableCell>
                              <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                                {n.gpa.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </section>
                ))
              ) : (
                <EmptyState
                  icon={ClipboardList}
                  title={t("gradesEmpty")}
                  description={t("gradesEmptyHint")}
                  className="border-0"
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Condición en la fundación — #398 */}
          <Card className="animate-fade-up" style={{ animationDelay: "160ms" }}>
            <CardHeader>
              <CardTitle>{t("standingTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {condicion.meses.length > 0 ? (
                <>
                  <p className="text-[13px] text-muted-foreground">
                    {t("standingSummary", {
                      services: condicion.servicios,
                      meetings: condicion.reuniones,
                      months: condicion.de,
                    })}
                  </p>
                  <ul className="space-y-1">
                    {condicion.meses.map((m) => (
                      <li
                        key={m.mes}
                        className="flex items-center justify-between gap-3 rounded-md px-2 py-2"
                      >
                        <span className="text-sm capitalize text-foreground">
                          {formatearMes(m.mes)}
                        </span>
                        {m.registrado ? (
                          <span className="flex shrink-0 gap-1.5">
                            <ChipEstado
                              estado={m.hizo_servicio ? "tarea-completada" : "neutral"}
                            >
                              {t(m.hizo_servicio ? "service" : "noService")}
                            </ChipEstado>
                            <ChipEstado
                              estado={m.asistio_reunion ? "tarea-completada" : "neutral"}
                            >
                              {t(m.asistio_reunion ? "meeting" : "noMeeting")}
                            </ChipEstado>
                          </span>
                        ) : (
                          /* Sin fila en `registro_servicio`: no se ha anotado,
                             que no es lo mismo que no haber cumplido. */
                          <span className="shrink-0 text-[13px] text-muted-foreground">
                            {t("notRecorded")}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <EmptyState
                  icon={HeartHandshake}
                  title={t("standingEmpty")}
                  className="border-0"
                />
              )}
            </CardContent>
          </Card>

          {/* Próximos eventos — #399 */}
          <Card className="animate-fade-up" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <CardTitle>{t("eventsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {eventos.length > 0 ? (
                eventos.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/60"
                  >
                    <span className="flex size-9 shrink-0 flex-col items-center justify-center rounded-md bg-muted font-mono text-[10px] leading-none text-muted-foreground">
                      {formatearDia(e.fecha)
                        .split(" ")
                        .map((s, i) => (
                          <span
                            key={i}
                            className={i === 0 ? "text-sm font-semibold text-foreground" : ""}
                          >
                            {s}
                          </span>
                        ))}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {e.titulo}
                      </p>
                      <p className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                        <span className="capitalize">{e.tipo}</span>
                        {e.hora_inicio && <span className="font-mono">{e.hora_inicio}</span>}
                        {e.ubicacion && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" aria-hidden />
                            {e.ubicacion}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={CalendarClock}
                  title={t("eventsEmpty")}
                  className="border-0"
                />
              )}
            </CardContent>
          </Card>

          {/* Catálogo de materias: el único enlace del portal a un módulo del
              sistema. El rol `estudiante` tiene `academico.leer`, así que la
              pantalla existe y es suya; el resto del menú no lo es. */}
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/${locale}/academico/materias`}>
              <GraduationCap aria-hidden />
              {t("browseCatalog")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
