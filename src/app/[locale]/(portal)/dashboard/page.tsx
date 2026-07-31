/**
 * Panel principal del portal — ClickUp S5 · #210.
 *
 * Reúne las cifras de la Fundación, la serie financiera y las listas de próximos
 * eventos y tareas que apremian. Superficie de referencia del sistema de diseño:
 * StatCards con conteo animado, gráfica de área y stagger de entrada discreto.
 *
 * **El panel se arma según los permisos del rol.** No es una preferencia de
 * diseño: el balance del mes y la gráfica de ingresos/egresos son datos
 * financieros de la fundación, y un estudiante o un docente no tienen
 * `finanzas.leer`. Cada bloque se consulta solo si el rol puede verlo — así una
 * cifra que no le corresponde a alguien ni siquiera sale de la base de datos.
 *
 * Resiliente: si la BD no responde, muestra ceros y estados vacíos en lugar de
 * romper.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CalendarClock, LayoutDashboard, ListChecks, Wallet } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { bandaDePrioridad, paletaDe } from "@/lib/estados";
import { cn } from "@/lib/utils";
import {
  balanceDelMes,
  balanceMensual,
  metricasDashboard,
  proximosEventos,
  tareasPrioritarias,
  type DashboardMetricas,
  type EventoProximo,
  type PuntoBalance,
  type TareaPrioritaria,
} from "@/server/dashboard/queries";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChipEstado } from "@/components/ui/chip-estado";
import { EmptyState } from "@/components/ui/empty-state";
import { BalanceChart } from "./balance-chart";

const METRICAS_VACIAS: DashboardMetricas = {
  estudiantes_activos: 0,
  becados: 0,
  cursos_activos: 0,
  tareas_pendientes: 0,
};

/**
 * Carga solo lo que el rol puede ver, y tolera un fallo de la BD.
 *
 * Cada bloque va en su propio `catch`: si la serie financiera falla, el panel
 * sigue mostrando eventos y tareas en vez de vaciarse entero.
 */
async function cargar(permisos: {
  finanzas: boolean;
  operaciones: boolean;
  institucional: boolean;
}) {
  const [metricas, balance, serie, eventos, tareas] = await Promise.all([
    permisos.institucional
      ? metricasDashboard().catch(() => METRICAS_VACIAS)
      : Promise.resolve(METRICAS_VACIAS),
    permisos.finanzas ? balanceDelMes().catch(() => null) : Promise.resolve(null),
    permisos.finanzas
      ? balanceMensual(6).catch(() => [] as PuntoBalance[])
      : Promise.resolve([] as PuntoBalance[]),
    permisos.operaciones
      ? proximosEventos(5).catch(() => [] as EventoProximo[])
      : Promise.resolve([] as EventoProximo[]),
    permisos.operaciones
      ? tareasPrioritarias(5).catch(() => [] as TareaPrioritaria[])
      : Promise.resolve([] as TareaPrioritaria[]),
  ]);
  return { metricas, balance, serie, eventos, tareas };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const [t, verFinanzas, verOperaciones, verExpedientes, verAcademico] =
    await Promise.all([
      getTranslations("dashboard"),
      can(user.rol, "finanzas.leer"),
      can(user.rol, "operaciones.leer"),
      can(user.rol, "expedientes.leer"),
      can(user.rol, "academico.leer"),
    ]);

  const verInstitucional = verExpedientes || verAcademico;
  const { metricas, balance, serie, eventos, tareas } = await cargar({
    finanzas: verFinanzas,
    operaciones: verOperaciones,
    institucional: verInstitucional,
  });

  const fechaCorta = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
  });
  /** Formatea `YYYY-MM-DD` sin pasar por la zona horaria del servidor. */
  const formatearDia = (f: string) => {
    const [a, m, d] = f.split("-").map(Number);
    return fechaCorta.format(new Date(a, m - 1, d));
  };

  // Los iconos van por nombre: StatCard es un componente cliente y React no
  // serializa componentes a través de esa frontera (ver components/ui/icono.tsx).
  const cards = [
    verExpedientes && {
      clave: "students",
      label: t("students"),
      value: metricas.estudiantes_activos,
      icon: "GraduationCap",
      accent: "teal" as const,
      href: `/${locale}/expedientes?estado=activo`,
    },
    verExpedientes && {
      clave: "scholarships",
      label: t("scholarships"),
      value: metricas.becados,
      icon: "HeartHandshake",
      accent: "coral" as const,
      href: `/${locale}/expedientes?tipo=becado`,
    },
    verAcademico && {
      clave: "courses",
      label: t("courses"),
      value: metricas.cursos_activos,
      icon: "BookOpen",
      accent: "teal" as const,
    },
    verOperaciones && {
      clave: "openTasks",
      label: t("openTasks"),
      value: metricas.tareas_pendientes,
      icon: "ListChecks",
      accent: "teal" as const,
      href: `/${locale}/administrativo/tareas`,
    },
    verFinanzas &&
      balance != null && {
        clave: "balance",
        label: t("balance"),
        value: balance,
        icon: "Wallet",
        accent: "gold" as const,
        format: "currency" as const,
        hint: t("thisMonth"),
      },
  ].filter(Boolean) as {
    clave: string;
    label: string;
    value: number;
    icon: string;
    accent: "teal" | "coral" | "gold";
    format?: "currency";
    hint?: string;
    href?: string;
  }[];

  // Un rol sin ningún permiso de lectura no debe ver un panel en blanco: se le
  // dice que su portal está en camino en vez de dejarlo mirando el vacío.
  const sinNada = cards.length === 0 && !verFinanzas && !verOperaciones;

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={t("overview")}
          title={t("greeting", { name: user.nombre.split(" ")[0] })}
          description={t("summary")}
        />
      </div>

      {sinNada ? (
        <EmptyState
          icon={LayoutDashboard}
          title={t("emptyRole")}
          description={t("emptyRoleHint")}
        />
      ) : (
        <>
          {/* Cifras — stagger discreto (40 ms entre tarjetas) */}
          {cards.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((c, i) => {
                const tarjeta = (
                  <StatCard
                    label={c.label}
                    value={c.value}
                    icon={c.icon}
                    accent={c.accent}
                    format={c.format}
                    locale={locale}
                    hint={c.hint}
                    className={c.href ? "h-full transition-colors hover:bg-accent/40" : undefined}
                  />
                );
                return (
                  <div
                    key={c.clave}
                    className="animate-fade-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    {/* Las cifras que tienen módulo llevan al módulo con el
                        filtro ya puesto: ver "12 becados" y no poder pulsarlo
                        obliga a rehacer el filtro a mano. */}
                    {c.href ? (
                      <Link
                        href={c.href}
                        className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {tarjeta}
                      </Link>
                    ) : (
                      tarjeta
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Gráfica financiera — solo con finanzas.leer */}
            {verFinanzas && (
              <Card
                className="animate-fade-up lg:col-span-2"
                style={{ animationDelay: "160ms" }}
              >
                <CardHeader>
                  <CardTitle>{t("financeTitle")}</CardTitle>
                  <CardDescription>{t("financeSubtitle")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {serie.length > 0 ? (
                    <BalanceChart
                      data={serie}
                      locale={locale}
                      textos={{ ingresos: t("income"), egresos: t("expenses") }}
                    />
                  ) : (
                    <EmptyState icon={Wallet} title={t("noData")} className="border-0" />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Próximos eventos — solo con operaciones.leer */}
            {verOperaciones && (
              <Card
                className={cn("animate-fade-up", !verFinanzas && "lg:col-span-3")}
                style={{ animationDelay: "200ms" }}
              >
                <CardHeader>
                  <CardTitle>{t("eventsTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {eventos.length > 0 ? (
                    eventos.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/60"
                      >
                        <span className="flex size-9 shrink-0 flex-col items-center justify-center rounded-md bg-muted font-mono text-[10px] leading-none text-muted-foreground">
                          {formatearDia(e.fecha)
                            .split(" ")
                            .map((s, i) => (
                              <span
                                key={i}
                                className={
                                  i === 0 ? "text-sm font-semibold text-foreground" : ""
                                }
                              >
                                {s}
                              </span>
                            ))}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {e.titulo}
                          </p>
                          <p className="truncate text-xs capitalize text-muted-foreground">
                            {e.tipo}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      icon={CalendarClock}
                      title={t("eventsEmpty")}
                      className="border-0"
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tareas que apremian — solo con operaciones.leer */}
          {verOperaciones && (
            <Card className="animate-fade-up" style={{ animationDelay: "240ms" }}>
              <CardHeader>
                <CardTitle>{t("tasksTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {tareas.length > 0 ? (
                  tareas.map((tarea) => (
                    /* Riel de prioridad a la izquierda: la firma del portal (§5). */
                    <div
                      key={tarea.id}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-md border-l-[3px] px-3 py-2.5",
                        paletaDe(bandaDePrioridad(tarea.prioridad)).riel,
                        "transition-colors hover:bg-muted/60",
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <ChipEstado
                          estado={bandaDePrioridad(tarea.prioridad)}
                          punto
                          className="shrink-0"
                        >
                          {t(`priority.${tarea.prioridad}` as never)}
                        </ChipEstado>
                        <p className="truncate text-sm font-medium text-foreground">
                          {tarea.titulo}
                        </p>
                      </div>

                      {/* Vencida en rojo, hoy en ámbar: la señal más útil de
                          todo el módulo (estándar §10). Sin esto, una tarea
                          atrasada se ve igual que una que vence en tres semanas. */}
                      {tarea.fecha_limite && (
                        <span
                          className={cn(
                            "shrink-0 font-mono text-xs tabular-nums",
                            tarea.vencida
                              ? "font-semibold text-destructive"
                              : tarea.vence_hoy
                                ? "font-semibold text-prioridad-alta"
                                : "text-muted-foreground",
                          )}
                        >
                          {tarea.vencida && <span className="mr-1">{t("overdue")}</span>}
                          {tarea.vence_hoy && <span className="mr-1">{t("dueToday")}</span>}
                          {formatearDia(tarea.fecha_limite)}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={ListChecks}
                    title={t("tasksEmpty")}
                    description={t("tasksEmptyHint")}
                    className="border-0"
                  />
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
