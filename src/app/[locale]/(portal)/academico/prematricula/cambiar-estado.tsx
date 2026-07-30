"use client";

import { useTransition } from "react";
import { ChipEstado } from "@/components/ui/chip-estado";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { actualizarEstadoInscripcion } from "@/server/academico/actions";
import type { EstadoDominio } from "@/lib/estados";

const ESTADOS = [
  { clave: "activa", etiqueta: "Activa" },
  { clave: "aprobada", etiqueta: "Aprobada" },
  { clave: "reprobada", etiqueta: "Reprobada" },
  { clave: "retirada", etiqueta: "Retirada" },
] as const;

export function CambiadorEstadoInscripcion({
  id,
  estadoActual,
  banda,
  textosEstado,
  puedeEditar,
}: {
  id: string;
  estadoActual: string;
  banda: EstadoDominio;
  textosEstado: Record<string, string>;
  puedeEditar: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const etiquetaActual = textosEstado[estadoActual] ?? estadoActual;

  if (!puedeEditar) {
    return (
      <ChipEstado estado={banda} punto>
        {etiquetaActual}
      </ChipEstado>
    );
  }

  const cambiar = (nuevoEstado: "activa" | "retirada" | "aprobada" | "reprobada") => {
    if (nuevoEstado === estadoActual) return;
    startTransition(async () => {
      await actualizarEstadoInscripcion({ id, estado: nuevoEstado });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">
        <ChipEstado estado={banda} punto className="cursor-pointer hover:opacity-80 transition-opacity">
          {isPending ? "..." : etiquetaActual}
        </ChipEstado>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ESTADOS.map((e) => (
          <DropdownMenuItem
            key={e.clave}
            disabled={e.clave === estadoActual || isPending}
            onClick={() => cambiar(e.clave)}
            className="cursor-pointer font-mono text-xs"
          >
            {textosEstado[e.clave] ?? e.etiqueta}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
