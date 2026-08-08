/**
 * Tablero Kanban de tareas — ClickUp S9 · #439–443.
 *
 * Sigue los patrones de Asana:
 * columnas por estado con conteo, tarjeta compacta, arrastrar y soltar, y
 * detalle en panel lateral en vez de modal.
 *
 * Accesibilidad: arrastrar no puede ser la única forma de mover una tarea, así
 * que cada tarjeta lleva además un menú "Mover a" alcanzable por teclado. El
 * cambio se anuncia en una región `aria-live`.
 *
 * El estado se lleva en local y se confirma contra el servidor: la tarjeta se
 * mueve al instante y vuelve a su sitio si la acción falla.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { CalendarDays, Plus, MoreHorizontal, Folder } from "lucide-react";
import { cambiarEstadoTarea } from "@/server/operaciones/actions";
import type { TareaTablero, Asignado } from "@/server/operaciones/types";
import { bandaDePrioridad, bandaDeTarea, paletaDe } from "@/lib/estados";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChipEstado } from "@/components/ui/chip-estado";
import { AvatarGroup } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { PanelTarea } from "./panel-tarea";
import { aFecha } from "@/lib/fechas";

/** Las tres columnas del tablero. `cancelada` no tiene columna (§10). */
const COLUMNAS = ["pendiente", "en_progreso", "completada"] as const;
type Columna = (typeof COLUMNAS)[number];

export interface TextosTablero {
  columnas: Record<Columna, string>;
  prioridad: Record<string, string>;
  estado: Record<string, string>;
  visibilidad: Record<string, string>;
  vacio: string;
  vacioAyuda: string;
  anadir: string;
  moverA: string;
  sinProyecto: string;
  sinAsignar: string;
  vencida: string;
  hoy: string;
  errorMover: string;
  movida: string;
  descripcion: string;
  fechaLimite: string;
  asignados: string;
  proyecto: string;
  cerrar: string;
}

interface TableroProps {
  tareas: TareaTablero[];
  puedeEscribir: boolean;
  locale: string;
  textos: TextosTablero;
  /** Abre el diálogo de creación con la columna ya elegida. */
  onAnadir?: (estado: Columna) => void;
}

export function Tablero({
  tareas,
  puedeEscribir,
  locale,
  textos,
  onAnadir,
}: TableroProps) {
  const router = useRouter();
  const [arrastrando, setArrastrando] = React.useState<string | null>(null);
  const [columnaActiva, setColumnaActiva] = React.useState<Columna | null>(null);
  const [abierta, setAbierta] = React.useState<TareaTablero | null>(null);
  const [aviso, setAviso] = React.useState("");

  /**
   * La tarjeta se mueve al instante y el servidor confirma después. Si la
   * acción falla, React descarta el cambio optimista solo —no hace falta
   * guardar el estado previo para revertirlo a mano— y la tarjeta vuelve a su
   * columna. El servidor sigue siendo la fuente de verdad.
   */
  const [items, moverOptimista] = React.useOptimistic(
    tareas,
    (estado: TareaTablero[], cambio: { id: string; destino: Columna }) =>
      estado.map((t) => (t.id === cambio.id ? { ...t, estado: cambio.destino } : t)),
  );

  const mover = React.useCallback(
    (id: string, destino: Columna) => {
      const tarea = items.find((t) => t.id === id);
      if (!tarea || tarea.estado === destino) return;

      React.startTransition(async () => {
        moverOptimista({ id, destino });
        setAviso(`${tarea.titulo} → ${textos.columnas[destino]}`);
        try {
          await cambiarEstadoTarea({ id, estado: destino });
          router.refresh();
        } catch {
          setAviso(textos.errorMover);
        }
      });
    },
    [items, moverOptimista, router, textos],
  );

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNAS.map((col) => (
          <ColumnaTablero
            key={col}
            columna={col}
            tareas={items.filter((t) => t.estado === col)}
            activa={columnaActiva === col}
            puedeEscribir={puedeEscribir}
            locale={locale}
            textos={textos}
            onSoltar={() => {
              setColumnaActiva(null);
              if (arrastrando) void mover(arrastrando, col);
              setArrastrando(null);
            }}
            onEntrar={() => setColumnaActiva(col)}
            onSalir={() => setColumnaActiva((c) => (c === col ? null : c))}
            onArrastrar={setArrastrando}
            onMover={mover}
            onAbrir={setAbierta}
            onAnadir={onAnadir}
          />
        ))}
      </div>

      {/* Anuncia el movimiento a quien no ve el tablero. */}
      <p aria-live="polite" className="sr-only">
        {aviso}
      </p>

      <PanelTarea
        tarea={abierta}
        abierto={abierta !== null}
        onCerrar={() => setAbierta(null)}
        locale={locale}
        textos={textos}
      />
    </>
  );
}

// ---------------------------------------------------------------------------

interface ColumnaProps {
  columna: Columna;
  tareas: TareaTablero[];
  activa: boolean;
  puedeEscribir: boolean;
  locale: string;
  textos: TextosTablero;
  onSoltar: () => void;
  onEntrar: () => void;
  onSalir: () => void;
  onArrastrar: (id: string | null) => void;
  onMover: (id: string, destino: Columna) => void;
  onAbrir: (t: TareaTablero) => void;
  onAnadir?: (estado: Columna) => void;
}

function ColumnaTablero({
  columna,
  tareas,
  activa,
  puedeEscribir,
  locale,
  textos,
  onSoltar,
  onEntrar,
  onSalir,
  onArrastrar,
  onMover,
  onAbrir,
  onAnadir,
}: ColumnaProps) {
  const [lista] = useAutoAnimate<HTMLDivElement>();
  const estado = bandaDeTarea(columna);

  return (
    <section
      onDragOver={(e) => {
        e.preventDefault(); // sin esto el navegador no permite soltar
        onEntrar();
      }}
      onDragLeave={onSalir}
      onDrop={onSoltar}
      className={cn(
        "flex flex-col rounded-lg bg-surface-sunken p-3 transition-colors duration-150 ease-out",
        activa && "bg-accent",
      )}
    >
      <header className="mb-3 flex items-center gap-2 px-1">
        <span
          aria-hidden
          className={cn("size-2 rounded-full", paletaDe(estado).solido)}
        />
        <h2 className="text-sm font-semibold text-foreground">
          {textos.columnas[columna]}
        </h2>
        <span className="tabular-nums text-xs tabular-nums text-muted-foreground">
          {tareas.length}
        </span>
      </header>

      <div ref={lista} className="flex flex-col gap-2">
        {tareas.map((t) => (
          <TarjetaTarea
            key={t.id}
            tarea={t}
            puedeEscribir={puedeEscribir}
            locale={locale}
            textos={textos}
            onArrastrar={onArrastrar}
            onMover={onMover}
            onAbrir={onAbrir}
          />
        ))}

        {tareas.length === 0 && (
          <p className="px-1 py-6 text-center text-[13px] text-muted-foreground">
            {textos.vacio}
          </p>
        )}
      </div>

      {puedeEscribir && onAnadir && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAnadir(columna)}
          className="mt-2 justify-start text-muted-foreground hover:text-foreground"
        >
          <Plus />
          {textos.anadir}
        </Button>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------

interface TarjetaProps {
  tarea: TareaTablero;
  puedeEscribir: boolean;
  locale: string;
  textos: TextosTablero;
  onArrastrar: (id: string | null) => void;
  onMover: (id: string, destino: Columna) => void;
  onAbrir: (t: TareaTablero) => void;
}

function TarjetaTarea({
  tarea,
  puedeEscribir,
  locale,
  textos,
  onArrastrar,
  onMover,
  onAbrir,
}: TarjetaProps) {
  const [levantada, setLevantada] = React.useState(false);
  const prioridad = bandaDePrioridad(tarea.prioridad);
  const vencimiento = estadoDeVencimiento(tarea.fecha_limite, tarea.estado);

  return (
    <article
      draggable={puedeEscribir}
      onDragStart={() => {
        onArrastrar(tarea.id);
        setLevantada(true);
      }}
      onDragEnd={() => {
        onArrastrar(null);
        setLevantada(false);
      }}
      className={cn(
        "group relative rounded-md border border-border bg-surface p-3 shadow-sm",
        "border-l-[3px]",
        paletaDe(prioridad).riel, // el riel codifica la prioridad (§5)
        "transition-[box-shadow,opacity] duration-150 ease-out",
        puedeEscribir && "cursor-grab active:cursor-grabbing",
        levantada && "opacity-50 shadow-arrastre",
      )}
    >
      <div className="flex items-start gap-2">
        {/* Toda la tarjeta abre el detalle, pero el objetivo real es un botón:
            así funciona con teclado y lo anuncia un lector de pantalla. */}
        <button
          type="button"
          onClick={() => onAbrir(tarea)}
          className={cn(
            "flex-1 text-left text-sm font-medium leading-snug text-foreground",
            "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          {tarea.titulo}
        </button>

        {puedeEscribir && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-1 -mt-1 size-7 shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
              >
                <MoreHorizontal />
                <span className="sr-only">{textos.moverA}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{textos.moverA}</DropdownMenuLabel>
              {COLUMNAS.filter((c) => c !== tarea.estado).map((c) => (
                <DropdownMenuItem key={c} onSelect={() => onMover(tarea.id, c)}>
                  {textos.columnas[c]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {tarea.proyecto_nombre && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Folder className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{tarea.proyecto_nombre}</span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ChipEstado estado={prioridad} punto>
          {textos.prioridad[tarea.prioridad] ?? tarea.prioridad}
        </ChipEstado>

        {tarea.fecha_limite && (
          <span
            className={cn(
              "inline-flex items-center gap-1 tabular-nums text-[11px] tabular-nums",
              vencimiento === "vencida" && "font-semibold text-destructive",
              vencimiento === "hoy" && "font-semibold text-amber-600",
              vencimiento === "futura" && "text-muted-foreground",
            )}
          >
            <CalendarDays className="size-3" aria-hidden />
            {vencimiento === "vencida"
              ? textos.vencida
              : vencimiento === "hoy"
                ? textos.hoy
                : formatearFecha(tarea.fecha_limite, locale)}
          </span>
        )}

        {tarea.asignados.length > 0 && (
          <AvatarGroup
            personas={tarea.asignados.map((a: Asignado) => ({ nombre: a.nombre }))}
            className="ml-auto"
          />
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Utilidades de fecha
// ---------------------------------------------------------------------------

/**
 * Clasifica la fecha límite. Una tarea completada nunca está vencida: pintarla
 * de rojo después de cerrada solo añade ruido.
 */
export function estadoDeVencimiento(
  fecha: string | null,
  estadoTarea: string,
): "vencida" | "hoy" | "futura" | null {
  if (!fecha) return null;
  if (estadoTarea === "completada" || estadoTarea === "cancelada") return "futura";

  const hoy = new Date();
  const clave = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(
    hoy.getDate(),
  ).padStart(2, "0")}`;

  if (fecha < clave) return "vencida";
  if (fecha === clave) return "hoy";
  return "futura";
}

/** Fecha corta en el idioma activo, sin desfase de zona horaria. */
export function formatearFecha(fecha: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" }).format(aFecha(fecha));
}
