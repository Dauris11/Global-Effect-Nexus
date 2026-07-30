/**
 * Portal Profesor — ClickUp S6 · #400 (#401–#403).
 *
 * El docente entra al sistema para hacer tres cosas: ver cuántos tiene
 * inscritos, saber qué le falta por calificar y llegar rápido a la pantalla de
 * notas. Esta pantalla es exactamente eso y nada más — no es un panel de
 * gestión recortado, es el atajo a su trabajo del día.
 *
 * **"Mío" lo decide una clave foránea, no un nombre.** `curso.docente_usuario_id`
 * y `materia.profesor_usuario_id` (migración 0019). Comparar `curso.docente`
 * con el nombre del usuario parecía suficiente y no lo es: dos docentes
 * homónimos verían los cursos del otro, y "Juan A. Pérez" no vería los suyos.
 * En un portal que enseña notas de estudiantes, eso no es un fallo cosmético.
 *
 * **Los cursos cerrados también aparecen.** Ordenados detrás de los activos:
 * un docente vuelve al curso que acaba de terminar para repasar notas, y
 * esconderlo lo obligaría a salir del portal a buscarlo al catálogo.
 *
 * **Cada acceso rápido se comprueba contra el permiso real.** El rol docente
 * los tiene todos, pero el portal también lo abre `super_admin` y quien lo
 * herede mañana puede no tenerlos; un atajo que lleva a "no autorizado" es
 * peor que no estar.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BookOpen, CalendarDays, ClipboardList, GraduationCap } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { bandaDeNota, paletaDe, type EstadoDominio } from "@/lib/estados";
import { cn } from "@/lib/utils";
import {
  cursosDelDocente,
  materiasDelDocente,
  resumenDelDocente,
} from "@/server/portales/queries";
import type {
  CursoDelDocente,
  MateriaDelDocente,
  ResumenDelDocente,
} from "@/server/portales/types";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChipEstado } from "@/components/ui/chip-estado";
import { BarraProgreso } from "@/components/ui/barra-progreso";
import { EmptyState } from "@/components/ui/empty-state";

const RESUMEN_VACIO: ResumenDelDocente = {
  cursos_activos: 0,
  inscritos: 0,
  notas: 0,
  materias: 0,
};

/** Estado del curso → color del sistema (mismo criterio que /academico/cursos). */
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

/** Color de la barra de cupo. Pasarse de capacidad es lo único crítico. */
function bandaDeCupo(inscritos: number, capacidad: number): EstadoDominio {
  if (capacidad <= 0) return "neutral";
  if (inscritos > capacidad) return "prioridad-urgente";
  if (inscritos === capacidad) return "tarea-completada";
  return "tarea-progreso";
}

async function cargar(usuarioId: string) {
  const [resumen, cursos, materias] = await Promise.all([
    resumenDelDocente(usuarioId).catch(() => RESUMEN_VACIO),
    cursosDelDocente(usuarioId).catch(() => [] as CursoDelDocente[]),
    materiasDelDocente(usuarioId).catch(() => [] as MateriaDelDocente[]),
  ]);
  return { resumen, cursos, materias };
}

export default async function PortalProfesorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const [t, verAcademico, registrarNotas, verOperaciones] = await Promise.all([
    getTranslations("teacherPortal"),
    can(user.rol, "academico.leer"),
    can(user.rol, "calificaciones.registrar"),
    can(user.rol, "operaciones.leer"),
  ]);

  const { resumen, cursos, materias } = await cargar(user.id);

  const cifras = [
    {
      clave: "courses",
      valor: resumen.cursos_activos,
      icono: "BookOpen",
      acento: "teal" as const,
    },
    {
      clave: "students",
      valor: resumen.inscritos,
      icono: "Users",
      acento: "coral" as const,
    },
    {
      clave: "grades",
      valor: resumen.notas,
      icono: "ClipboardList",
      acento: "teal" as const,
    },
    {
      clave: "subjects",
      valor: resumen.materias,
      icono: "GraduationCap",
      acento: "gold" as const,
    },
  ];

  const accesos = [
    verAcademico && {
      clave: "courses",
      href: `/${locale}/academico/cursos`,
      icono: BookOpen,
    },
    verAcademico && {
      clave: "subjects",
      href: `/${locale}/academico/materias`,
      icono: GraduationCap,
    },
    registrarNotas && {
      clave: "grades",
      href: `/${locale}/academico/calificaciones`,
      icono: ClipboardList,
    },
    verOperaciones && {
      clave: "calendar",
      href: `/${locale}/calendario`,
      icono: CalendarDays,
    },
  ].filter(Boolean) as { clave: string; href: string; icono: typeof BookOpen }[];

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("greeting", { name: user.nombre.split(" ")[0] })}
          description={t("summary")}
        />
      </div>

      {/* Banner — #401 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cifras.map((c, i) => (
          <div
            key={c.clave}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <StatCard
              label={t(`stats.${c.clave}` as never)}
              value={c.valor}
              icon={c.icono}
              accent={c.acento}
              locale={locale}
            />
          </div>
        ))}
      </div>

      {/* Accesos rápidos — #403 */}
      {accesos.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("shortcutsTitle")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {accesos.map((a, i) => {
              const Icono = a.icono;
              return (
                <Link
                  key={a.clave}
                  href={a.href}
                  className="animate-fade-up rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{ animationDelay: `${160 + i * 40}ms` }}
                >
                  <Card className="h-full p-5 transition-colors hover:bg-accent/40">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icono className="size-4" aria-hidden />
                    </span>
                    <p className="mt-3 text-sm font-medium text-foreground">
                      {t(`shortcuts.${a.clave}.label` as never)}
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      {t(`shortcuts.${a.clave}.hint` as never)}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Cursos — #402 */}
      <section className="space-y-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          {t("coursesTitle")}
        </h2>

        {cursos.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t("coursesEmpty")}
            description={t("coursesEmptyHint")}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cursos.map((c, i) => {
              const banda = bandaDeCurso(c.estado);
              const porcentaje =
                c.capacidad > 0
                  ? Math.min(100, Math.round((c.inscritos / c.capacidad) * 100))
                  : 0;

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

                  <div className="mt-4 space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        {t("occupancy")}
                      </span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {c.inscritos} / {c.capacidad}
                      </span>
                    </div>
                    <BarraProgreso
                      valor={porcentaje}
                      estado={bandaDeCupo(c.inscritos, c.capacidad)}
                      etiqueta={`${t("occupancy")}: ${c.nombre}`}
                    />
                  </div>

                  <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
                    <div>
                      <dt className="sr-only">{t("mode")}</dt>
                      <dd>{t(`courseMode.${c.modalidad}` as never)}</dd>
                    </div>
                    {c.periodo_nombre && (
                      <div>
                        <dt className="sr-only">{t("term")}</dt>
                        <dd className="font-mono">{c.periodo_nombre}</dd>
                      </div>
                    )}
                    {c.horario && (
                      <div>
                        <dt className="sr-only">{t("schedule")}</dt>
                        <dd>{c.horario}</dd>
                      </div>
                    )}
                  </dl>

                  {/* Lo que le falta por calificar, que es la razón por la que
                      el docente mira esta tarjeta. Sin notas no se inventa un
                      promedio: se dice que no hay ninguna. */}
                  <div className="mt-4 flex items-baseline justify-between gap-2 border-t border-border pt-3">
                    <span className="text-[13px] text-muted-foreground">
                      {t("gradesCount", { count: c.notas })}
                    </span>
                    {c.promedio != null ? (
                      <span
                        className={cn(
                          "font-mono text-sm font-semibold tabular-nums",
                          paletaDe(bandaDeNota(c.promedio)).texto,
                        )}
                      >
                        {t("averageShort", { value: c.promedio.toFixed(1) })}
                      </span>
                    ) : (
                      <span className="text-[13px] text-muted-foreground">
                        {t("noGradesYet")}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Materias del catálogo a su nombre. Van después de los cursos y en
          formato de lista: un profesor de materia consulta horario y aula, no
          cupo, así que no necesitan la barra de ocupación de arriba. */}
      {materias.length > 0 && (
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle>{t("subjectsTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {materias.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{m.nombre}</p>
                  <p className="flex flex-wrap items-center gap-x-3 text-[13px] text-muted-foreground">
                    {m.codigo && <span className="font-mono">{m.codigo}</span>}
                    {m.periodo_nombre && <span className="font-mono">{m.periodo_nombre}</span>}
                    {m.horario && <span>{m.horario}</span>}
                    {m.aula && <span>{m.aula}</span>}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {t("enrolledCount", { count: m.inscritos })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
