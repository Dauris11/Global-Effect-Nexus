/**
 * Cursos técnicos — ClickUp S6 · #219.
 *
 * Tarjetas y no tabla, al contrario que Materias, porque el dato que se consulta
 * de un curso es **el cupo** y una barra de ocupación se lee de un vistazo donde
 * "18 / 30" en una celda no dice nada. Es la misma razón por la que Proyectos usa
 * tarjetas con barra de avance.
 *
 * Reparto de señales (estándar §5, "un riel por registro"): el **riel** lleva el
 * estado del curso —su ciclo de vida— y la **barra** lleva el cupo con su propio
 * color. La barra no es un segundo riel: `barra-progreso` está en el inventario
 * como acompañante de la firma, no como sustituto.
 *
 * Permiso de lectura `academico.leer`; crear exige `academico.escribir`.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, GraduationCap, Lock, User } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  docentesParaSelector,
  listarCursos,
  listarPeriodos,
  resumenCursos,
} from "@/server/academico/queries";
import type { Curso } from "@/server/academico/types";
import type { EstadoDominio } from "@/lib/estados";
import { paletaDe } from "@/lib/estados";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChipEstado } from "@/components/ui/chip-estado";
import { BarraProgreso } from "@/components/ui/barra-progreso";
import { EmptyState } from "@/components/ui/empty-state";
import { Buscador } from "../buscador";
import { BotonNuevoCurso, type TextosNuevoCurso } from "./dialogo-nuevo-curso";

/** Estado del curso → color del sistema (mismo criterio que Proyectos). */
function bandaDeCurso(estado: string): EstadoDominio {
  switch (estado) {
    case "activo":
      return "tarea-progreso";
    case "finalizado":
      return "tarea-completada";
    default:
      return "tarea-pendiente";
  }
}

/**
 * Color de la barra de cupo.
 *
 * Pasarse de capacidad sí es un problema —hay gente inscrita que no cabe— y por
 * eso es lo único que se pinta en rojo. Un curso lleno no es un fallo: es la
 * meta cumplida, y va en verde.
 */
function bandaDeCupo(inscritos: number, capacidad: number): EstadoDominio {
  if (capacidad <= 0) return "neutral";
  if (inscritos > capacidad) return "prioridad-urgente";
  if (inscritos === capacidad) return "tarea-completada";
  return "tarea-progreso";
}

/**
 * `conDocentes` solo es cierto para quien puede crear cursos: la lista de
 * personas del sistema es para llenar el desplegable del alta, no para quien
 * solo consulta el catálogo (mismo criterio que en Materias).
 */
async function cargar(buscar: string | undefined, conDocentes: boolean) {
  try {
    const [cursos, resumen, periodos, docentes] = await Promise.all([
      listarCursos(buscar),
      resumenCursos(),
      listarPeriodos(),
      conDocentes ? docentesParaSelector() : Promise.resolve([]),
    ]);
    return { cursos, resumen, periodos, docentes, error: false };
  } catch {
    return {
      cursos: [] as Curso[],
      resumen: { total: 0, activos: 0, inscritos: 0, cupos: 0 },
      periodos: [] as { id: string; nombre: string }[],
      docentes: [] as { id: string; nombre: string }[],
      error: true,
    };
  }
}

export default async function CursosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q: qBruto } = await searchParams;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const [puedeLeer, puedeEscribir, t] = await Promise.all([
    can(user.rol, "academico.leer"),
    can(user.rol, "academico.escribir"),
    getTranslations("academic"),
  ]);

  if (!puedeLeer) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow={t("eyebrow")} title={t("courses.title")} />
        <EmptyState
          icon={Lock}
          title={t("forbidden")}
          description={t("forbiddenHint")}
          action={
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard`}>
                <ArrowLeft aria-hidden />
                {t("backToDashboard")}
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const q = (qBruto ?? "").trim();
  const { cursos, resumen, periodos, docentes, error } = await cargar(
    q || undefined,
    puedeEscribir,
  );

  const textosDialogo: TextosNuevoCurso = {
    titulo: t("newCourse.title"),
    subtitulo: t("newCourse.subtitle"),
    nombre: t("course.name"),
    nombrePlaceholder: t("newCourse.namePlaceholder"),
    descripcion: t("course.description"),
    periodo: t("course.term"),
    sinPeriodo: t("noTerm"),
    estado: t("course.status"),
    capacidad: t("course.capacity"),
    horario: t("course.schedule"),
    horarioPlaceholder: t("newCourse.scheduleHint"),
    modalidad: t("course.mode"),
    ayudaInscritos: t("newCourse.enrolledHint"),
    crear: t("newCourse.create"),
    creando: t("newCourse.creating"),
    cancelar: t("cancel"),
    cerrar: t("close"),
    errorNombre: t("newCourse.nameRequired"),
    errorGeneral: t("newCourse.error"),
    estados: {
      activo: t("courseStatus.activo"),
      planificado: t("courseStatus.planificado"),
      finalizado: t("courseStatus.finalizado"),
    },
    modalidades: {
      presencial: t("courseMode.presencial"),
      virtual: t("courseMode.virtual"),
      mixto: t("courseMode.mixto"),
    },
    selectorDocente: {
      etiqueta: t("course.teacher"),
      sinAsignar: t("teacherPicker.unassigned"),
      externo: t("teacherPicker.external"),
      nombreExterno: t("teacherPicker.externalName"),
      ayudaExterno: t("teacherPicker.externalHint"),
    },
  };

  const ocupacion =
    resumen.cupos > 0 ? Math.round((resumen.inscritos / resumen.cupos) * 100) : 0;

  const cifras = [
    { clave: "total", valor: String(resumen.total) },
    { clave: "active", valor: String(resumen.activos) },
    { clave: "enrolled", valor: `${resumen.inscritos} / ${resumen.cupos}` },
    { clave: "occupancy", valor: `${ocupacion}%` },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("courses.title")}
          description={t("courses.description")}
          actions={
            puedeEscribir && (
              <BotonNuevoCurso
                etiqueta={t("courses.new")}
                textos={textosDialogo}
                periodos={periodos}
                docentes={docentes}
              />
            )
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cifras.map((c, i) => (
          <Card
            key={c.clave}
            className="animate-fade-up p-5"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {t(`courses.stats.${c.clave}` as never)}
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">{c.valor}</p>
          </Card>
        ))}
      </div>

      <Buscador
        valor={q}
        rutaLimpiar={`/${locale}/academico/cursos`}
        textos={{
          etiqueta: t("search"),
          placeholder: t("courses.searchPlaceholder"),
          aplicar: t("apply"),
          limpiar: t("clear"),
        }}
      />

      {error ? (
        <EmptyState
          icon={GraduationCap}
          title={t("loadError")}
          description={t("loadErrorHint")}
        />
      ) : cursos.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={q ? t("noMatches") : t("courses.empty")}
          description={q ? t("noMatchesHint") : t("courses.emptyHint")}
          action={
            q ? (
              <Button variant="outline" asChild>
                <Link href={`/${locale}/academico/cursos`}>{t("clear")}</Link>
              </Button>
            ) : (
              puedeEscribir && (
                <BotonNuevoCurso
                  etiqueta={t("courses.new")}
                  textos={textosDialogo}
                  periodos={periodos}
                  docentes={docentes}
                />
              )
            )
          }
        />
      ) : (
        <section className="space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("courses.count", { count: cursos.length })}
          </h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cursos.map((c, i) => {
              const banda = bandaDeCurso(c.estado);
              const bandaCupo = bandaDeCupo(c.inscritos, c.capacidad);
              const porcentaje =
                c.capacidad > 0
                  ? Math.min(100, Math.round((c.inscritos / c.capacidad) * 100))
                  : 0;
              const pasado = c.inscritos > c.capacidad;

              return (
                <Card
                  key={c.id}
                  className={cn("animate-fade-up border-l-[3px] p-5", paletaDe(banda).riel)}
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold leading-tight">{c.nombre}</h3>
                    <ChipEstado estado={banda} punto className="shrink-0">
                      {t(`courseStatus.${c.estado}` as never)}
                    </ChipEstado>
                  </div>

                  {c.descripcion && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {c.descripcion}
                    </p>
                  )}

                  <div className="mt-4 space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        {t("course.occupancy")}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-xs tabular-nums",
                          pasado
                            ? "font-semibold text-prioridad-urgente"
                            : "text-muted-foreground",
                        )}
                      >
                        {t("course.enrolledOf", {
                          enrolled: c.inscritos,
                          capacity: c.capacidad,
                        })}
                      </span>
                    </div>
                    <BarraProgreso
                      valor={porcentaje}
                      estado={bandaCupo}
                      etiqueta={`${t("course.occupancy")}: ${c.nombre}`}
                    />
                    {pasado && (
                      <p className="text-[13px] font-medium text-prioridad-urgente">
                        {t("course.overCapacity", { over: c.inscritos - c.capacidad })}
                      </p>
                    )}
                  </div>

                  <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
                    {c.docente && (
                      <div className="flex items-center gap-1.5">
                        <User className="size-3.5" aria-hidden />
                        <dt className="sr-only">{t("course.teacher")}</dt>
                        <dd>{c.docente}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="sr-only">{t("course.mode")}</dt>
                      <dd>{t(`courseMode.${c.modalidad}` as never)}</dd>
                    </div>
                    {c.periodo_nombre && (
                      <div>
                        <dt className="sr-only">{t("course.term")}</dt>
                        <dd className="font-mono">{c.periodo_nombre}</dd>
                      </div>
                    )}
                    {c.horario && (
                      <div>
                        <dt className="sr-only">{t("course.schedule")}</dt>
                        <dd>{c.horario}</dd>
                      </div>
                    )}
                  </dl>
                </Card>
              );
            })}
          </div>

          {cursos.length === 200 && (
            <p className="text-[13px] text-muted-foreground">{t("limitHint")}</p>
          )}
        </section>
      )}
    </div>
  );
}
