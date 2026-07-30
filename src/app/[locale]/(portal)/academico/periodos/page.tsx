/**
 * Períodos académicos — ClickUp S6 · #221.
 *
 * Los cuatrimestres institucionales, con lo que cuelga de cada uno (materias,
 * cursos, inscripciones). Tarjetas y no tabla porque un período no se compara
 * con otro en columna: se consulta uno.
 *
 * **Dos estados que no son el mismo, y por eso se muestran los dos:** el `estado`
 * que alguien escribió (`planificado` · `activo` · `completado`) y `en_curso`,
 * que calcula la base de datos comparando las fechas con `CURRENT_DATE`. Cuando
 * discrepan —un período marcado "activo" cuya fecha de fin ya pasó— la pantalla
 * lo dice, porque es justo el descuido que hace que las notas se registren en el
 * cuatrimestre equivocado.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, CalendarRange, Lock } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { periodosConConteos } from "@/server/academico/queries";
import type { PeriodoConConteos } from "@/server/academico/types";
import type { EstadoDominio } from "@/lib/estados";
import { paletaDe } from "@/lib/estados";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChipEstado } from "@/components/ui/chip-estado";
import { EmptyState } from "@/components/ui/empty-state";
import { BotonNuevoPeriodo, type TextosNuevoPeriodo } from "./dialogo-nuevo-periodo";

/** Estado declarado del período → color del sistema. */
function bandaDePeriodo(estado: string): EstadoDominio {
  switch (estado) {
    case "activo":
      return "tarea-progreso";
    case "completado":
      return "tarea-completada";
    default:
      return "tarea-pendiente";
  }
}

async function cargar() {
  try {
    return { periodos: await periodosConConteos(), error: false };
  } catch {
    return { periodos: [] as PeriodoConConteos[], error: true };
  }
}

export default async function PeriodosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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
        <PageHeader eyebrow={t("eyebrow")} title={t("terms.title")} />
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

  const { periodos, error } = await cargar();

  const fecha = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formatear = (f: string) => {
    const [a, m, d] = f.split("-").map(Number);
    return fecha.format(new Date(a, m - 1, d));
  };

  const textosDialogo: TextosNuevoPeriodo = {
    titulo: t("newTerm.title"),
    subtitulo: t("newTerm.subtitle"),
    nombre: t("term.name"),
    nombreAyuda: t("newTerm.nameHint"),
    inicio: t("term.start"),
    fin: t("term.end"),
    estado: t("term.status"),
    crear: t("newTerm.create"),
    creando: t("newTerm.creating"),
    cancelar: t("cancel"),
    cerrar: t("close"),
    errorNombre: t("newTerm.nameRequired"),
    errorFechas: t("newTerm.datesRequired"),
    errorFin: t("newTerm.endBeforeStart"),
    errorDuplicado: t("newTerm.duplicate"),
    errorGeneral: t("newTerm.error"),
    estados: {
      planificado: t("termStatus.planificado"),
      activo: t("termStatus.activo"),
      completado: t("termStatus.completado"),
    },
  };

  const boton = puedeEscribir && (
    <BotonNuevoPeriodo etiqueta={t("terms.new")} textos={textosDialogo} />
  );

  const cifras = [
    { clave: "total", valor: periodos.length },
    { clave: "active", valor: periodos.filter((p) => p.estado === "activo").length },
    { clave: "planned", valor: periodos.filter((p) => p.estado === "planificado").length },
    { clave: "done", valor: periodos.filter((p) => p.estado === "completado").length },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("terms.title")}
          description={t("terms.description")}
          actions={boton}
        />
      </div>

      {periodos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cifras.map((c, i) => (
            <Card
              key={c.clave}
              className="animate-fade-up p-5"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {t(`terms.stats.${c.clave}` as never)}
              </p>
              <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">{c.valor}</p>
            </Card>
          ))}
        </div>
      )}

      {error ? (
        <EmptyState
          icon={CalendarRange}
          title={t("loadError")}
          description={t("loadErrorHint")}
        />
      ) : periodos.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title={t("terms.empty")}
          description={t("terms.emptyHint")}
          action={boton}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {periodos.map((p, i) => {
            const banda = bandaDePeriodo(p.estado);
            // El desajuste que importa: dice "activo" pero las fechas ya pasaron
            // (o al revés, hoy cae dentro y sigue marcado como planificado).
            const desajuste =
              (p.estado === "activo" && !p.en_curso) ||
              (p.estado === "planificado" && p.en_curso);

            return (
              <Card
                key={p.id}
                className={cn("animate-fade-up border-l-[3px] p-5", paletaDe(banda).riel)}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-mono text-xl font-semibold tabular-nums">
                    {p.nombre}
                  </h2>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <ChipEstado estado={banda} punto>
                      {t(`termStatus.${p.estado}` as never)}
                    </ChipEstado>
                    {p.en_curso && (
                      <ChipEstado estado="nota-excelente">{t("terms.inProgress")}</ChipEstado>
                    )}
                  </div>
                </div>

                <p className="mt-2 font-mono text-[13px] tabular-nums text-muted-foreground">
                  {formatear(p.fecha_inicio)} → {formatear(p.fecha_fin)}
                </p>

                {desajuste && (
                  <p className="mt-3 text-[13px] font-medium text-prioridad-alta">
                    {p.estado === "activo"
                      ? t("terms.mismatchEnded")
                      : t("terms.mismatchStarted")}
                  </p>
                )}

                <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
                  {(
                    [
                      { clave: "subjects", valor: p.materias },
                      { clave: "courses", valor: p.cursos },
                      { clave: "enrollments", valor: p.inscripciones },
                    ] as const
                  ).map((d) => (
                    <div key={d.clave}>
                      <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        {t(`terms.counts.${d.clave}` as never)}
                      </dt>
                      <dd className="mt-1 font-mono text-lg font-semibold tabular-nums">
                        {d.valor}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
