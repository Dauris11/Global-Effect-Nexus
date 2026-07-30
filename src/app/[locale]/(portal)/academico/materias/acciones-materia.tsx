/**
 * Acciones de una fila de Materias — ClickUp S6 · #383.
 *
 * Existe porque el menú, el diálogo de edición y el de borrado comparten un
 * estado ("¿cuál de los dos está abierto?") y la página que los pinta es un
 * componente de servidor, que no puede tenerlo. Es la frontera cliente mínima:
 * la tabla sigue renderizándose en el servidor y solo esta celda es interactiva.
 */
"use client";

import * as React from "react";
import { eliminarMateria } from "@/server/academico/actions";
import type { Materia } from "@/server/academico/types";
import {
  DialogoEliminar,
  MenuAcciones,
  type TextosAcciones,
} from "../acciones-registro";
import type { DocenteOpcion } from "../selector-docente";
import { DialogoMateria, type TextosNuevaMateria } from "./dialogo-nueva-materia";

export function AccionesMateria({
  materia,
  textos,
  textosAcciones,
  periodos,
  docentes,
}: {
  materia: Materia;
  textos: TextosNuevaMateria;
  textosAcciones: TextosAcciones;
  periodos: { id: string; nombre: string }[];
  docentes: DocenteOpcion[];
}) {
  const [editando, setEditando] = React.useState(false);
  const [borrando, setBorrando] = React.useState(false);

  return (
    <>
      <MenuAcciones
        textos={textosAcciones}
        onEditar={() => setEditando(true)}
        onEliminar={() => setBorrando(true)}
      />
      <DialogoMateria
        abierto={editando}
        onCambio={setEditando}
        textos={textos}
        periodos={periodos}
        docentes={docentes}
        registro={materia}
      />
      <DialogoEliminar
        abierto={borrando}
        onCambio={setBorrando}
        nombre={materia.nombre}
        textos={textosAcciones}
        alEliminar={() => eliminarMateria({ id: materia.id })}
      />
    </>
  );
}
