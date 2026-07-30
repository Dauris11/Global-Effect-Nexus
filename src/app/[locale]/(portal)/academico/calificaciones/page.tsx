/**
 * Calificaciones — ClickUp S6 · #220 (tabla con código de color por nota).
 *
 * ── Quién puede ver esto, y por qué no es `academico.leer` ──────────────────
 *
 * Esta pantalla muestra las notas de **todos** los estudiantes, así que el
 * permiso obvio sería el del módulo académico. No lo es: el rol `estudiante`
 * tiene `academico.leer` —lo necesita para consultar el catálogo de materias— y
 * gatear aquí con ese permiso le dejaría ver las notas de sus compañeros.
 *
 * Se exige entonces **`calificaciones.registrar` o `expedientes.leer`**:
 *   • `docente` registra notas pero no lleva expedientes → entra por el primero.
 *   • quien lleva expedientes (admin, psicólogo) no registra notas → por el segundo.
 *   • `estudiante` no tiene ninguno → no entra. Sus propias notas las verá en su
 *     portal (S6), que es donde corresponde.
 *
 * Y el botón de registrar exige `calificaciones.registrar` por separado, que en
 * el seed tienen solo `docente` y `super_admin` — **`admin` no**. Es deliberado:
 * quien califica es quien da clase.
 *
 * ── Las bandas de color ────────────────────────────────────────────────────
 *
 * Son la razón de ser de la pantalla: ≥90 · 70–89 · 60–69 · <60, definidas una
 * sola vez en `bandaDeNota()`. Aquí aparecen en tres sitios que se refuerzan —
 * la distribución de arriba, el riel de cada fila y la nota en mono— y siempre
 * acompañadas de texto, porque el color no puede ser el único portador del
 * significado (estándar §3.2).
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ClipboardList, Lock } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  cursosParaSelector,
  listarCalificaciones,
  listarPeriodos,
  resumenCalificaciones,
} from "@/server/academico/queries";
import { estudiantesParaSelector } from "@/server/estudiantes/queries";
import type { Calificacion } from "@/server/academico/types";
import type { EstadoDominio } from "@/lib/estados";
import { bandaDeNota, paletaDe } from "@/lib/estados";
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
import { Buscador } from "../buscador";
import { BotonNuevaNota, type TextosNuevaNota } from "./dialogo-nueva-nota";

const RESUMEN_VACIO = {
  total: 0,
  promedio: null as number | null,
  excelentes: 0,
  buenas: 0,
  riesgo: 0,
  criticas: 0,
  aprobadas: 0,
};

type Selector = { id: string; nombre: string }[];

async function cargar(buscar: string | undefined, puedeRegistrar: boolean) {
  try {
    const [notas, resumen, periodos, cursos, estudiantes] = await Promise.all([
      listarCalificaciones(buscar),
      resumenCalificaciones(),
      listarPeriodos(),
      // Los catálogos del formulario solo se traen si hay formulario que llenar.
      puedeRegistrar ? cursosParaSelector() : Promise.resolve([] as Selector),
      puedeRegistrar ? estudiantesParaSelector() : Promise.resolve([] as Selector),
    ]);
    return { notas, resumen, periodos, cursos, estudiantes, error: false };
  } catch {
    return {
      notas: [] as Calificacion[],
      resumen: RESUMEN_VACIO,
      periodos: [] as Selector,
      cursos: [] as Selector,
      estudiantes: [] as Selector,
      error: true,
    };
  }
}

export default async function CalificacionesPage({
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

  const [puedeRegistrar, lleveExpedientes, t] = await Promise.all([
    can(user.rol, "calificaciones.registrar"),
    can(user.rol, "expedientes.leer"),
    getTranslations("academic"),
  ]);
  const puedeLeer = puedeRegistrar || lleveExpedientes;

  if (!puedeLeer) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow={t("eyebrow")} title={t("grades.title")} />
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

  const q = (qBruto ?? "").trim();
  const { notas, resumen, periodos, cursos, estudiantes, error } = await cargar(
    q || undefined,
    puedeRegistrar,
  );

  const numero = new Intl.NumberFormat(locale, { minimumFractionDigits: 1 });
  const bandas = {
    excelente: t("gradeBand.excelente"),
    buena: t("gradeBand.buena"),
    riesgo: t("gradeBand.riesgo"),
    critica: t("gradeBand.critica"),
  };

  const textosDialogo: TextosNuevaNota = {
    titulo: t("newGrade.title"),
    subtitulo: t("newGrade.subtitle"),
    estudiante: t("grade.student"),
    curso: t("grade.course"),
    periodo: t("grade.term"),
    elegir: t("choose"),
    nota: t("grade.score"),
    notaAyuda: t("newGrade.scoreHint"),
    tipo: t("grade.type"),
    observaciones: t("grade.notes"),
    crear: t("newGrade.create"),
    creando: t("newGrade.creating"),
    cancelar: t("cancel"),
    cerrar: t("close"),
    errorCampos: t("newGrade.fieldsRequired"),
    errorNota: t("newGrade.scoreInvalid"),
    errorGeneral: t("newGrade.error"),
    sinCursos: t("newGrade.noCourses"),
    sinEstudiantes: t("newGrade.noStudents"),
    tipos: {
      examen: t("gradeType.examen"),
      tarea: t("gradeType.tarea"),
      proyecto: t("gradeType.proyecto"),
      participacion: t("gradeType.participacion"),
      final: t("gradeType.final"),
    },
    bandas,
  };

  const botonNueva = puedeRegistrar && (
    <BotonNuevaNota
      etiqueta={t("grades.new")}
      textos={textosDialogo}
      estudiantes={estudiantes}
      cursos={cursos}
      periodos={periodos}
    />
  );

  /** La distribución: cada banda con su color, su nombre y su conteo. */
  const distribucion = [
    { banda: "nota-excelente" as EstadoDominio, nombre: bandas.excelente, valor: resumen.excelentes, rango: "≥ 90" },
    { banda: "nota-buena" as EstadoDominio, nombre: bandas.buena, valor: resumen.buenas, rango: "70–89" },
    { banda: "nota-riesgo" as EstadoDominio, nombre: bandas.riesgo, valor: resumen.riesgo, rango: "60–69" },
    { banda: "nota-critica" as EstadoDominio, nombre: bandas.critica, valor: resumen.criticas, rango: "< 60" },
  ];

  const bandaPromedio = bandaDeNota(resumen.promedio);
  const tasa =
    resumen.total > 0 ? Math.round((resumen.aprobadas / resumen.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("grades.title")}
          description={t("grades.description")}
          actions={botonNueva}
        />
      </div>

      {/* Cabecera: total, promedio con su banda y tasa de aprobación */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="animate-fade-up p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("grades.stats.total")}
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">
            {resumen.total}
          </p>
        </Card>

        <Card
          className={cn(
            "animate-fade-up border-l-[3px] p-5",
            resumen.promedio != null ? paletaDe(bandaPromedio).riel : "border-l-border",
          )}
          style={{ animationDelay: "40ms" }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("grades.stats.average")}
          </p>
          {resumen.promedio != null ? (
            <p
              className={cn(
                "mt-2 font-mono text-3xl font-semibold tabular-nums",
                paletaDe(bandaPromedio).texto,
              )}
            >
              {numero.format(resumen.promedio)}
            </p>
          ) : (
            <p className="mt-3 text-[13px] text-muted-foreground">{t("grades.noAverage")}</p>
          )}
        </Card>

        <Card className="animate-fade-up p-5" style={{ animationDelay: "80ms" }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("grades.stats.passRate")}
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">{tasa}%</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {t("grades.passRateHint", { passed: resumen.aprobadas, total: resumen.total })}
          </p>
        </Card>
      </div>

      {/* Distribución por banda — el corazón de la pantalla */}
      {resumen.total > 0 && (
        <section className="space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("grades.distribution")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {distribucion.map((d, i) => (
              <Card
                key={d.banda}
                className={cn("animate-fade-up border-l-[3px] p-4", paletaDe(d.banda).riel)}
                style={{ animationDelay: `${120 + i * 30}ms` }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">{d.nombre}</p>
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {d.rango}
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-2 font-mono text-2xl font-semibold tabular-nums",
                    paletaDe(d.banda).texto,
                  )}
                >
                  {d.valor}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Buscador
        valor={q}
        rutaLimpiar={`/${locale}/academico/calificaciones`}
        textos={{
          etiqueta: t("search"),
          placeholder: t("grades.searchPlaceholder"),
          aplicar: t("apply"),
          limpiar: t("clear"),
        }}
      />

      {error ? (
        <EmptyState
          icon={ClipboardList}
          title={t("loadError")}
          description={t("loadErrorHint")}
        />
      ) : notas.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={q ? t("noMatches") : t("grades.empty")}
          description={q ? t("noMatchesHint") : t("grades.emptyHint")}
          action={
            q ? (
              <Button variant="outline" asChild>
                <Link href={`/${locale}/academico/calificaciones`}>{t("clear")}</Link>
              </Button>
            ) : (
              botonNueva
            )
          }
        />
      ) : (
        <section className="space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("grades.count", { count: notas.length })}
          </h2>

          <Card className="animate-fade-up overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">{t("grade.student")}</TableHead>
                    <TableHead scope="col">{t("grade.course")}</TableHead>
                    <TableHead scope="col">{t("grade.term")}</TableHead>
                    <TableHead scope="col">{t("grade.type")}</TableHead>
                    <TableHead scope="col" className="text-right">
                      {t("grade.score")}
                    </TableHead>
                    <TableHead scope="col">{t("grade.band")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notas.map((n) => {
                    const banda = bandaDeNota(n.nota);
                    const nombreBanda =
                      banda === "nota-excelente"
                        ? bandas.excelente
                        : banda === "nota-buena"
                          ? bandas.buena
                          : banda === "nota-riesgo"
                            ? bandas.riesgo
                            : bandas.critica;
                    return (
                      // Riel por banda: recorriendo la tabla se ve dónde están
                      // las notas que piden atención sin leer una sola cifra.
                      <TableRow
                        key={n.id}
                        className={cn("border-l-[3px]", paletaDe(banda).riel)}
                      >
                        <TableCell className="font-medium">
                          {n.estudiante_nombre}
                        </TableCell>
                        <TableCell className="text-[13px]">{n.curso_nombre}</TableCell>
                        <TableCell className="font-mono text-[13px] tabular-nums">
                          {n.periodo_nombre ?? "—"}
                        </TableCell>
                        <TableCell className="text-[13px]">
                          {t(`gradeType.${n.tipo_evaluacion}` as never)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-mono text-sm font-semibold tabular-nums",
                            paletaDe(banda).texto,
                          )}
                        >
                          {numero.format(n.nota)}
                        </TableCell>
                        <TableCell>
                          <ChipEstado estado={banda}>{nombreBanda}</ChipEstado>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {notas.length === 500 && (
            <p className="text-[13px] text-muted-foreground">{t("grades.limitHint")}</p>
          )}
        </section>
      )}
    </div>
  );
}
