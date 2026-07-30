/**
 * Filtros del listado de expedientes — ClickUp S5 · buscador.
 *
 * El estado vive en la URL (`?q=`, `?tipo=`, `?estado=`), no en estado de
 * cliente, por las mismas razones que el mes del calendario: el resultado es
 * compartible ("mándame el enlace de los becados en standby") y la pantalla
 * sigue funcionando sin JavaScript, porque por debajo es un `<form method="get">`.
 *
 * La mejora progresiva es solo eso: con JS, cambiar un desplegable envía el
 * formulario solo; sin JS, está el botón de siempre.
 */
"use client";

import { useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface TextosFiltros {
  buscar: string;
  buscarPlaceholder: string;
  tipo: string;
  estado: string;
  todos: string;
  aplicar: string;
  limpiar: string;
  tipos: Record<string, string>;
  estados: Record<string, string>;
}

export function FiltrosExpedientes({
  valores,
  textos,
  tipos,
  estados,
  rutaLimpiar,
}: {
  valores: { q: string; tipo: string; estado: string };
  textos: TextosFiltros;
  tipos: readonly string[];
  estados: readonly string[];
  rutaLimpiar: string;
}) {
  const form = useRef<HTMLFormElement>(null);

  // Con JS, cambiar un desplegable aplica el filtro sin pulsar nada más.
  const enviar = () => form.current?.requestSubmit();

  const hayFiltro = Boolean(valores.q || valores.tipo || valores.estado);

  return (
    <form
      ref={form}
      method="get"
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      role="search"
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
        <Label htmlFor="tipo">{textos.tipo}</Label>
        <select
          id="tipo"
          name="tipo"
          defaultValue={valores.tipo}
          onChange={enviar}
          className="h-10 w-full rounded-md border border-input bg-surface px-3 text-[15px] focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 sm:w-40"
        >
          <option value="">{textos.todos}</option>
          {tipos.map((v) => (
            <option key={v} value={v}>
              {textos.tipos[v] ?? v}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="estado">{textos.estado}</Label>
        <select
          id="estado"
          name="estado"
          defaultValue={valores.estado}
          onChange={enviar}
          className="h-10 w-full rounded-md border border-input bg-surface px-3 text-[15px] focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 sm:w-48"
        >
          <option value="">{textos.todos}</option>
          {estados.map((v) => (
            <option key={v} value={v}>
              {textos.estados[v] ?? v}
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
