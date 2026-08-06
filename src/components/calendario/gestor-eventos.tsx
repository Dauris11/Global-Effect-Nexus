/**
 * GestorEventos — calendario del sistema: mes · semana · día · lista.
 *
 * Adaptación del `event-manager` de 21st.dev. Se conservó la idea —cuatro
 * vistas, buscador, filtros y arrastrar para mover— y se rehízo lo que no
 * encajaba con este proyecto:
 *
 * - **El servidor es la fuente de verdad.** El original guardaba los eventos en
 *   un `useState(initialEvents)` que nunca se resincronizaba con sus props: tras
 *   un `router.refresh()` la vista seguía mostrando los datos viejos, y lo
 *   creado se perdía al recargar. Aquí las entradas llegan por props desde la
 *   base de datos y el movimiento se confirma con una Server Action.
 * - **Colores de la capa 3, no `bg-blue-500`.** El original traía su propia
 *   paleta de seis colores de Tailwind. En este sistema el color de una fila
 *   *significa* algo —prioridad de la tarea, estado del evento— y sale de
 *   `lib/estados.ts`. Un selector de
 *   color por evento rompería precisamente eso.
 * - **Nada de texto fijo.** Todos los rótulos entran traducidos por `textos`.
 * - **Semana de lunes a domingo** y calculada bien: el original hacía
 *   `startOfWeek.setDate(currentDate.getDay())`, que asigna el día del mes con
 *   el índice del día de la semana (el lunes 20 se convertía en el día 1).
 * - **`key` en el bucle de la vista semanal.** El original devolvía fragmentos
 *   sin clave dentro de un `.map()`.
 * - **Horario de 7:00 a 20:00,** no 24 filas. La Fundación no opera de noche y
 *   168 celdas vacías por semana solo añaden desplazamiento.
 * - **Sin `Math.random()` para los identificadores:** los ids son de la base.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  Columns3,
  List as ListIcon,
  MapPin,
  Folder,
  Search,
  X,
} from "lucide-react";
import type { EntradaAgenda } from "@/server/operaciones/types";
import { moverEntradaDeCalendario } from "@/server/operaciones/actions";
import { paletaDe } from "@/lib/estados";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChipEstado } from "@/components/ui/chip-estado";
import { bandaDeEntrada } from "./banda";

export type VistaCalendario = "mes" | "semana" | "dia" | "lista";

/** Franja horaria que se dibuja en las vistas de semana y día. */
const HORA_INICIO = 7;
const HORA_FIN = 20;

export interface TextosGestor {
  vista: Record<VistaCalendario, string>;
  hoy: string;
  manana: string;
  anterior: string;
  siguiente: string;
  buscar: string;
  limpiar: string;
  dias: string[];
  todoElDia: string;
  vencida: string;
  sinResultados: string;
  sinResultadosAyuda: string;
  diaVacio: string;
  origen: Record<"evento" | "tarea", string>;
  filtrarOrigen: string;
  prioridad: Record<string, string>;
  tipoEvento: Record<string, string>;
  /** Plantilla con `{n}`. */
  masEntradas: string;
  errorMover: string;
  movida: string;
}

// ---------------------------------------------------------------------------
// Utilidades de fecha. Todo con cadenas `YYYY-MM-DD`: la base guarda días sin
// hora y convertirlos a `Date` mete la zona horaria en la ecuación.
// ---------------------------------------------------------------------------

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

/** `YYYY-MM-DD` → `Date` local a mediodía (inmune a saltos de horario). */
const aFecha = (s: string) => {
  const [a, m, d] = s.split("-").map(Number);
  return new Date(a, m - 1, d, 12);
};

const sumarDias = (s: string, n: number) => {
  const d = aFecha(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};

/** Lunes de la semana que contiene `s`. */
const lunesDe = (s: string) => {
  const d = aFecha(s);
  const desplazamiento = (d.getDay() + 6) % 7; // domingo (0) → 6
  d.setDate(d.getDate() - desplazamiento);
  return iso(d);
};

/** Hora de una entrada, o `null` si es de todo el día. */
const horaDe = (e: EntradaAgenda) =>
  e.hora_inicio ? Number(e.hora_inicio.slice(0, 2)) : null;

// ---------------------------------------------------------------------------

export function GestorEventos({
  entradas,
  locale,
  textos,
  puedeEscribir,
  vistaInicial = "mes",
  /** Día de referencia (`YYYY-MM-DD`). Lo fija el servidor. */
  hoy,
  /** Acción del botón principal, p. ej. abrir el diálogo de nuevo evento. */
  acciones,
}: {
  entradas: EntradaAgenda[];
  locale: string;
  textos: TextosGestor;
  puedeEscribir: boolean;
  vistaInicial?: VistaCalendario;
  hoy: string;
  acciones?: React.ReactNode;
}) {
  const router = useRouter();
  const [vista, setVista] = React.useState<VistaCalendario>(vistaInicial);
  const [ancla, setAncla] = React.useState(hoy);
  const [busqueda, setBusqueda] = React.useState("");
  const [origenes, setOrigenes] = React.useState<Set<"evento" | "tarea">>(new Set());
  const [arrastrada, setArrastrada] = React.useState<EntradaAgenda | null>(null);
  const [diaDestino, setDiaDestino] = React.useState<string | null>(null);
  const [aviso, setAviso] = React.useState("");

  /**
   * Movimiento optimista: la entrada salta al día nuevo y el servidor confirma.
   * Si falla, React descarta el cambio y la entrada vuelve a su sitio sola.
   */
  const [items, moverOptimista] = React.useOptimistic(
    entradas,
    (estado: EntradaAgenda[], cambio: { id: string; fecha: string }) =>
      estado.map((e) => (e.id === cambio.id ? { ...e, fecha: cambio.fecha } : e)),
  );

  const filtradas = React.useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return items.filter((e) => {
      if (origenes.size > 0 && !origenes.has(e.origen)) return false;
      if (!q) return true;
      return (
        e.titulo.toLowerCase().includes(q) ||
        (e.ubicacion ?? "").toLowerCase().includes(q) ||
        (e.proyecto_nombre ?? "").toLowerCase().includes(q) ||
        e.categoria.toLowerCase().includes(q)
      );
    });
  }, [items, busqueda, origenes]);

  /** Índice día → entradas, para no recorrer la lista completa por celda. */
  const porDia = React.useMemo(() => {
    const mapa = new Map<string, EntradaAgenda[]>();
    for (const e of filtradas) {
      const lista = mapa.get(e.fecha);
      if (lista) lista.push(e);
      else mapa.set(e.fecha, [e]);
    }
    return mapa;
  }, [filtradas]);

  const mover = React.useCallback(
    (entrada: EntradaAgenda, fecha: string) => {
      if (!puedeEscribir || entrada.fecha === fecha) return;
      React.startTransition(async () => {
        moverOptimista({ id: entrada.id, fecha });
        setAviso(`${entrada.titulo} → ${fecha}`);
        try {
          await moverEntradaDeCalendario({
            id: entrada.id,
            origen: entrada.origen,
            fecha,
          });
          router.refresh();
        } catch {
          setAviso(textos.errorMover);
        }
      });
    },
    [puedeEscribir, moverOptimista, router, textos.errorMover],
  );

  const navegar = (direccion: -1 | 1) => {
    if (vista === "mes") {
      const d = aFecha(ancla);
      d.setMonth(d.getMonth() + direccion, 1);
      setAncla(iso(d));
    } else if (vista === "semana") {
      setAncla(sumarDias(ancla, 7 * direccion));
    } else {
      setAncla(sumarDias(ancla, direccion));
    }
  };

  const filtrosActivos = origenes.size > 0 || busqueda.trim() !== "";

  const rotulo = (() => {
    const f = aFecha(ancla);
    if (vista === "mes")
      return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(f);
    if (vista === "semana") {
      const l = aFecha(lunesDe(ancla));
      const d = aFecha(sumarDias(lunesDe(ancla), 6));
      const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
      return `${fmt.format(l)} – ${fmt.format(d)}`;
    }
    if (vista === "dia")
      return new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(f);
    return textos.vista.lista;
  })();

  const propsCelda = (fecha: string) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!arrastrada) return;
      e.preventDefault(); // sin esto el navegador no permite soltar
      setDiaDestino(fecha);
    },
    onDragLeave: () => setDiaDestino((d) => (d === fecha ? null : d)),
    onDrop: () => {
      if (arrastrada) mover(arrastrada, fecha);
      setArrastrada(null);
      setDiaDestino(null);
    },
    "data-destino": diaDestino === fecha ? "" : undefined,
  });

  const comun = {
    textos,
    locale,
    hoy,
    puedeEscribir,
    onArrastrar: setArrastrada,
    propsCelda,
  };

  return (
    <div className="space-y-4">
      {/* Barra de control: rótulo + navegación · vistas · acción principal */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-lg font-semibold capitalize text-foreground">
            {rotulo}
          </h2>
          {vista !== "lista" && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navegar(-1)}
                aria-label={textos.anterior}
              >
                <span aria-hidden>‹</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAncla(hoy)}>
                {textos.hoy}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navegar(1)}
                aria-label={textos.siguiente}
              >
                <span aria-hidden>›</span>
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label={textos.vista.mes}
            className="flex items-center gap-0.5 rounded-lg border border-border bg-surface-sunken p-0.5"
          >
            {(
              [
                ["mes", CalendarDays],
                ["semana", Columns3],
                ["dia", Clock],
                ["lista", ListIcon],
              ] as const
            ).map(([v, Icono]) => (
              <button
                key={v}
                role="tab"
                aria-selected={vista === v}
                onClick={() => setVista(v)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
                  "transition-colors duration-150 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  vista === v
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icono className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">{textos.vista[v]}</span>
              </button>
            ))}
          </div>
          {acciones}
        </div>
      </div>

      {/* Buscador y filtro por origen */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={textos.buscar}
            aria-label={textos.buscar}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="sr-only">{textos.filtrarOrigen}</span>
          {(["evento", "tarea"] as const).map((o) => {
            const activo = origenes.has(o);
            return (
              <button
                key={o}
                type="button"
                aria-pressed={activo}
                onClick={() =>
                  setOrigenes((prev) => {
                    const s = new Set(prev);
                    if (s.has(o)) s.delete(o);
                    else s.add(o);
                    return s;
                  })
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium",
                  "transition-colors duration-150 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  activo
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {textos.origen[o]}
              </button>
            );
          })}
          {filtrosActivos && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setBusqueda("");
                setOrigenes(new Set());
              }}
            >
              <X aria-hidden />
              {textos.limpiar}
            </Button>
          )}
        </div>
      </div>

      {vista === "mes" && <VistaMes {...comun} ancla={ancla} porDia={porDia} />}
      {vista === "semana" && <VistaSemana {...comun} ancla={ancla} porDia={porDia} />}
      {vista === "dia" && <VistaDia {...comun} ancla={ancla} porDia={porDia} />}
      {vista === "lista" && <VistaLista {...comun} entradas={filtradas} />}

      {/* Anuncia el movimiento a quien no ve el calendario. */}
      <p aria-live="polite" className="sr-only">
        {aviso}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Piezas compartidas
// ---------------------------------------------------------------------------

interface PropsComunes {
  textos: TextosGestor;
  locale: string;
  hoy: string;
  puedeEscribir: boolean;
  onArrastrar: (e: EntradaAgenda | null) => void;
  propsCelda: (fecha: string) => Record<string, unknown>;
}

/** ¿Es una tarea abierta cuya fecha límite ya pasó? */
const estaVencida = (e: EntradaAgenda, hoy: string) =>
  e.origen === "tarea" && e.estado !== "completada" && e.fecha < hoy;

/** Píldora compacta de una entrada, para las celdas de mes y semana. */
function Pildora({
  entrada,
  textos,
  hoy,
  puedeEscribir,
  onArrastrar,
}: {
  entrada: EntradaAgenda;
  textos: TextosGestor;
  hoy: string;
  puedeEscribir: boolean;
  onArrastrar: (e: EntradaAgenda | null) => void;
}) {
  const banda = bandaDeEntrada(entrada);
  const p = paletaDe(banda);
  const vencida = estaVencida(entrada, hoy);

  return (
    <div
      draggable={puedeEscribir}
      onDragStart={() => onArrastrar(entrada)}
      onDragEnd={() => onArrastrar(null)}
      title={entrada.titulo}
      className={cn(
        "flex items-center gap-1 rounded-sm border-l-2 px-1.5 py-0.5 text-[11px] font-medium",
        p.fondo,
        p.texto,
        p.riel.replace("border-l-", "border-l-"),
        puedeEscribir && "cursor-grab active:cursor-grabbing",
      )}
    >
      {entrada.hora_inicio && (
        <span className="shrink-0 tabular-nums tabular-nums opacity-70">
          {entrada.hora_inicio.slice(0, 5)}
        </span>
      )}
      <span className="truncate">{entrada.titulo}</span>
      {vencida && <span className="sr-only">{textos.vencida}</span>}
    </div>
  );
}

/** Fila completa de una entrada, para la vista de día y la de lista. */
function Fila({
  entrada,
  textos,
  hoy,
  puedeEscribir,
  onArrastrar,
}: {
  entrada: EntradaAgenda;
  textos: TextosGestor;
  hoy: string;
  puedeEscribir: boolean;
  onArrastrar: (e: EntradaAgenda | null) => void;
}) {
  const banda = bandaDeEntrada(entrada);
  const vencida = estaVencida(entrada, hoy);
  const esTarea = entrada.origen === "tarea";
  const etiqueta = esTarea
    ? (textos.prioridad[entrada.categoria] ?? entrada.categoria)
    : (textos.tipoEvento[entrada.categoria] ?? entrada.categoria);

  return (
    <article
      draggable={puedeEscribir}
      onDragStart={() => onArrastrar(entrada)}
      onDragEnd={() => onArrastrar(null)}
      className={cn(
        "rounded-md border border-border border-l-[3px] bg-surface p-3",
        paletaDe(banda).riel,
        puedeEscribir && "cursor-grab active:cursor-grabbing",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-foreground">
            {entrada.titulo}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 tabular-nums text-xs tabular-nums">
              <Clock className="size-3" aria-hidden />
              {entrada.hora_inicio?.slice(0, 5) ?? textos.todoElDia}
            </span>
            {entrada.ubicacion && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" aria-hidden />
                {entrada.ubicacion}
              </span>
            )}
            {entrada.proyecto_nombre && (
              <span className="inline-flex items-center gap-1">
                <Folder className="size-3" aria-hidden />
                {entrada.proyecto_nombre}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <ChipEstado estado={banda} punto>
            {etiqueta}
          </ChipEstado>
          {vencida && (
            <span className="tabular-nums text-[11px] font-semibold uppercase text-destructive">
              {textos.vencida}
            </span>
          )}
        </div>
      </div>
      <span className="sr-only">{textos.origen[entrada.origen]}</span>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Vista de mes
// ---------------------------------------------------------------------------

function VistaMes({
  ancla,
  porDia,
  textos,
  locale,
  hoy,
  puedeEscribir,
  onArrastrar,
  propsCelda,
}: PropsComunes & { ancla: string; porDia: Map<string, EntradaAgenda[]> }) {
  const mes = ancla.slice(0, 7);
  const [anio, m] = mes.split("-").map(Number);
  const total = new Date(anio, m, 0).getDate();
  const huecos = (new Date(anio, m - 1, 1).getDay() + 6) % 7;
  const MAX = 3;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-7 gap-px bg-border">
        {textos.dias.map((d) => (
          <div
            key={d}
            className="bg-surface-sunken px-2 py-2 text-center tabular-nums text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
          >
            <span aria-hidden>{d.slice(0, 3)}</span>
            <span className="sr-only">{d}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-border">
        {Array.from({ length: huecos }, (_, i) => (
          <div key={`h-${i}`} className="min-h-28 bg-surface-sunken" aria-hidden />
        ))}

        {Array.from({ length: total }, (_, i) => {
          const fecha = `${mes}-${String(i + 1).padStart(2, "0")}`;
          const lista = porDia.get(fecha) ?? [];
          const esHoy = fecha === hoy;

          return (
            <div
              key={fecha}
              {...propsCelda(fecha)}
              className={cn(
                "flex min-h-28 flex-col gap-1 bg-surface p-1.5",
                "transition-colors duration-150 ease-out",
                "data-[destino]:bg-accent",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full tabular-nums text-xs tabular-nums",
                  esHoy
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {i + 1}
                {esHoy && <span className="sr-only"> ({textos.hoy})</span>}
              </span>

              <div className="flex min-w-0 flex-col gap-1">
                {lista.slice(0, MAX).map((e) => (
                  <Pildora
                    key={`${e.origen}-${e.id}`}
                    entrada={e}
                    textos={textos}
                    hoy={hoy}
                    puedeEscribir={puedeEscribir}
                    onArrastrar={onArrastrar}
                  />
                ))}
                {lista.length > MAX && (
                  <span className="px-1 tabular-nums text-[10px] tabular-nums text-muted-foreground">
                    {textos.masEntradas.replace("{n}", String(lista.length - MAX))}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="sr-only">{locale}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vista de semana
// ---------------------------------------------------------------------------

function VistaSemana({
  ancla,
  porDia,
  textos,
  locale,
  hoy,
  puedeEscribir,
  onArrastrar,
  propsCelda,
}: PropsComunes & { ancla: string; porDia: Map<string, EntradaAgenda[]> }) {
  const lunes = lunesDe(ancla);
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
  const horas = Array.from({ length: HORA_FIN - HORA_INICIO + 1 }, (_, i) => HORA_INICIO + i);
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric" });

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <div className="min-w-[46rem]">
        {/* Cabecera de días */}
        <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] gap-px bg-border">
          <div className="bg-surface-sunken" />
          {dias.map((f) => (
            <div
              key={f}
              className={cn(
                "bg-surface-sunken px-2 py-2 text-center text-[11px] font-medium capitalize",
                f === hoy ? "text-primary" : "text-muted-foreground",
              )}
            >
              {fmt.format(aFecha(f))}
            </div>
          ))}
        </div>

        {/* Franja de todo el día: lo que no tiene hora no cabe en la retícula */}
        <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] gap-px bg-border">
          <div className="flex items-center justify-end bg-surface-sunken px-1.5 py-2 text-right tabular-nums text-[10px] uppercase text-muted-foreground">
            {textos.todoElDia}
          </div>
          {dias.map((f) => (
            <div
              key={f}
              {...propsCelda(f)}
              className="flex min-h-12 flex-col gap-1 bg-surface p-1 data-[destino]:bg-accent"
            >
              {(porDia.get(f) ?? [])
                .filter((e) => horaDe(e) === null)
                .map((e) => (
                  <Pildora
                    key={`${e.origen}-${e.id}`}
                    entrada={e}
                    textos={textos}
                    hoy={hoy}
                    puedeEscribir={puedeEscribir}
                    onArrastrar={onArrastrar}
                  />
                ))}
            </div>
          ))}
        </div>

        {/* Retícula horaria */}
        {horas.map((h) => (
          <div
            key={h}
            className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] gap-px bg-border"
          >
            <div className="bg-surface-sunken px-1.5 py-1 text-right tabular-nums text-[10px] tabular-nums text-muted-foreground">
              {String(h).padStart(2, "0")}:00
            </div>
            {dias.map((f) => (
              <div
                key={`${f}-${h}`}
                {...propsCelda(f)}
                className="flex min-h-11 flex-col gap-1 bg-surface p-1 data-[destino]:bg-accent"
              >
                {(porDia.get(f) ?? [])
                  .filter((e) => horaDe(e) === h)
                  .map((e) => (
                    <Pildora
                      key={`${e.origen}-${e.id}`}
                      entrada={e}
                      textos={textos}
                      hoy={hoy}
                      puedeEscribir={puedeEscribir}
                      onArrastrar={onArrastrar}
                    />
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vista de día
// ---------------------------------------------------------------------------

function VistaDia({
  ancla,
  porDia,
  textos,
  hoy,
  puedeEscribir,
  onArrastrar,
}: PropsComunes & { ancla: string; porDia: Map<string, EntradaAgenda[]> }) {
  const lista = porDia.get(ancla) ?? [];
  const horas = Array.from({ length: HORA_FIN - HORA_INICIO + 1 }, (_, i) => HORA_INICIO + i);
  const sinHora = lista.filter((e) => horaDe(e) === null);

  if (lista.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        {textos.diaVacio}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sinHora.length > 0 && (
        <section className="space-y-2">
          <h3 className="tabular-nums text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {textos.todoElDia}
          </h3>
          {sinHora.map((e) => (
            <Fila
              key={`${e.origen}-${e.id}`}
              entrada={e}
              textos={textos}
              hoy={hoy}
              puedeEscribir={puedeEscribir}
              onArrastrar={onArrastrar}
            />
          ))}
        </section>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        {horas.map((h) => {
          const deLaHora = lista.filter((e) => horaDe(e) === h);
          return (
            <div key={h} className="flex border-b border-border last:border-b-0">
              <div className="w-16 shrink-0 border-r border-border p-2 text-right tabular-nums text-[11px] tabular-nums text-muted-foreground">
                {String(h).padStart(2, "0")}:00
              </div>
              <div className="flex-1 space-y-2 p-2">
                {deLaHora.map((e) => (
                  <Fila
                    key={`${e.origen}-${e.id}`}
                    entrada={e}
                    textos={textos}
                    hoy={hoy}
                    puedeEscribir={puedeEscribir}
                    onArrastrar={onArrastrar}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vista de lista
// ---------------------------------------------------------------------------

function VistaLista({
  entradas,
  textos,
  locale,
  hoy,
  puedeEscribir,
  onArrastrar,
}: PropsComunes & { entradas: EntradaAgenda[] }) {
  if (entradas.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-12 text-center">
        <p className="font-medium text-foreground">{textos.sinResultados}</p>
        <p className="mt-1 text-sm text-muted-foreground">{textos.sinResultadosAyuda}</p>
      </div>
    );
  }

  // Agrupación por día conservando el orden cronológico de la consulta.
  const grupos: { fecha: string; entradas: EntradaAgenda[] }[] = [];
  for (const e of [...entradas].sort((a, b) =>
    a.fecha === b.fecha
      ? (a.hora_inicio ?? "").localeCompare(b.hora_inicio ?? "")
      : a.fecha.localeCompare(b.fecha),
  )) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.fecha === e.fecha) ultimo.entradas.push(e);
    else grupos.push({ fecha: e.fecha, entradas: [e] });
  }

  const manana = sumarDias(hoy, 1);
  const fmt = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="space-y-6">
      {grupos.map((g) => (
        <section key={g.fecha} className="space-y-2">
          <h3 className="flex items-baseline gap-2">
            <span className="tabular-nums text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {g.fecha === hoy
                ? textos.hoy
                : g.fecha === manana
                  ? textos.manana
                  : fmt.format(aFecha(g.fecha))}
            </span>
            <span className="tabular-nums text-[11px] tabular-nums text-muted-foreground/70">
              {g.entradas.length}
            </span>
          </h3>
          <div className="space-y-2">
            {g.entradas.map((e) => (
              <Fila
                key={`${e.origen}-${e.id}`}
                entrada={e}
                textos={textos}
                hoy={hoy}
                puedeEscribir={puedeEscribir}
                onArrastrar={onArrastrar}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
