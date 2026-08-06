/**
 * Filtros del historial — búsqueda + cuatrimestre, ambos en la URL.
 *
 * Los cuatrimestres salen del propio historial (`DISTINCT cuatrimestre`), no de
 * la tabla `periodo`: el historial es un registro histórico y puede contener
 * cuatrimestres anteriores a los que la fundación tiene dados de alta. Ofrecer
 * períodos sin datos daría filtros que siempre devuelven vacío.
 */
"use client";

import { useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FiltroHistorial({
  valores,
  cuatrimestres,
  textos,
  rutaLimpiar,
}: {
  valores: { q: string; cuatrimestre: string };
  cuatrimestres: string[];
  textos: {
    buscar: string;
    buscarPlaceholder: string;
    cuatrimestre: string;
    todos: string;
    aplicar: string;
    limpiar: string;
  };
  rutaLimpiar: string;
}) {
  const form = useRef<HTMLFormElement>(null);
  const hayFiltro = Boolean(valores.q || valores.cuatrimestre);

  return (
    <form
      ref={form}
      method="get"
      role="search"
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <Label htmlFor="q">{textos.buscar}</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={valores.q}
            placeholder={textos.buscarPlaceholder}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cuatrimestre">{textos.cuatrimestre}</Label>
        <select
          id="cuatrimestre"
          name="cuatrimestre"
          defaultValue={valores.cuatrimestre}
          onChange={() => form.current?.requestSubmit()}
          className="h-10 w-full rounded-md border border-input bg-surface px-3 tabular-nums text-[15px] tabular-nums focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 sm:w-40"
        >
          <option value="">{textos.todos}</option>
          {cuatrimestres.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" variant="outline" size="lg">
          {textos.aplicar}
        </Button>
        {hayFiltro && (
          <Button type="button" variant="ghost" size="lg" asChild>
            <a href={rutaLimpiar}>{textos.limpiar}</a>
          </Button>
        )}
      </div>
    </form>
  );
}
