/**
 * Buscador del módulo Académico — ClickUp S6.
 *
 * Un `<form method="get">` y nada más: el término vive en la URL (`?q=`), así
 * que el resultado es compartible y la pantalla funciona sin JavaScript. Mismo
 * criterio que los filtros de expedientes y que el mes del calendario.
 *
 * Se comparte entre materias y cursos porque las dos pantallas buscan igual;
 * lo único que cambia es el texto de ayuda.
 */
"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Buscador({
  valor,
  textos,
  rutaLimpiar,
}: {
  valor: string;
  textos: {
    etiqueta: string;
    placeholder: string;
    aplicar: string;
    limpiar: string;
  };
  rutaLimpiar: string;
}) {
  return (
    <form method="get" role="search" className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1 space-y-2">
        <Label htmlFor="q">{textos.etiqueta}</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={valor}
            placeholder={textos.placeholder}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" variant="outline" size="lg">
          {textos.aplicar}
        </Button>
        {valor && (
          <Button type="button" variant="ghost" size="lg" asChild>
            <a href={rutaLimpiar}>{textos.limpiar}</a>
          </Button>
        )}
      </div>
    </form>
  );
}
