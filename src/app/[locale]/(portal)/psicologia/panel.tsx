/**
 * Panel del módulo Psicología (cliente).
 *
 * Filtrado, alta de registros y apertura del expediente. Todo lo que aquí se
 * ve es confidencial, y eso manda sobre varias decisiones:
 *
 * **El nivel de confidencialidad se ve siempre.** No es un detalle escondido
 * en el registro: quien mira la rejilla tiene que saber de un vistazo qué
 * puede comentar en voz alta y qué no.
 *
 * **Los riesgos van marcados con icono y con texto.** Un color solo no basta
 * cuando la señal importa tanto.
 *
 * **Las notas no se listan.** El contenido de una nota psicológica no aparece
 * en una rejilla que puede quedar abierta en una pantalla compartida; la
 * tarjeta muestra el tipo, la fecha y el estado, nada más.
 *
 * El filtrado es en cliente sobre la lista ya cargada: son decenas de
 * registros, no miles, y así el buscador responde sin ida y vuelta al
 * servidor.
 */
"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  FolderOpen,
  Heart,
  Lock,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ExpedienteDetalle } from "@/components/expedientes/expediente-detalle";
import { cargarExpedienteParaDialogo } from "@/server/estudiantes/actions";
import { cn } from "@/lib/utils";
import type { CitaPsicologia, PsicologiaEstadisticas } from "@/server/psicologia/types";
import type { ExpedienteCompleto } from "@/server/estudiantes/types";
import type { CuatrimestreDelEstudiante } from "@/server/portales/types";
import { NuevoRegistro } from "./nuevo-registro";

/** Emoji por tipo. Es la única señal no textual y va acompañada del nombre. */
const EMOJI: Record<string, string> = {
  cita: "🗓️",
  seguimiento: "📋",
  evaluacion: "📊",
};

const ESTADO: Record<string, string> = {
  programada: "bg-blue-100 text-blue-700",
  completada: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-red-100 text-red-700",
};

/** El candado se colorea por nivel: alto exige más cuidado que bajo. */
const CONFIDENCIALIDAD: Record<string, string> = {
  alto: "text-red-500",
  medio: "text-amber-600",
  bajo: "text-emerald-600",
};

const FILTROS = [
  { valor: "todos", label: "Todos" },
  { valor: "cita", label: "Citas" },
  { valor: "seguimiento", label: "Seguimientos" },
  { valor: "evaluacion", label: "Evaluaciones" },
] as const;

export function PanelPsicologia({
  citas,
  stats,
  estudiantes,
  puedeEscribir = false,
  locale = "es",
  textosOcr,
}: {
  citas: CitaPsicologia[];
  stats: PsicologiaEstadisticas;
  estudiantes: { id: string; nombre: string }[];
  puedeEscribir?: boolean;
  locale?: string;
  textosOcr?: Record<string, string> & { status?: Record<string, string> };
}) {
  const [filtro, setFiltro] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [expediente, setExpediente] = useState<ExpedienteCompleto | null>(null);
  const [cuatrimestres, setCuatrimestres] = useState<CuatrimestreDelEstudiante[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [cargando, iniciarCarga] = useTransition();

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return citas.filter((c) => {
      const porTipo = filtro === "todos" || c.tipo_registro === filtro;
      const porNombre = q === "" || (c.estudiante_nombre ?? "").toLowerCase().includes(q);
      return porTipo && porNombre;
    });
  }, [citas, filtro, busqueda]);

  function abrirExpediente(estudianteId: string) {
    iniciarCarga(async () => {
      const r = await cargarExpedienteParaDialogo(estudianteId);
      setExpediente(r.expediente);
      setCuatrimestres(r.cuatrimestres as CuatrimestreDelEstudiante[]);
      setAbierto(true);
    });
  }

  return (
    <div className="space-y-6">
      {/* Acceso rápido al expediente sin pasar por una cita: el psicólogo
          muchas veces llega con un nombre, no con un registro. */}
      <div className="rounded-xl border bg-muted/30 p-4">
        <label
          htmlFor="buscador-expediente"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <FolderOpen aria-hidden className="h-4 w-4 text-primary" />
          Abrir el expediente de un estudiante
        </label>
        <select
          id="buscador-expediente"
          defaultValue=""
          disabled={cargando}
          onChange={(ev) => ev.target.value && abrirExpediente(ev.target.value)}
          className="mt-2 h-10 w-full rounded-lg border border-input bg-card px-3 text-sm disabled:opacity-50"
        >
          <option value="">
            {cargando ? "Cargando expediente…" : "Selecciona un estudiante…"}
          </option>
          {estudiantes.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="Heart" label="Total registros" value={stats.total} />
        <StatCard icon="Calendar" label="Programadas" value={stats.programadas} />
        <StatCard icon="User" label="Seguimientos" value={stats.seguimientos} />
        <StatCard icon="Lock" label="Confidenciales" value={stats.confidenciales} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filtro} onValueChange={setFiltro}>
          <TabsList>
            {FILTROS.map((f) => (
              <TabsTrigger key={f.valor} value={f.valor}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Buscar por nombre de estudiante"
            placeholder="Buscar por estudiante…"
            value={busqueda}
            onChange={(ev) => setBusqueda(ev.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {visibles.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Sin registros"
          description={
            citas.length === 0
              ? "Todavía no hay citas ni seguimientos registrados."
              : "Ningún registro coincide con el filtro."
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibles.map((c) => (
            <li key={c.id}>
              <Card className="h-full">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span aria-hidden className="text-lg">
                        {EMOJI[c.tipo_registro] ?? "🗓️"}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">
                          {c.estudiante_nombre ?? "Estudiante"}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {c.tipo_registro}
                        </p>
                      </div>
                    </div>
                    <Badge className={cn("shrink-0 text-[10px] capitalize", ESTADO[c.estado])}>
                      {c.estado}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {format(new Date(c.fecha), "dd MMM yyyy", { locale: es })}
                    {c.hora ? ` · ${c.hora}` : ""}
                  </p>

                  <p className="flex items-center gap-1.5 text-xs">
                    <Lock
                      aria-hidden
                      className={cn(
                        "h-3.5 w-3.5",
                        CONFIDENCIALIDAD[c.nivel_confidencialidad] ?? "text-muted-foreground",
                      )}
                    />
                    Confidencialidad{" "}
                    <span className="font-medium capitalize">{c.nivel_confidencialidad}</span>
                  </p>

                  {c.riesgos && (
                    <p className="flex items-start gap-1.5 rounded-lg bg-orange-50 p-2 text-xs text-orange-900">
                      <AlertTriangle
                        aria-hidden
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-600"
                      />
                      {c.riesgos}
                    </p>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={cargando}
                    onClick={() => abrirExpediente(c.estudiante_id)}
                  >
                    <FolderOpen aria-hidden />
                    Ver expediente
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <ExpedienteDetalle
        expediente={expediente}
        cuatrimestres={cuatrimestres}
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        puedeEscribir={puedeEscribir}
        locale={locale}
        textosOcr={textosOcr}
      />
    </div>
  );
}

export { NuevoRegistro };
