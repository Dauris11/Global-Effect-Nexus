/**
 * Panel principal del portal. Reúne las métricas de la Fundación (estudiantes,
 * becas, cursos, balance), la serie financiera y las listas de próximos eventos
 * y tareas prioritarias. Superficie de referencia del sistema de diseño:
 * StatCards con conteo animado, gráfica de área y stagger de entrada discreto
 * (ver docs/09-guia-de-diseno.md §5). Resiliente: si la BD no responde, muestra
 * ceros/estados vacíos en lugar de romper.
 */
import { GraduationCap, HeartHandshake, BookOpen, Wallet, CalendarClock, ListChecks } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { currentUser } from "@/lib/auth";
import {
  metricasDashboard,
  balanceMensual,
  proximosEventos,
  tareasPrioritarias,
  type DashboardMetricas,
  type PuntoBalance,
} from "@/server/dashboard/queries";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BalanceChart } from "./balance-chart";

type Evento = { id: string; titulo: string; tipo: string; fecha: string };
type Tarea = {
  id: string;
  titulo: string;
  prioridad: string;
  estado: string;
  fecha_limite: string | null;
};

const PRIORIDAD_VARIANT: Record<string, "danger" | "warning" | "info" | "neutral"> = {
  urgente: "danger",
  alta: "warning",
  media: "info",
  baja: "neutral",
};

/** Carga tolerante a fallos: la vista de diseño no debe romperse sin BD. */
async function cargar() {
  const vacio: {
    metricas: DashboardMetricas;
    balance: PuntoBalance[];
    eventos: Evento[];
    tareas: Tarea[];
  } = {
    metricas: {
      estudiantes_activos: 0,
      becados: 0,
      cursos_activos: 0,
      tareas_pendientes: 0,
      balance_mes: 0,
    },
    balance: [],
    eventos: [],
    tareas: [],
  };
  try {
    const [metricas, balance, eventos, tareas] = await Promise.all([
      metricasDashboard(),
      balanceMensual(6),
      proximosEventos(5),
      tareasPrioritarias(5),
    ]);
    return { metricas, balance, eventos, tareas };
  } catch {
    return vacio;
  }
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [user, t, data] = await Promise.all([
    currentUser(),
    getTranslations("dashboard"),
    cargar(),
  ]);
  const { metricas, balance, eventos, tareas } = data;

  const fechaCorta = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" });

  const cards = [
    { label: t("students"), value: metricas.estudiantes_activos, icon: GraduationCap, accent: "teal" as const },
    { label: t("scholarships"), value: metricas.becados, icon: HeartHandshake, accent: "coral" as const },
    { label: t("courses"), value: metricas.cursos_activos, icon: BookOpen, accent: "teal" as const },
    { label: t("balance"), value: metricas.balance_mes, icon: Wallet, accent: "gold" as const, format: "currency" as const, hint: t("thisMonth") },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={t("overview")}
          title={user ? t("greeting", { name: user.nombre.split(" ")[0] }) : t("overview")}
          description={t("summary")}
        />
      </div>

      {/* Métricas — stagger discreto (40 ms entre tarjetas) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <div key={c.label} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
            <StatCard
              label={c.label}
              value={c.value}
              icon={c.icon}
              accent={c.accent}
              format={c.format}
              locale={locale}
              hint={c.hint}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfica financiera */}
        <Card className="animate-fade-up lg:col-span-2" style={{ animationDelay: "160ms" }}>
          <CardHeader>
            <CardTitle>{t("financeTitle")}</CardTitle>
            <CardDescription>{t("financeSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {balance.length > 0 ? (
              <BalanceChart data={balance} />
            ) : (
              <EmptyState icon={Wallet} title={t("noData")} className="border-0" />
            )}
          </CardContent>
        </Card>

        {/* Próximos eventos */}
        <Card className="animate-fade-up" style={{ animationDelay: "200ms" }}>
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
                    {fechaCorta.format(new Date(e.fecha)).split(" ").map((s, i) => (
                      <span key={i} className={i === 0 ? "text-sm font-semibold text-foreground" : ""}>
                        {s}
                      </span>
                    ))}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{e.titulo}</p>
                    <p className="truncate text-xs capitalize text-muted-foreground">{e.tipo}</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={CalendarClock} title={t("eventsEmpty")} className="border-0" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tareas prioritarias */}
      <Card className="animate-fade-up" style={{ animationDelay: "240ms" }}>
        <CardHeader>
          <CardTitle>{t("tasksTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {tareas.length > 0 ? (
            tareas.map((tarea) => (
              <div
                key={tarea.id}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/60"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Badge variant={PRIORIDAD_VARIANT[tarea.prioridad] ?? "neutral"} className="capitalize">
                    {tarea.prioridad}
                  </Badge>
                  <p className="truncate text-sm font-medium text-foreground">{tarea.titulo}</p>
                </div>
                {tarea.fecha_limite && (
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {fechaCorta.format(new Date(tarea.fecha_limite))}
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
    </div>
  );
}
