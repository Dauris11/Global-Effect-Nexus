/**
 * Une el tablero con el diálogo de creación.
 *
 * Existe porque ambos comparten un estado —si el diálogo está abierto y desde
 * qué columna se pidió— y ese estado no puede vivir en el componente de
 * servidor. La carga de datos se queda en `page.tsx`.
 */
"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import type { Proyecto, TareaTablero } from "@/server/operaciones/types";
import { Button } from "@/components/ui/button";
import { Tablero, type TextosTablero } from "./tablero";
import { DialogoNuevaTarea, type TextosNuevaTarea } from "./dialogo-nueva-tarea";

interface Props {
  tareas: TareaTablero[];
  proyectos: Proyecto[];
  asignables: { id: string; nombre: string }[];
  puedeEscribir: boolean;
  locale: string;
  textosTablero: TextosTablero;
  textosDialogo: TextosNuevaTarea;
  etiquetaNueva: string;
}

export function VistaTareas({
  tareas,
  proyectos,
  asignables,
  puedeEscribir,
  locale,
  textosTablero,
  textosDialogo,
  etiquetaNueva,
}: Props) {
  const [abierto, setAbierto] = React.useState(false);

  return (
    <>
      {puedeEscribir && (
        <div className="flex justify-end">
          <Button onClick={() => setAbierto(true)}>
            <Plus />
            {etiquetaNueva}
          </Button>
        </div>
      )}

      <Tablero
        tareas={tareas}
        puedeEscribir={puedeEscribir}
        locale={locale}
        textos={textosTablero}
        onAnadir={() => setAbierto(true)}
      />

      {puedeEscribir && (
        <DialogoNuevaTarea
          abierto={abierto}
          onCambio={setAbierto}
          proyectos={proyectos}
          asignables={asignables}
          textos={textosDialogo}
        />
      )}
    </>
  );
}
