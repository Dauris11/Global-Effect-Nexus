/**
 * Historial académico — ClickUp S6 · #221.
 *
 * Una fila por **estudiante**, no por materia. La tabla `historial_calificacion`
 * guarda una fila por materia cursada; listarlas todas daría cientos de filas
 * donde la pregunta real es "¿cómo va cada joven?". El detalle materia por
 * materia, con su gráfica de evolución, ya está en el expediente — así que aquí
 * cada nombre enlaza allí en vez de repetirlo.
 *
 * **Mismo acceso que Calificaciones, y por la misma razón:** son las notas de
 * todos, y el rol `estudiante` tiene `academico.leer` para el catálogo. Se exige
 * `calificaciones.registrar` o `expedientes.leer`.
 *
 * El GPA usa `bandaDeGpa()`, que reescala 0–4 a 0–100 y delega en las bandas del
 * estándar: así un GPA de 3.9 y una nota de 97 se pintan del mismo verde.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, History, Lock } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  cuatrimestresDelHistorial,
  historialPorEstudiante,
  resumenHistorial,
} from "@/server/academico/queries";
import type { HistorialEstudiante } from "@/server/academico/types";
import { bandaDeGpa, bandaDeNota, paletaDe } from "@/lib/estados";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChipEstado } from "@/components/ui/chip-estado";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FiltroHistorial } from "./filtros";

const RESUMEN_VACIO = {
  registros: 0,
  estudiantes: 0,
  gpa: null as number | null,
  aprobadas: 0,
  reprobadas: 0,
};

async function cargar(filtro: { buscar?: string; cuatrimestre?: string }) {
  try {
    const [filas, resumen, cuatrimestres] = await Promise.all([
      historialPorEstudiante(filtro),
      resumenHistorial(),
      cuatrimestresDelHistorial(),
    ]);
    return { filas, resumen, cuatrimestres, error: false };
  } catch {
    return {
      filas: [] as HistorialEstudiante[],
      resumen: RESUMEN_VACIO,
      cuatrimestres: [] as string[],
      error: true,
    };
  }
}

export default async function HistorialPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; cuatrimestre?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const [puedeRegistrar, lleveExpedientes, t] = await Promise.all([
    can(user.rol, "calificaciones.registrar"),
    can(user.rol, "expedientes.leer"),
    getTranslations("academic"),
  ]);

  if (!puedeRegistrar && !lleveExpedientes) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow={t("eyebrow")} title={t("history.title")} />
        <EmptyState
          icon={Lock}
          title={t("grades.forbidden")}
          description={t("grades.forbiddenHint")}
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

  const q = (sp.q ?? "").trim();
  const { filas, resumen, cuatrimestres, error } = await cargar({
    buscar: q || undefined,
    cuatrimestre: sp.cuatrimestre || undefined,
  });

  // Solo se acepta un cuatrimestre que exista de verdad en el historial.
  const cuatrimestre = cuatrimestres.includes(sp.cuatrimestre ?? "")
    ? sp.cuatrimestre!
    : "";
  const hayFiltro = Boolean(q || cuatrimestre);

  const gpaFmt = new Intl.NumberFormat(locale, { minimumFractionDigits: 2 });
  const notaFmt = new Intl.NumberFormat(locale, { minimumFractionDigits: 1 });
  const bandaGpaGlobal = bandaDeGpa(resumen.gpa);

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("history.title")}
          description={t("history.description")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-up p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("history.stats.students")}
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">
            {resumen.estudiantes}
          </p>
        </Card>

        <Card className="animate-fade-up p-5" style={{ animationDelay: "40ms" }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("history.stats.records")}
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">
            {resumen.registros}
          </p>
        </Card>

        <Card
          className={cn(
            "animate-fade-up border-l-[3px] p-5",
            resumen.gpa != null ? paletaDe(bandaGpaGlobal).riel : "border-l-border",
          )}
          style={{ animationDelay: "80ms" }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("history.stats.gpa")}
          </p>
          {resumen.gpa != null ? (
            <>
              <p
                className={cn(
                  "mt-2 font-mono text-3xl font-semibold tabular-nums",
                  paletaDe(bandaGpaGlobal).texto,
                )}
              >
                {gpaFmt.format(resumen.gpa)}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {t("history.gpaScale")}
              </p>
            </>
          ) : (
            <p className="mt-3 text-[13px] text-muted-foreground">{t("history.noGpa")}</p>
          )}
        </Card>

        <Card className="animate-fade-up p-5" style={{ animationDelay: "120ms" }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("history.stats.failed")}
          </p>
          <p
            className={cn(
              "mt-2 font-mono text-3xl font-semibold tabular-nums",
              resumen.reprobadas > 0 ? "text-nota-critica" : "text-foreground",
            )}
          >
            {resumen.reprobadas}
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {t("history.passedHint", { passed: resumen.aprobadas })}
          </p>
        </Card>
      </div>

      <FiltroHistorial
        valores={{ q, cuatrimestre }}
        cuatrimestres={cuatrimestres}
        rutaLimpiar={`/${locale}/academico/historial`}
        textos={{
          buscar: t("search"),
          buscarPlaceholder: t("history.searchPlaceholder"),
          cuatrimestre: t("history.term"),
          todos: t("allTerms"),
          aplicar: t("apply"),
          limpiar: t("clear"),
        }}
      />

      {error ? (
        <EmptyState icon={History} title={t("loadError")} description={t("loadErrorHint")} />
      ) : filas.length === 0 ? (
        <EmptyState
          icon={History}
          title={hayFiltro ? t("noMatches") : t("history.empty")}
          description={hayFiltro ? t("noMatchesHint") : t("history.emptyHint")}
          action={
            hayFiltro && (
              <Button variant="outline" asChild>
                <Link href={`/${locale}/academico/historial`}>{t("clear")}</Link>
              </Button>
            )
          }
        />
      ) : (
        <section className="space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("history.count", { count: filas.length })}
          </h2>

          <Card className="animate-fade-up overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">{t("grade.student")}</TableHead>
                    <TableHead scope="col" className="text-right">
                      {t("history.gpaShort")}
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      {t("history.average")}
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      {t("history.subjects")}
                    </TableHead>
                    <TableHead scope="col">{t("history.result")}</TableHead>
                    <TableHead scope="col">{t("history.lastTerm")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filas.map((f) => {
                    const banda = bandaDeGpa(f.gpa);
                    const bandaProm = bandaDeNota(f.promedio);
                    return (
                      // Riel por GPA acumulado: recorriendo la lista se ve a
                      // quién se le está cayendo el rendimiento.
                      <TableRow
                        key={f.estudiante_id}
                        className={cn(
                          f.gpa != null && "border-l-[3px]",
                          f.gpa != null && paletaDe(banda).riel,
                        )}
                      >
                        <TableCell>
                          <Link
                            href={`/${locale}/expedientes/${f.estudiante_id}`}
                            className="rounded-sm font-medium hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {f.estudiante_nombre}
                          </Link>
                        </TableCell>

                        <TableCell
                          className={cn(
                            "text-right font-mono text-sm font-semibold tabular-nums",
                            f.gpa != null && paletaDe(banda).texto,
                          )}
                        >
                          {f.gpa != null ? gpaFmt.format(f.gpa) : "—"}
                        </TableCell>

                        <TableCell
                          className={cn(
                            "text-right font-mono text-sm tabular-nums",
                            f.promedio != null && paletaDe(bandaProm).texto,
                          )}
                        >
                          {f.promedio != null ? notaFmt.format(f.promedio) : "—"}
                        </TableCell>

                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {f.materias}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {f.aprobadas > 0 && (
                              <ChipEstado estado="nota-excelente">
                                {t("history.passedCount", { count: f.aprobadas })}
                              </ChipEstado>
                            )}
                            {f.reprobadas > 0 && (
                              <ChipEstado estado="nota-critica">
                                {t("history.failedCount", { count: f.reprobadas })}
                              </ChipEstado>
                            )}
                            {/* Prueba académica: el estado que pide acción de
                                verdad, así que se muestra aunque haya uno solo. */}
                            {f.en_prueba > 0 && (
                              <ChipEstado estado="nota-riesgo" punto>
                                {t("history.onProbation", { count: f.en_prueba })}
                              </ChipEstado>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="font-mono text-[13px] tabular-nums text-muted-foreground">
                          {f.ultimo_cuatrimestre}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {filas.length === 300 && (
            <p className="text-[13px] text-muted-foreground">{t("history.limitHint")}</p>
          )}
        </section>
      )}
    </div>
  );
}
