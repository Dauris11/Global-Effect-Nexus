/**
 * Tareas — tablero Kanban del equipo. ClickUp S9 · #439–443.
 *
 * Carga los datos en el servidor y delega la interacción al cliente. La
 * visibilidad de cada tarea la resuelve la consulta: quien no administra
 * operaciones solo ve las públicas y las suyas.
 */
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  listarTareasDelTablero,
  listarProyectos,
  listarAsignables,
} from "@/server/operaciones/queries";
import { PageHeader } from "@/components/ui/page-header";
import { VistaTareas } from "./vista-tareas";

/** Carga tolerante: sin base de datos la pantalla se ve vacía, no rota. */
async function cargar(usuarioId: string, esAdmin: boolean) {
  try {
    const [tareas, proyectos, asignables] = await Promise.all([
      listarTareasDelTablero(usuarioId, esAdmin),
      listarProyectos(),
      listarAsignables(),
    ]);
    return { tareas, proyectos, asignables };
  } catch {
    return { tareas: [], proyectos: [], asignables: [] };
  }
}

export default async function TareasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const [puedeLeer, puedeEscribir, t] = await Promise.all([
    can(user.rol, "operaciones.leer"),
    can(user.rol, "operaciones.escribir"),
    getTranslations("admin"),
  ]);

  const { tareas, proyectos, asignables } = await cargar(user.id, puedeLeer);

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("tasks.title")}
          description={t("tasks.description")}
        />
      </div>

      <div className="animate-fade-up space-y-4" style={{ animationDelay: "60ms" }}>
        <VistaTareas
          tareas={tareas}
          proyectos={proyectos}
          asignables={asignables}
          puedeEscribir={puedeEscribir}
          locale={locale}
          etiquetaNueva={t("tasks.new")}
          textosTablero={{
            columnas: {
              pendiente: t("taskStatus.pendiente"),
              en_progreso: t("taskStatus.en_progreso"),
              completada: t("taskStatus.completada"),
            },
            prioridad: {
              baja: t("priority.baja"),
              media: t("priority.media"),
              alta: t("priority.alta"),
              urgente: t("priority.urgente"),
            },
            estado: {
              pendiente: t("taskStatus.pendiente"),
              en_progreso: t("taskStatus.en_progreso"),
              completada: t("taskStatus.completada"),
              cancelada: t("taskStatus.cancelada"),
            },
            visibilidad: {
              todos: t("visibility.todos"),
              asignados: t("visibility.asignados"),
            },
            vacio: t("board.empty"),
            vacioAyuda: t("board.emptyHint"),
            anadir: t("board.add"),
            moverA: t("board.moveTo"),
            sinProyecto: t("board.noProject"),
            sinAsignar: t("board.unassigned"),
            vencida: t("board.overdue"),
            hoy: t("board.today"),
            errorMover: t("board.moveError"),
            movida: t("board.moved"),
            descripcion: t("task.description"),
            fechaLimite: t("task.dueDate"),
            asignados: t("task.assignees"),
            proyecto: t("task.project"),
            cerrar: t("task.close"),
          }}
          textosDialogo={{
            titulo: t("newTask.title"),
            subtitulo: t("newTask.subtitle"),
            campoTitulo: t("task.title"),
            campoTituloPlaceholder: t("task.titlePlaceholder"),
            campoDescripcion: t("task.description"),
            campoProyecto: t("task.project"),
            campoPrioridad: t("task.priority"),
            campoVisibilidad: t("task.visibility"),
            campoFechaLimite: t("task.dueDate"),
            campoAsignados: t("task.assignees"),
            ayudaAsignados: t("newTask.assigneesHint"),
            sinProyecto: t("board.noProject"),
            crear: t("newTask.create"),
            creando: t("newTask.creating"),
            cancelar: t("newTask.cancel"),
            cerrar: t("task.close"),
            errorTitulo: t("newTask.titleRequired"),
            errorGeneral: t("newTask.error"),
            prioridad: {
              baja: t("priority.baja"),
              media: t("priority.media"),
              alta: t("priority.alta"),
              urgente: t("priority.urgente"),
            },
            visibilidad: {
              todos: t("visibility.todos"),
              asignados: t("visibility.asignados"),
            },
          }}
        />
      </div>
    </div>
  );
}
