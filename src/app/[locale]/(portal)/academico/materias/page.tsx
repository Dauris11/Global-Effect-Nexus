/**
 * Materias — ClickUp S6 · #219.
 *
 * Catálogo de materias por cuatrimestre. Superficie **Académico**: claridad
 * sobre densidad (estándar §9), así que la tabla lleva menos columnas de las que
 * caben y el detalle largo (descripción) no se apila en la fila.
 *
 * **Sin riel de estado**, a propósito. El estándar es explícito: "los registros
 * sin estado relevante no llevan riel — si todo lo tiene, no señala nada" (§5).
 * En un catálogo sano casi toda materia está activa, así que un riel en cada
 * fila sería decoración. El estado va en su chip, y la fila inactiva se apaga.
 *
 * Permiso de lectura `academico.leer`; crear exige `academico.escribir`.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, BookOpen, Lock } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  listarMaterias,
  listarPeriodos,
  resumenMaterias,
} from "@/server/academico/queries";
import type { Materia } from "@/server/academico/types";
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
import { BotonNuevaMateria, type TextosNuevaMateria } from "./dialogo-nueva-materia";

async function cargar(buscar?: string) {
  try {
    const [materias, resumen, periodos] = await Promise.all([
      listarMaterias(buscar),
      resumenMaterias(),
      listarPeriodos(),
    ]);
    return { materias, resumen, periodos, error: false };
  } catch {
    return {
      materias: [] as Materia[],
      resumen: { total: 0, activas: 0, creditos: 0 },
      periodos: [] as { id: string; nombre: string }[],
      error: true,
    };
  }
}

export default async function MateriasPage({
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
        <PageHeader eyebrow={t("eyebrow")} title={t("subjects.title")} />
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
  const { materias, resumen, periodos, error } = await cargar(q || undefined);

  const textosDialogo: TextosNuevaMateria = {
    titulo: t("newSubject.title"),
    subtitulo: t("newSubject.subtitle"),
    nombre: t("subject.name"),
    nombrePlaceholder: t("newSubject.namePlaceholder"),
    codigo: t("subject.code"),
    descripcion: t("subject.description"),
    periodo: t("subject.term"),
    sinPeriodo: t("noTerm"),
    creditos: t("subject.credits"),
    profesor: t("subject.teacher"),
    estado: t("subject.status"),
    horario: t("subject.schedule"),
    horarioPlaceholder: t("newSubject.scheduleHint"),
    aula: t("subject.room"),
    crear: t("newSubject.create"),
    creando: t("newSubject.creating"),
    cancelar: t("cancel"),
    cerrar: t("close"),
    errorNombre: t("newSubject.nameRequired"),
    errorGeneral: t("newSubject.error"),
    estados: {
      activa: t("subjectStatus.activa"),
      inactiva: t("subjectStatus.inactiva"),
    },
  };

  const cifras = [
    { clave: "total", valor: resumen.total },
    { clave: "active", valor: resumen.activas },
    { clave: "credits", valor: resumen.creditos },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("subjects.title")}
          description={t("subjects.description")}
          actions={
            puedeEscribir && (
              <BotonNuevaMateria
                etiqueta={t("subjects.new")}
                textos={textosDialogo}
                periodos={periodos}
              />
            )
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cifras.map((c, i) => (
          <Card
            key={c.clave}
            className="animate-fade-up p-5"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {t(`subjects.stats.${c.clave}` as never)}
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">{c.valor}</p>
          </Card>
        ))}
      </div>

      <Buscador
        valor={q}
        rutaLimpiar={`/${locale}/academico/materias`}
        textos={{
          etiqueta: t("search"),
          placeholder: t("subjects.searchPlaceholder"),
          aplicar: t("apply"),
          limpiar: t("clear"),
        }}
      />

      {error ? (
        <EmptyState icon={BookOpen} title={t("loadError")} description={t("loadErrorHint")} />
      ) : materias.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={q ? t("noMatches") : t("subjects.empty")}
          description={q ? t("noMatchesHint") : t("subjects.emptyHint")}
          action={
            q ? (
              <Button variant="outline" asChild>
                <Link href={`/${locale}/academico/materias`}>{t("clear")}</Link>
              </Button>
            ) : (
              puedeEscribir && (
                <BotonNuevaMateria
                  etiqueta={t("subjects.new")}
                  textos={textosDialogo}
                  periodos={periodos}
                />
              )
            )
          }
        />
      ) : (
        <section className="space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("subjects.count", { count: materias.length })}
          </h2>

          <Card className="animate-fade-up overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">{t("subject.name")}</TableHead>
                    <TableHead scope="col">{t("subject.term")}</TableHead>
                    <TableHead scope="col" className="text-right">
                      {t("subject.credits")}
                    </TableHead>
                    <TableHead scope="col">{t("subject.teacher")}</TableHead>
                    <TableHead scope="col">{t("subject.scheduleShort")}</TableHead>
                    <TableHead scope="col">{t("subject.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materias.map((m) => (
                    // La fila inactiva se apaga en vez de llevar riel: así el
                    // ojo la salta al recorrer el catálogo, que es lo que se
                    // quiere de una materia que ya no se dicta.
                    <TableRow key={m.id} className={cn(m.estado !== "activa" && "opacity-60")}>
                      <TableCell>
                        <p className="font-medium">{m.nombre}</p>
                        {m.codigo && (
                          <p className="font-mono text-[13px] text-muted-foreground">
                            {m.codigo}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="text-[13px]">
                        {m.periodo_nombre ?? (
                          <span className="text-muted-foreground">{t("noTerm")}</span>
                        )}
                      </TableCell>

                      {/* Los créditos se comparan en columna: mono tabular. */}
                      <TableCell className="text-right font-mono text-sm tabular-nums">
                        {m.creditos}
                      </TableCell>

                      <TableCell className="text-[13px]">
                        {m.profesor_nombre ?? (
                          <span className="text-muted-foreground">{t("unassigned")}</span>
                        )}
                      </TableCell>

                      <TableCell className="text-[13px] text-muted-foreground">
                        {[m.horario, m.aula].filter(Boolean).join(" · ") || "—"}
                      </TableCell>

                      <TableCell>
                        <ChipEstado
                          estado={m.estado === "activa" ? "tarea-progreso" : "tarea-cancelada"}
                          punto
                        >
                          {t(`subjectStatus.${m.estado}` as never)}
                        </ChipEstado>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {materias.length === 200 && (
            <p className="text-[13px] text-muted-foreground">{t("limitHint")}</p>
          )}
        </section>
      )}
    </div>
  );
}
