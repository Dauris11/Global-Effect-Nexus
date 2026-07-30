/**
 * Selector de docente, compartido por Materias y Cursos — ClickUp S6 · #400.
 *
 * Existe porque quien imparte algo puede ser dos cosas distintas y las dos son
 * legítimas: **un usuario del sistema** —y entonces ese curso tiene que
 * aparecerle en su Portal Profesor— o **alguien de fuera**, un tallerista
 * invitado que nunca va a iniciar sesión y del que solo se guarda el nombre.
 *
 * Un campo de texto libre no distingue las dos: escribir "Juan Pérez" no le
 * asigna el curso a nadie, y un desplegable cerrado no deja registrar al
 * tallerista. De ahí las tres opciones —sin asignar · alguien del sistema ·
 * externo— y el campo de nombre que solo aparece en el tercer caso.
 *
 * Es controlado a propósito: el diálogo que lo usa ya guarda todo su estado y
 * lo limpia al cerrarse, y un estado interno aquí sobreviviría a esa limpieza.
 *
 * Ver la migración 0019 para el porqué de guardar las dos cosas.
 */
"use client";

import * as React from "react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Centinelas: Radix Select reserva `""` para limpiar la selección. */
export const DOCENTE_SIN = "__sin_docente__";
export const DOCENTE_EXTERNO = "__docente_externo__";

export interface TextosSelectorDocente {
  etiqueta: string;
  sinAsignar: string;
  externo: string;
  nombreExterno: string;
  ayudaExterno: string;
}

export interface DocenteOpcion {
  id: string;
  nombre: string;
}

/**
 * Traduce la selección del formulario a lo que espera la Server Action.
 *
 * El nombre visible se copia del usuario elegido en vez de dejarlo vacío: la
 * tarjeta del curso imprime `docente`, y si solo se guardara el id, un curso
 * con docente asignado aparecería sin docente en el listado.
 */
export function resolverDocente(
  seleccion: string,
  nombreExterno: string,
  docentes: DocenteOpcion[],
): { usuarioId?: string; nombre?: string } {
  if (seleccion === DOCENTE_SIN) return {};
  if (seleccion === DOCENTE_EXTERNO) {
    return { nombre: nombreExterno.trim() || undefined };
  }
  return {
    usuarioId: seleccion,
    nombre: docentes.find((d) => d.id === seleccion)?.nombre,
  };
}

/**
 * El estado inicial del selector al abrir un registro para editarlo.
 *
 * El orden importa. Se mira primero la FK y solo después el texto, porque es el
 * mismo orden en que manda el dato (ver migración 0019). Y se comprueba que el
 * usuario siga en la lista: si el docente enlazado se dio de baja, el
 * desplegable no tendría esa opción y el `<Select>` quedaría en blanco — en ese
 * caso se cae al nombre en texto, que es justo para lo que se conservó.
 */
export function seleccionInicial(
  usuarioId: string | null,
  nombre: string | null,
  docentes: DocenteOpcion[],
): { seleccion: string; nombreExterno: string } {
  if (usuarioId && docentes.some((d) => d.id === usuarioId)) {
    return { seleccion: usuarioId, nombreExterno: "" };
  }
  if (nombre?.trim()) return { seleccion: DOCENTE_EXTERNO, nombreExterno: nombre };
  return { seleccion: DOCENTE_SIN, nombreExterno: "" };
}

export function SelectorDocente({
  docentes,
  textos,
  seleccion,
  onSeleccion,
  nombreExterno,
  onNombreExterno,
}: {
  docentes: DocenteOpcion[];
  textos: TextosSelectorDocente;
  seleccion: string;
  onSeleccion: (v: string) => void;
  nombreExterno: string;
  onNombreExterno: (v: string) => void;
}) {
  return (
    <>
      <Field label={textos.etiqueta}>
        {(p) => (
          <Select value={seleccion} onValueChange={onSeleccion}>
            <SelectTrigger id={p.id}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DOCENTE_SIN}>{textos.sinAsignar}</SelectItem>
              {docentes.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.nombre}
                </SelectItem>
              ))}
              <SelectItem value={DOCENTE_EXTERNO}>{textos.externo}</SelectItem>
            </SelectContent>
          </Select>
        )}
      </Field>

      {seleccion === DOCENTE_EXTERNO && (
        <Field label={textos.nombreExterno} ayuda={textos.ayudaExterno}>
          {(p) => (
            <Input
              {...p}
              value={nombreExterno}
              onChange={(e) => onNombreExterno(e.target.value)}
            />
          )}
        </Field>
      )}
    </>
  );
}
