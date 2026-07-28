/**
 * Portal Administrativo — ClickUp S9 · #456–459.
 *
 * Tres piezas: la cabecera con las cifras que importan hoy (#457), los accesos
 * a los módulos de operaciones (#458) y las tareas que apremian (#459).
 *
 * Sobre las cifras: se muestran cuatro, no ocho. Un tablero con ocho números
 * iguales no dice cuál mirar primero; el de tareas vencidas se destaca porque
 * es el único que exige actuar hoy.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { resumenAdministrativo, tareasUrgentes } from "@/server/operaciones/queries";
import type { TareaTablero } from "@/server/operaciones/types";
import { bandaDePrioridad, paletaDe } from "@/lib/estados";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ChipEstado } from "@/components/ui/chip-estado";
import { AvatarGroup } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { DockAccesos } from "./dock-accesos";

const VACIO = {
  proyectos_activos: 0,
  tareas_abiertas: 0,
  tareas_vencidas: 0,
  estudiantes_activos: 0,
};

async function cargar() {
  try {
    const [resumen, urgentes] = await Promise.all([
      resumenAdministrativo(),
      tareasUrgentes(6),
    ]);
    return { resumen, urgentes };
  } catch {
    return { resumen: VACIO, urgentes: [] as TareaTablero[] };
  }
}

export default async function AdministrativoPage({
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
  const { resumen, urgentes } = await cargar();

  const cifras = [
    { clave: "openTasks", valor: resumen.tareas_abiertas, alerta: false },
    { clave: "overdueTasks", valor: resumen.tareas_vencidas, alerta: resumen.tareas_vencidas > 0 },
    { clave: "activeProjects", valor: resumen.proyectos_activos, alerta: false },
    { clave: "activeStudents", valor: resumen.estudiantes_activos, alerta: false },
  ] as const;

  /**
   * Los ocho accesos del portal (#458), en orden de uso diario.
   *
   * El icono viaja por nombre y no como componente: `DockAccesos` es un
   * componente cliente y React no serializa componentes a través de esa
   * frontera (ver `components/ui/icono.tsx`).
   */
  const accesos = [
    { href: "/administrativo/tareas", clave: "tasks", icono: "ListChecks" },
    { href: "/administrativo/proyectos", clave: "projects", icono: "FolderKanban" },
    { href: "/calendario", clave: "calendar", icono: "CalendarDays" },
    { href: "/administrativo/personal", clave: "staff", icono: "UserCog" },
    { href: "/inscripcion-comida", clave: "meals", icono: "Utensils" },
    { href: "/expedientes", clave: "records", icono: "Users" },
    { href: "/servicios-mensuales", clave: "services", icono: "ClipboardList" },
    { href: "/reportes", clave: "reports", icono: "BarChart3" },
  ] as const;

  const fechaCorta = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" });
  const hoy = new Date();
  const claveHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("hub.title")}
          description={t("hub.description")}
        />
      </div>

      {/* Cifras del día */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cifras.map((c, i) => (
          <Card
            key={c.clave}
            className={cn(
              "animate-fade-up border-l-[3px] p-5",
              c.alerta ? "border-l-destructive" : "border-l-border",
            )}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {t(`hub.${c.clave}` as never)}
            </p>
            <p
              className={cn(
                "mt-2 font-mono text-3xl font-semibold tabular-nums",
                c.alerta ? "text-destructive" : "text-foreground",
              )}
            >
              {c.valor}
            </p>
          </Card>
        ))}
      </div>

      {/* Accesos (riel vertical) + tareas que apremian, uno al lado del otro:
          el riel es para ir a otro sitio, la lista para actuar aquí. */}
      <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)]">
        <section
          className="animate-fade-up space-y-3"
          style={{ animationDelay: "180ms" }}
        >
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("hub.shortcuts")}
          </h2>
          <DockAccesos
            accesos={accesos.map((a) => ({
              href: a.href,
              icono: a.icono,
              label: t(`hub.link_${a.clave}` as never),
            }))}
            // En pantallas estrechas el riel se tumba: una columna de ocho
            // iconos empujaría el contenido fuera de la primera pantalla.
            className="max-lg:w-full max-lg:flex-row max-lg:flex-wrap max-lg:justify-start"
          />
        </section>

        {/* Tareas que apremian */}
        <section className="space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("hub.urgent")}
          </h2>

          {urgentes.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title={t("hub.urgentEmpty")}
              description={puedeEscribir ? t("hub.urgentEmptyHint") : undefined}
            />
          ) : (
            <div className="space-y-2">
              {urgentes.map((tarea, i) => {
              const banda = bandaDePrioridad(tarea.prioridad);
              const vencida = tarea.fecha_limite !== null && tarea.fecha_limite < claveHoy;
              return (
                <Link
                  key={tarea.id}
                  href={`/${locale}/administrativo/tareas`}
                  className={cn(
                    "flex items-center gap-3 rounded-md border border-border bg-surface p-3",
                    "border-l-[3px]",
                    paletaDe(banda).riel,
                    "transition-colors duration-150 ease-out hover:bg-accent",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "animate-fade-up",
                  )}
                  style={{ animationDelay: `${300 + i * 30}ms` }}
                >
                  <ChipEstado estado={banda} punto className="shrink-0">
                    {t(`priority.${tarea.prioridad}` as never)}
                  </ChipEstado>

                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {tarea.titulo}
                  </span>

                  {tarea.proyecto_nombre && (
                    <span className="hidden shrink-0 truncate text-[13px] text-muted-foreground sm:block">
                      {tarea.proyecto_nombre}
                    </span>
                  )}

                  {tarea.fecha_limite && (
                    <span
                      className={cn(
                        "shrink-0 font-mono text-xs tabular-nums",
                        vencida ? "font-semibold text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {vencida
                        ? t("board.overdue")
                        : fechaCorta.format(
                            new Date(
                              Number(tarea.fecha_limite.slice(0, 4)),
                              Number(tarea.fecha_limite.slice(5, 7)) - 1,
                              Number(tarea.fecha_limite.slice(8, 10)),
                            ),
                          )}
                    </span>
                  )}

                  {tarea.asignados.length > 0 && (
                    <AvatarGroup
                      personas={tarea.asignados.map((a) => ({ nombre: a.nombre }))}
                      maximo={2}
                      className="hidden shrink-0 md:flex"
                    />
                  )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
