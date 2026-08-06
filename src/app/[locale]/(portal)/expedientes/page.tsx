/**
 * Expedientes — listado y buscador (ClickUp S5 · #206 CRUD + buscador).
 *
 * Es el módulo más usado de la plataforma y el que da nombre al sistema: cada
 * fila es un joven de la fundación, no un registro. De ahí dos decisiones:
 *
 * • El riel de cada fila lleva la banda de su GPA, no su estado administrativo.
 *   Recorriendo el listado con la vista, lo que hay que detectar es a quién se
 *   le está cayendo el rendimiento; el estado del pipeline ya va en su chip.
 *   Quien no tiene historial todavía no lleva riel: pintarlo de gris sugeriría
 *   una nota mala donde solo hay ausencia de notas (estándar §5).
 *
 * • Los filtros van en la URL, así que un enlace a "becados en standby técnico"
 *   se puede pegar en un correo.
 *
 * Permiso de lectura: `expedientes.leer`; el alta exige `expedientes.escribir`.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Lock, UserPlus, Users } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { listarEstudiantes, resumenExpedientes } from "@/server/estudiantes/queries";
import type { EstudianteListItem, ResumenExpedientes } from "@/server/estudiantes/types";
import { ESTADOS_ESTUDIANTE, TIPOS_ESTUDIANTE } from "@/server/estudiantes/schema";
import { bandaDeGpa, paletaDe } from "@/lib/estados";
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
import { FiltrosExpedientes } from "./filtros";

const RESUMEN_VACIO: ResumenExpedientes = {
  total: 0,
  becados: 0,
  activos: 0,
  en_proceso: 0,
};

/**
 * Estado del pipeline → color. Los cuatro estados previos a `activo` son
 * pasos normales de reclutamiento, no problemas: van en el azul de "en curso".
 * `suspendido` e `inactivo` sí piden atención.
 */
function bandaDeEstadoEstudiante(estado: string) {
  switch (estado) {
    case "activo":
      return "tarea-progreso" as const;
    case "graduado":
      return "tarea-completada" as const;
    case "suspendido":
      return "prioridad-urgente" as const;
    case "inactivo":
      return "tarea-cancelada" as const;
    default:
      return "tarea-pendiente" as const;
  }
}

async function cargar(filtro: { tipo?: string; estado?: string; buscar?: string }) {
  try {
    const [resumen, estudiantes] = await Promise.all([
      resumenExpedientes(),
      listarEstudiantes(filtro),
    ]);
    return { resumen, estudiantes, error: false };
  } catch {
    return { resumen: RESUMEN_VACIO, estudiantes: [] as EstudianteListItem[], error: true };
  }
}

export default async function ExpedientesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; tipo?: string; estado?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const [puedeLeer, puedeEscribir, t] = await Promise.all([
    can(user.rol, "expedientes.leer"),
    can(user.rol, "expedientes.escribir"),
    getTranslations("records"),
  ]);

  if (!puedeLeer) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow={t("eyebrow")} title={t("title")} />
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

  // Solo se aceptan valores del enum: un `?estado=` inventado en la URL no
  // debe llegar al SQL como filtro, se ignora.
  const q = (sp.q ?? "").trim();
  const tipo = TIPOS_ESTUDIANTE.includes(sp.tipo as never) ? sp.tipo! : "";
  const estado = ESTADOS_ESTUDIANTE.includes(sp.estado as never) ? sp.estado! : "";

  const { resumen, estudiantes, error } = await cargar({
    buscar: q || undefined,
    tipo: tipo || undefined,
    estado: estado || undefined,
  });

  const hayFiltro = Boolean(q || tipo || estado);
  const numero = new Intl.NumberFormat(locale, { minimumFractionDigits: 2 });

  const cifras = [
    { clave: "total", valor: resumen.total },
    { clave: "scholarship", valor: resumen.becados },
    { clave: "active", valor: resumen.activos },
    { clave: "inProcess", valor: resumen.en_proceso },
  ] as const;

  const etiquetasTipo = Object.fromEntries(
    TIPOS_ESTUDIANTE.map((v) => [v, t(`type.${v}` as never)]),
  );
  const etiquetasEstado = Object.fromEntries(
    ESTADOS_ESTUDIANTE.map((v) => [v, t(`status.${v}` as never)]),
  );

  return (
    <div className="space-y-8">
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          actions={
            puedeEscribir && (
              // El alta es una página, no un diálogo: son seis secciones de
              // ficha social y en un modal no caben sin ahogar al usuario
              // (estándar §6, "cuándo dialog y cuándo no").
              <Button asChild>
                <Link href={`/${locale}/expedientes/nuevo`}>
                  <UserPlus aria-hidden />
                  {t("new")}
                </Link>
              </Button>
            )
          }
        />
      </div>

      {/* Cifras de la cartera de expedientes */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cifras.map((c, i) => (
          <Card
            key={c.clave}
            className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out p-5"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <p className="tabular-nums text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {t(`stats.${c.clave}` as never)}
            </p>
            <p className="mt-2 tabular-nums text-3xl font-semibold tabular-nums">{c.valor}</p>
          </Card>
        ))}
      </div>

      <FiltrosExpedientes
        valores={{ q, tipo, estado }}
        tipos={TIPOS_ESTUDIANTE}
        estados={ESTADOS_ESTUDIANTE}
        rutaLimpiar={`/${locale}/expedientes`}
        textos={{
          buscar: t("filters.search"),
          buscarPlaceholder: t("filters.searchPlaceholder"),
          tipo: t("filters.type"),
          estado: t("filters.status"),
          todos: t("filters.all"),
          aplicar: t("filters.apply"),
          limpiar: t("filters.clear"),
          tipos: etiquetasTipo,
          estados: etiquetasEstado,
        }}
      />

      {error ? (
        <EmptyState icon={Users} title={t("loadError")} description={t("loadErrorHint")} />
      ) : estudiantes.length === 0 ? (
        <EmptyState
          icon={Users}
          title={hayFiltro ? t("noMatches") : t("empty")}
          description={hayFiltro ? t("noMatchesHint") : t("emptyHint")}
          action={
            hayFiltro ? (
              <Button variant="outline" asChild>
                <Link href={`/${locale}/expedientes`}>{t("filters.clear")}</Link>
              </Button>
            ) : (
              puedeEscribir && (
                <Button asChild>
                  <Link href={`/${locale}/expedientes/nuevo`}>
                    <UserPlus aria-hidden />
                    {t("new")}
                  </Link>
                </Button>
              )
            )
          }
        />
      ) : (
        <section className="space-y-3">
          <h2 className="tabular-nums text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("count", { count: estudiantes.length })}
          </h2>

          <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">{t("column.student")}</TableHead>
                    <TableHead scope="col">{t("column.type")}</TableHead>
                    <TableHead scope="col">{t("column.status")}</TableHead>
                    <TableHead scope="col" className="text-right">
                      {t("column.gpa")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estudiantes.map((e) => {
                    const banda = bandaDeGpa(e.gpa);
                    return (
                      <TableRow
                        key={e.id}
                        // Sin GPA no hay riel: un gris aquí se leería como nota baja.
                        className={cn(
                          e.gpa != null && "border-l-[3px]",
                          e.gpa != null && paletaDe(banda).riel,
                        )}
                      >
                        <TableCell>
                          <Link
                            href={`/${locale}/expedientes/${e.id}`}
                            className="rounded-sm font-medium hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {e.nombre}
                          </Link>
                          {e.programa && (
                            <p className="truncate text-[13px] text-muted-foreground">
                              {e.programa}
                            </p>
                          )}
                        </TableCell>

                        <TableCell>
                          <ChipEstado
                            estado={e.tipo === "becado" ? "confid-bajo" : "neutral"}
                          >
                            {t(`type.${e.tipo}` as never)}
                          </ChipEstado>
                        </TableCell>

                        <TableCell>
                          <ChipEstado estado={bandaDeEstadoEstudiante(e.estado)} punto>
                            {t(`status.${e.estado}` as never)}
                          </ChipEstado>
                        </TableCell>

                        {/* El GPA es la cifra que se compara en columna: mono tabular. */}
                        <TableCell className="text-right">
                          {e.gpa != null ? (
                            <span
                              className={cn(
                                "tabular-nums text-sm font-semibold tabular-nums",
                                paletaDe(banda).texto,
                              )}
                            >
                              {numero.format(e.gpa)}
                            </span>
                          ) : (
                            <span className="text-[13px] text-muted-foreground">
                              {t("noGpa")}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {estudiantes.length === 200 && (
            <p className="text-[13px] text-muted-foreground">{t("limitHint")}</p>
          )}
        </section>
      )}
    </div>
  );
}
