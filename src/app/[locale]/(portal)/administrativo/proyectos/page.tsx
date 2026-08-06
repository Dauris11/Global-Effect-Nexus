/**
 * Proyectos — ClickUp S9 · #448–449.
 *
 * Cada proyecto lleva su riel de estado y una barra de avance calculada desde
 * las tareas cerradas, no desde el campo manual.
 */
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FolderKanban, User } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { listarProyectosConAvance } from "@/server/operaciones/queries";
import type { ProyectoConAvance } from "@/server/operaciones/types";
import type { EstadoDominio } from "@/lib/estados";
import { paletaDe } from "@/lib/estados";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ChipEstado } from "@/components/ui/chip-estado";
import { BarraProgreso } from "@/components/ui/barra-progreso";
import { EmptyState } from "@/components/ui/empty-state";
import { BotonNuevoProyecto } from "./dialogo-nuevo-proyecto";

/** Estado del proyecto → color del sistema. */
function bandaDeProyecto(estado: string): EstadoDominio {
  switch (estado) {
    case "en_curso":
      return "tarea-progreso";
    case "completado":
      return "tarea-completada";
    case "pausado":
      return "prioridad-alta";
    default:
      return "tarea-pendiente";
  }
}

async function cargar(): Promise<ProyectoConAvance[]> {
  try {
    return await listarProyectosConAvance();
  } catch {
    return [];
  }
}

export default async function ProyectosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const [puedeEscribir, t] = await Promise.all([
    can(user.rol, "operaciones.escribir"),
    getTranslations("admin"),
  ]);
  const proyectos = await cargar();

  const fecha = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" });
  const formatear = (f: string | null) => {
    if (!f) return null;
    const [a, m, d] = f.split("-").map(Number);
    return fecha.format(new Date(a, m - 1, d));
  };

  const textosDialogo = {
    titulo: t("newProject.title"),
    subtitulo: t("newProject.subtitle"),
    campoNombre: t("project.name"),
    campoNombrePlaceholder: t("newProject.namePlaceholder"),
    campoDescripcion: t("project.description"),
    campoResponsable: t("project.lead"),
    campoEstado: t("project.status"),
    campoInicio: t("project.start"),
    campoFin: t("project.end"),
    ayudaAvance: t("newProject.progressHint"),
    crear: t("newProject.create"),
    creando: t("newProject.creating"),
    cancelar: t("newTask.cancel"),
    cerrar: t("task.close"),
    errorNombre: t("newProject.nameRequired"),
    errorGeneral: t("newProject.error"),
    estado: {
      planificacion: t("projectStatus.planificacion"),
      en_curso: t("projectStatus.en_curso"),
      completado: t("projectStatus.completado"),
      pausado: t("projectStatus.pausado"),
    },
  };

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("projects.title")}
          description={t("projects.description")}
          actions={
            puedeEscribir && (
              <BotonNuevoProyecto etiqueta={t("projects.new")} textos={textosDialogo} />
            )
          }
        />
      </div>

      {proyectos.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={t("projects.empty")}
          description={t("projects.emptyHint")}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {proyectos.map((p, i) => {
            const banda = bandaDeProyecto(p.estado);
            return (
              <Card
                key={p.id}
                className={cn("animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out border-l-[3px] p-5", paletaDe(banda).riel)}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold leading-tight">{p.nombre}</h2>
                  <ChipEstado estado={banda} punto className="shrink-0">
                    {t(`projectStatus.${p.estado}` as never)}
                  </ChipEstado>
                </div>

                {p.descripcion && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {p.descripcion}
                  </p>
                )}

                <div className="mt-4 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="tabular-nums text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {t("project.progress")}
                    </span>
                    <span className="tabular-nums text-xs tabular-nums text-muted-foreground">
                      {p.total_tareas > 0
                        ? t("project.tasksDone", {
                            done: p.tareas_completadas,
                            total: p.total_tareas,
                          })
                        : t("project.noTasks")}
                    </span>
                  </div>
                  <BarraProgreso
                    valor={p.avance}
                    estado={banda}
                    etiqueta={`${t("project.progress")}: ${p.nombre}`}
                    mostrarCifra
                  />
                </div>

                <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
                  {p.responsable && (
                    <div className="flex items-center gap-1.5">
                      <User className="size-3.5" aria-hidden />
                      <dt className="sr-only">{t("project.lead")}</dt>
                      <dd>{p.responsable}</dd>
                    </div>
                  )}
                  {(p.fecha_inicio || p.fecha_fin) && (
                    <div>
                      <dt className="sr-only">{t("project.dates")}</dt>
                      <dd className="tabular-nums tabular-nums">
                        {formatear(p.fecha_inicio) ?? "—"} → {formatear(p.fecha_fin) ?? "—"}
                      </dd>
                    </div>
                  )}
                </dl>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
