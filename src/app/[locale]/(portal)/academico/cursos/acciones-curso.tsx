/**
 * Acciones de una tarjeta de Cursos — ClickUp S6 · #384.
 *
 * Misma frontera cliente mínima que en Materias: la rejilla de tarjetas se
 * sigue pintando en el servidor y solo el menú de cada una es interactivo.
 */
"use client";

import * as React from "react";
import { eliminarCurso } from "@/server/academico/actions";
import type { Curso } from "@/server/academico/types";
import {
  DialogoEliminar,
  MenuAcciones,
  type TextosAcciones,
} from "../acciones-registro";
import type { DocenteOpcion } from "../selector-docente";
import { DialogoCurso, type TextosNuevoCurso } from "./dialogo-nuevo-curso";

export function AccionesCurso({
  curso,
  textos,
  textosAcciones,
  periodos,
  docentes,
}: {
  curso: Curso;
  textos: TextosNuevoCurso;
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
      <DialogoCurso
        abierto={editando}
        onCambio={setEditando}
        textos={textos}
        periodos={periodos}
        docentes={docentes}
        registro={curso}
      />
      <DialogoEliminar
        abierto={borrando}
        onCambio={setBorrando}
        nombre={curso.nombre}
        textos={textosAcciones}
        alEliminar={() => eliminarCurso({ id: curso.id })}
      />
    </>
  );
}
