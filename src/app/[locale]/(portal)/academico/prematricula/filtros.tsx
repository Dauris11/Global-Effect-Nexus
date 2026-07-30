/**
 * Filtros de la prematrícula — búsqueda + período, ambos en la URL.
 *
 * No reutiliza el `Buscador` compartido porque aquí hay dos controles y el
 * desplegable de período se aplica solo al cambiarlo (mejora progresiva); sin
 * JavaScript sigue siendo un `<form method="get">` con su botón.
 */
"use client";

import { useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FiltroPrematricula({
  valores,
  periodos,
  textos,
  rutaLimpiar,
}: {
  valores: { q: string; periodo: string };
  periodos: { id: string; nombre: string }[];
  textos: {
    buscar: string;
    buscarPlaceholder: string;
    periodo: string;
    todos: string;
    aplicar: string;
    limpiar: string;
  };
  rutaLimpiar: string;
}) {
  const form = useRef<HTMLFormElement>(null);
  const hayFiltro = Boolean(valores.q || valores.periodo);

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
        <Label htmlFor="periodo">{textos.periodo}</Label>
        <select
          id="periodo"
          name="periodo"
          defaultValue={valores.periodo}
          onChange={() => form.current?.requestSubmit()}
          className="h-10 w-full rounded-md border border-input bg-surface px-3 text-[15px] focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 sm:w-48"
        >
          <option value="">{textos.todos}</option>
          {periodos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
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
