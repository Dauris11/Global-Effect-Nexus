/**
 * Portal de Psicología — vista de entrada del equipo de bienestar.
 *
 * Este portal es distinto a los demás en una cosa: los datos que muestra son
 * confidenciales y están aislados del expediente general (ver
 * `server/psicologia/types.ts`). Por eso la lista de citas lleva su insignia
 * de "Confidencial" visible y no se enseña el motivo de la cita, solo el
 * tipo y si hay riesgos señalados.
 */
import { AlertTriangle, Calendar, FolderOpen, Heart, Lock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { aFecha } from "@/lib/fechas";
import { BannerRol } from "@/components/portal/banner-rol";
import { AccesosRapidos, type AccesoRapido } from "@/components/portal/accesos-rapidos";
import { CardLista, ItemLista, EstadoVacio } from "@/components/portal/card-lista";
import { Badge } from "@/components/ui/badge";
import { listarCitas, estadisticasPsicologia } from "@/server/psicologia/queries";
import type { CitaPsicologia, PsicologiaEstadisticas } from "@/server/psicologia/types";

export const dynamic = "force-dynamic";

const ACCESOS: AccesoRapido[] = [
  {
    href: "/psicologia",
    icono: Heart,
    titulo: "Citas y Seguimientos",
    descripcion: "Agenda y notas confidenciales",
    azulejo: "bg-rose-50 text-rose-600",
  },
  {
    href: "/expedientes",
    icono: FolderOpen,
    titulo: "Expedientes",
    descripcion: "Ficha general del estudiante",
    azulejo: "bg-blue-50 text-blue-600",
  },
  {
    href: "/calendario",
    icono: Calendar,
    titulo: "Calendario",
    descripcion: "Actividades institucionales",
    azulejo: "bg-orange-50 text-orange-600",
  },
];

export default async function PortalPsicologiaPage() {
  let citas: CitaPsicologia[] = [];
  let stats: PsicologiaEstadisticas = {
    total: 0,
    programadas: 0,
    seguimientos: 0,
    confidenciales: 0,
  };
  try {
    [citas, stats] = await Promise.all([listarCitas(), estadisticasPsicologia()]);
  } catch {
    /* Sin BD el portal se pinta con estados vacíos. */
  }

  const conRiesgos = citas.filter((c) => c.riesgos).length;
  const proximas = citas.slice(0, 6);

  return (
    <div className="portal-page space-y-6">
      <BannerRol
        icono={Heart}
        titulo="Portal de Psicología"
        subtitulo="Seguimiento confidencial de bienestar estudiantil"
        gradiente="bg-gradient-to-br from-rose-500 to-rose-700"
        kpis={[
          { valor: String(stats.programadas), label: "Citas Programadas" },
          { valor: String(stats.confidenciales), label: "Alta Confidencial." },
          { valor: String(conRiesgos), label: "Con Riesgos" },
        ]}
      />

      <AccesosRapidos accesos={ACCESOS} columnas="sm:grid-cols-3" />

      <CardLista
        titulo="Próximas Citas"
        icono={Lock}
        accion={
          <Badge className="bg-rose-100 text-[10px] text-rose-700 hover:bg-rose-100">
            Confidencial
          </Badge>
        }
      >
        {proximas.length === 0 ? (
          <EstadoVacio mensaje="No hay citas registradas." />
        ) : (
          proximas.map((c) => (
            <ItemLista
              key={c.id}
              icono={Heart}
              azulejo="bg-rose-100 text-rose-600"
              titulo={c.estudiante_nombre ?? "Estudiante"}
              detalle={[
                format(aFecha(c.fecha), "dd MMM", { locale: es }),
                c.hora,
                c.tipo_registro,
              ]
                .filter(Boolean)
                .join(" · ")}
              derecha={
                c.riesgos ? (
                  <AlertTriangle
                    aria-label="Riesgos señalados"
                    className="h-4 w-4 text-orange-500"
                  />
                ) : null
              }
            />
          ))
        )}
      </CardLista>
    </div>
  );
}
