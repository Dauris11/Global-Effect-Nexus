/**
 * Acciones de una tarjeta de Períodos — ClickUp S6 · #394.
 *
 * Es la pieza que convierte la pantalla en "gestión" y no en un listado: sin
 * ella un cuatrimestre se quedaba con el estado que se eligió al crearlo, y no
 * había forma de activarlo ni de cerrarlo.
 */
"use client";

import * as React from "react";
import { eliminarPeriodo } from "@/server/academico/actions";
import type { Periodo } from "@/server/academico/types";
import {
  DialogoEliminar,
  MenuAcciones,
  type TextosAcciones,
} from "../acciones-registro";
import { DialogoPeriodo, type TextosNuevoPeriodo } from "./dialogo-nuevo-periodo";

export function AccionesPeriodo({
  periodo,
  textos,
  textosAcciones,
}: {
  periodo: Periodo;
  textos: TextosNuevoPeriodo;
  textosAcciones: TextosAcciones;
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
      <DialogoPeriodo
        abierto={editando}
        onCambio={setEditando}
        textos={textos}
        registro={periodo}
      />
      <DialogoEliminar
        abierto={borrando}
        onCambio={setBorrando}
        nombre={periodo.nombre}
        textos={textosAcciones}
        alEliminar={() => eliminarPeriodo({ id: periodo.id })}
      />
    </>
  );
}
