/**
 * Prematrícula — ClickUp S6 · #221.
 *
 * Inscripciones de estudiantes en materias por período. El filtro de período y
 * la búsqueda viven en la URL (`?periodo=`, `?q=`), así que "la prematrícula de
 * 2026-I" es un enlace que se puede pegar en un correo.
 *
 * **Nota sobre el estado:** `docs/03-modulos-funcionales.md` describe las cifras
 * de esta pantalla como "pendientes (nota=0)" y "activos (nota>0)". Eso no
 * corresponde al esquema real: `inscripcion.estado` es un enum propio
 * (`activa` · `retirada` · `aprobada` · `reprobada`) y **no se deriva de la nota**.
 * Se usan los estados reales, porque una inscripción retirada no es "una nota en
 * cero": es una materia que el joven dejó de cursar, y para la coordinación son
 * dos cosas distintas.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ClipboardCheck, Lock } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  listarInscripciones,
  listarPeriodos,
  materiasParaSelector,
  resumenInscripciones,
} from "@/server/academico/queries";
import { estudiantesParaSelector } from "@/server/estudiantes/queries";
import type { Inscripcion, Periodo } from "@/server/academico/types";
import type { EstadoDominio } from "@/lib/estados";
import { paletaDe } from "@/lib/estados";
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
import { FiltroPrematricula } from "./filtros";
import { BotonInscribir, type TextosInscribir } from "./dialogo-inscribir";

/** Estado de la inscripción → color del sistema. */
function bandaDeInscripcion(estado: string): EstadoDominio {
  switch (estado) {
    case "aprobada":
      return "tarea-completada";
    case "reprobada":
      return "nota-critica";
    case "retirada":
      return "tarea-cancelada";
    default:
      return "tarea-progreso";
  }
}

type Selector = { id: string; nombre: string }[];

const RESUMEN_VACIO = {
  total: 0,
  estudiantes: 0,
  activas: 0,
  aprobadas: 0,
  reprobadas: 0,
  retiradas: 0,
  creditos: 0,
};

async function cargar(
  filtro: { periodoId?: string; buscar?: string },
  puedeEscribir: boolean,
) {
  try {
    const [inscripciones, resumen, periodos, materias, estudiantes] = await Promise.all([
      listarInscripciones(filtro),
      resumenInscripciones(filtro.periodoId),
      listarPeriodos(),
      puedeEscribir ? materiasParaSelector() : Promise.resolve([] as Selector),
      puedeEscribir ? estudiantesParaSelector() : Promise.resolve([] as Selector),
    ]);
    return { inscripciones, resumen, periodos, materias, estudiantes, error: false };
  } catch {
    return {
      inscripciones: [] as Inscripcion[],
      resumen: RESUMEN_VACIO,
      periodos: [] as Periodo[],
      materias: [] as Selector,
      estudiantes: [] as Selector,
      error: true,
    };
  }
}

export default async function PrematriculaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; periodo?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
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
        <PageHeader eyebrow={t("eyebrow")} title={t("enrollment.title")} />
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

  const q = (sp.q ?? "").trim();
  // Se carga primero la lista de períodos para validar el de la URL: un
  // `?periodo=` inventado no debe llegar al SQL como filtro.
  const todosLosPeriodos = await listarPeriodos().catch(() => [] as Periodo[]);
  const periodo = todosLosPeriodos.some((p) => p.id === sp.periodo) ? sp.periodo! : "";

  const { inscripciones, resumen, periodos, materias, estudiantes, error } = await cargar(
    { periodoId: periodo || undefined, buscar: q || undefined },
    puedeEscribir,
  );

  const periodoActivo =
    periodos.find((p) => p.estado === "activo")?.id ?? periodos[0]?.id;

  const textosDialogo: TextosInscribir = {
    titulo: t("newEnrollment.title"),
    subtitulo: t("newEnrollment.subtitle"),
    estudiante: t("enrollment.student"),
    materia: t("enrollment.subject"),
    periodo: t("enrollment.term"),
    elegir: t("choose"),
    sinMaterias: t("newEnrollment.noSubjects"),
    sinEstudiantes: t("newGrade.noStudents"),
    crear: t("newEnrollment.create"),
    creando: t("newEnrollment.creating"),
    cancelar: t("cancel"),
    cerrar: t("close"),
    errorCampos: t("newEnrollment.fieldsRequired"),
    yaInscrito: t("newEnrollment.alreadyEnrolled"),
    errorGeneral: t("newEnrollment.error"),
  };

  const boton = puedeEscribir && (
    <BotonInscribir
      etiqueta={t("enrollment.new")}
      textos={textosDialogo}
      estudiantes={estudiantes}
      materias={materias}
      periodos={periodos}
      periodoPorDefecto={periodo || periodoActivo}
    />
  );

  const cifras = [
    { clave: "students", valor: resumen.estudiantes },
    { clave: "active", valor: resumen.activas },
    { clave: "credits", valor: resumen.creditos },
    { clave: "closed", valor: resumen.aprobadas + resumen.reprobadas },
  ] as const;

  const hayFiltro = Boolean(q || periodo);

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("enrollment.title")}
          description={t("enrollment.description")}
          actions={boton}
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
              {t(`enrollment.stats.${c.clave}` as never)}
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">{c.valor}</p>
          </Card>
        ))}
      </div>

      <FiltroPrematricula
        valores={{ q, periodo }}
        periodos={periodos.map((p) => ({ id: p.id, nombre: p.nombre }))}
        rutaLimpiar={`/${locale}/academico/prematricula`}
        textos={{
          buscar: t("search"),
          buscarPlaceholder: t("enrollment.searchPlaceholder"),
          periodo: t("enrollment.term"),
          todos: t("allTerms"),
          aplicar: t("apply"),
          limpiar: t("clear"),
        }}
      />

      {error ? (
        <EmptyState
          icon={ClipboardCheck}
          title={t("loadError")}
          description={t("loadErrorHint")}
        />
      ) : inscripciones.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title={hayFiltro ? t("noMatches") : t("enrollment.empty")}
          description={hayFiltro ? t("noMatchesHint") : t("enrollment.emptyHint")}
          action={
            hayFiltro ? (
              <Button variant="outline" asChild>
                <Link href={`/${locale}/academico/prematricula`}>{t("clear")}</Link>
              </Button>
            ) : (
              boton
            )
          }
        />
      ) : (
        <section className="space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("enrollment.count", { count: inscripciones.length })}
          </h2>

          <Card className="animate-fade-up overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">{t("enrollment.student")}</TableHead>
                    <TableHead scope="col">{t("enrollment.subject")}</TableHead>
                    <TableHead scope="col" className="text-right">
                      {t("subject.credits")}
                    </TableHead>
                    <TableHead scope="col">{t("enrollment.term")}</TableHead>
                    <TableHead scope="col">{t("enrollment.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inscripciones.map((i) => {
                    const banda = bandaDeInscripcion(i.estado);
                    return (
                      <TableRow
                        key={i.id}
                        className={cn(
                          "border-l-[3px]",
                          paletaDe(banda).riel,
                          i.estado === "retirada" && "opacity-60",
                        )}
                      >
                        <TableCell>
                          {/* Enlace al expediente: desde la matrícula lo
                              siguiente que se hace es mirar la ficha. */}
                          <Link
                            href={`/${locale}/expedientes/${i.estudiante_id}`}
                            className="rounded-sm font-medium hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {i.estudiante_nombre}
                          </Link>
                        </TableCell>
                        <TableCell className="text-[13px]">{i.materia_nombre}</TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {i.creditos ?? "—"}
                        </TableCell>
                        <TableCell className="font-mono text-[13px] tabular-nums">
                          {i.periodo_nombre}
                        </TableCell>
                        <TableCell>
                          <ChipEstado estado={banda} punto>
                            {t(`enrollmentStatus.${i.estado}` as never)}
                          </ChipEstado>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {inscripciones.length === 500 && (
            <p className="text-[13px] text-muted-foreground">{t("enrollment.limitHint")}</p>
          )}
        </section>
      )}
    </div>
  );
}
