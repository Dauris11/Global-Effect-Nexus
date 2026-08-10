/**
 * Portal Administrativo — coordinación y gestión interna.
 *
 * Es el portal con más accesos (ocho módulos), así que la rejilla va a tres
 * columnas en vez de cuatro: con cuatro, los títulos de dos palabras se
 * partían en dos líneas y la tarjeta perdía el ritmo del resto.
 *
 * La lista destacada son las tareas que apremian —vencidas o urgentes—, no
 * las últimas creadas: quien entra aquí necesita saber qué se le está
 * pasando, no qué acaba de registrar.
 */
import {
  Calendar,
  ClipboardList,
  FolderOpen,
  HeartHandshake,
  Bot,
  Brain,
  ListTodo,
  Salad,
  UserCog,
  Wallet,
} from "lucide-react";
import { BannerRol } from "@/components/portal/banner-rol";
import { AccesosRapidos, type AccesoRapido } from "@/components/portal/accesos-rapidos";
import { CardLista, EstadoVacio } from "@/components/portal/card-lista";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { resumenAdministrativo, tareasUrgentes } from "@/server/operaciones/queries";
import { metricasDashboard } from "@/server/dashboard/queries";
import type { TareaTablero } from "@/server/operaciones/types";
import { DistributionChart } from "../../dashboard/distribution-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Color del punto por prioridad.
 *
 * `tareasUrgentes()` devuelve lo que apremia: urgentes **o vencidas**. Una
 * tarea de prioridad media que ya venció entra en la lista, y pintarla naranja
 * la haría pasar por alta prioridad. Por eso el mapa cubre las cuatro bandas
 * en vez de decidir con un ternario urgente/resto.
 */
const PUNTO_PRIORIDAD: Record<string, string> = {
  urgente: "bg-red-500",
  alta: "bg-orange-500",
  media: "bg-amber-400",
  baja: "bg-slate-400",
};

const ACCESOS: AccesoRapido[] = [
  {
    href: "/expedientes",
    icono: FolderOpen,
    titulo: "Expedientes",
    descripcion: "Fichas de estudiantes",
    azulejo: "bg-blue-50 text-blue-600",
  },
  {
    // La pantalla de patrocinadores llega en un sprint posterior; el backend
    // ya existe (`server/patrocinadores`). Ver `NAV_ITEMS` en `lib/nav.ts`.
    href: "/patrocinadores",
    icono: HeartHandshake,
    titulo: "Patrocinadores",
    descripcion: "Aportes y becas asignadas",
    azulejo: "bg-emerald-50 text-emerald-600",
    disponible: false,
  },
  {
    // Exige `usuarios.administrar`, que solo tiene super_admin: para un admin
    // corriente este acceso llevaba a una puerta cerrada.
    href: "/administrativo/personal",
    icono: UserCog,
    titulo: "Personal",
    descripcion: "Equipo y roles (solo super admin)",
    azulejo: "bg-sky-50 text-sky-600",
  },
  {
    href: "/administrativo/tareas",
    icono: ListTodo,
    titulo: "Tareas",
    descripcion: "Tablero del equipo",
    azulejo: "bg-orange-50 text-orange-600",
  },
  {
    href: "/administrativo/proyectos",
    icono: ClipboardList,
    titulo: "Proyectos",
    descripcion: "Avance por iniciativa",
    azulejo: "bg-violet-50 text-violet-600",
  },
  {
    href: "/servicios-mensuales",
    icono: Wallet,
    titulo: "Servicios Mensuales",
    descripcion: "Registro mes a mes",
    azulejo: "bg-teal-50 text-teal-600",
  },
  {
    href: "/inscripcion-comida",
    icono: Salad,
    titulo: "Lista de Comida",
    descripcion: "Inscritos del día",
    azulejo: "bg-amber-50 text-amber-600",
  },
  {
    href: "/calendario",
    icono: Calendar,
    titulo: "Calendario",
    descripcion: "Actividades institucionales",
    azulejo: "bg-rose-50 text-rose-600",
  },
  {
    // El catálogo (03-modulos-funcionales.md) lista Chat IA como el octavo
    // acceso. El backend existe (`server/ia`), la pantalla todavía no.
    href: "/ia",
    icono: Bot,
    titulo: "Chat IA",
    descripcion: "Consultas sobre los datos de la fundación",
    azulejo: "bg-slate-100 text-slate-600",
    disponible: false,
  },
  {
    href: "/portal/psicologia",
    icono: Brain,
    titulo: "Psicología",
    descripcion: "Citas confidenciales",
    azulejo: "bg-pink-50 text-pink-600",
  },
];

export default async function PortalAdministrativoPage() {
  let resumen = {
    proyectos_activos: 0,
    tareas_abiertas: 0,
    tareas_vencidas: 0,
    estudiantes_activos: 0,
  };
  let urgentes: TareaTablero[] = [];
  let metricas = { estudiantes_activos: 0, becados: 0, cursos_activos: 0, tareas_pendientes: 0 };
  
  try {
    const [res, urg, met] = await Promise.all([
      resumenAdministrativo(), 
      tareasUrgentes(),
      metricasDashboard()
    ]);
    resumen = res;
    urgentes = urg;
    metricas = met;
  } catch {
    /* Sin BD el portal se pinta con estados vacíos. */
  }

  return (
    <div className="portal-page space-y-6">
      <BannerRol
        icono={ClipboardList}
        titulo="Portal Administrativo"
        subtitulo="Coordinación y gestión interna"
        gradiente="bg-gradient-to-br from-[#0a6a8a] to-[#2096ba]"
        kpis={[
          { valor: String(resumen.tareas_abiertas), label: "Tareas Pendientes" },
          { valor: String(resumen.proyectos_activos), label: "Proyectos Activos" },
          { valor: String(resumen.estudiantes_activos), label: "Estudiantes" },
        ]}
      />

      <AccesosRapidos accesos={ACCESOS} columnas="sm:grid-cols-2 lg:grid-cols-3" />

      <div className="grid gap-6 lg:grid-cols-2">
        <CardLista titulo="Tareas que apremian" icono={ListTodo}>
          {urgentes.length === 0 ? (
            <EstadoVacio mensaje="No hay tareas urgentes ahora mismo." />
          ) : (
            urgentes.map((tarea) => (
              <div
                key={tarea.id}
                className="flex items-center gap-3 rounded-lg bg-muted/40 p-3"
              >
                <span
                  aria-hidden
                  className={cn("h-2 w-2 shrink-0 rounded-full", PUNTO_PRIORIDAD[tarea.prioridad] ?? "bg-slate-400")}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{tarea.titulo}</p>
                  {tarea.proyecto_nombre && (
                    <p className="truncate text-xs text-muted-foreground">
                      {tarea.proyecto_nombre}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                  {tarea.prioridad}
                </Badge>
              </div>
            ))
          )}
        </CardLista>

        {/* Gráfico de distribución de estudiantes */}
        <Card className="shadow-sm border-slate-100 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Distribución Estudiantil</CardTitle>
            <CardDescription>Becados vs Regulares</CardDescription>
          </CardHeader>
          <CardContent>
            {metricas.estudiantes_activos > 0 ? (
              <DistributionChart
                becados={metricas.becados}
                regulares={metricas.estudiantes_activos - metricas.becados}
                locale="es"
                textos={{
                  becados: "Becados",
                  regulares: "Regulares"
                }}
              />
            ) : (
              <EstadoVacio mensaje="No hay datos de estudiantes." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
