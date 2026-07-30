/**
 * Alta y edición de período académico — ClickUp S6 · #221 y #394.
 *
 * El nombre es único en la base de datos (`periodo.nombre UNIQUE`), así que
 * crear un '2026-I' que ya existe falla en el servidor. Se avisa con un mensaje
 * propio en vez de dejar caer el error genérico: "ese período ya existe" dice
 * qué pasó y qué hacer; "no se pudo crear" no dice nada.
 *
 * La coherencia de fechas se valida en tres capas y no es redundancia: el `CHECK`
 * de la tabla es la garantía, el Zod del servidor es la frontera, y esta
 * comprobación en el cliente es la que evita el viaje de ida y vuelta.
 *
 * **Editar un período es lo que lo pone en marcha.** Sin esta mitad, el estado
 * quedaba fijo en el que se eligió al crearlo y un cuatrimestre no podía pasar
 * nunca de `planificado` a `activo` ni cerrarse en `completado`: la pantalla
 * avisaba del desajuste entre las fechas y el estado, pero no dejaba
 * arreglarlo.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { actualizarPeriodo, crearPeriodo } from "@/server/academico/actions";
import type { Periodo } from "@/server/academico/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface TextosNuevoPeriodo {
  titulo: string;
  subtitulo: string;
  tituloEditar: string;
  subtituloEditar: string;
  nombre: string;
  nombreAyuda: string;
  inicio: string;
  fin: string;
  estado: string;
  crear: string;
  creando: string;
  guardar: string;
  guardando: string;
  cancelar: string;
  cerrar: string;
  errorNombre: string;
  errorFechas: string;
  errorFin: string;
  errorDuplicado: string;
  errorGeneral: string;
  estados: Record<string, string>;
}

const ESTADOS = ["planificado", "activo", "completado"];

export function DialogoPeriodo({
  abierto,
  onCambio,
  textos,
  registro,
}: {
  abierto: boolean;
  onCambio: (v: boolean) => void;
  textos: TextosNuevoPeriodo;
  /** Presente ⇒ edición. Ausente ⇒ alta. */
  registro?: Periodo;
}) {
  const router = useRouter();
  const edicion = registro !== undefined;
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorNombre, setErrorNombre] = React.useState<string | null>(null);
  const [errorFin, setErrorFin] = React.useState<string | null>(null);

  // Las fechas ya vienen como `YYYY-MM-DD` desde la consulta (`to_char`), que
  // es exactamente lo que espera un `<input type="date">`.
  const [nombre, setNombre] = React.useState(registro?.nombre ?? "");
  const [inicio, setInicio] = React.useState(registro?.fecha_inicio ?? "");
  const [fin, setFin] = React.useState(registro?.fecha_fin ?? "");
  const [estado, setEstado] = React.useState(registro?.estado ?? "planificado");

  function limpiar() {
    setNombre(registro?.nombre ?? "");
    setInicio(registro?.fecha_inicio ?? "");
    setFin(registro?.fecha_fin ?? "");
    setEstado(registro?.estado ?? "planificado");
    setError(null);
    setErrorNombre(null);
    setErrorFin(null);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorNombre(null);
    setErrorFin(null);

    if (!nombre.trim()) {
      setErrorNombre(textos.errorNombre);
      return;
    }
    if (!inicio || !fin) {
      setError(textos.errorFechas);
      return;
    }
    // Comparación de cadenas `YYYY-MM-DD`: ordena igual que la fecha.
    if (fin < inicio) {
      setErrorFin(textos.errorFin);
      return;
    }

    setEnviando(true);
    const datos = {
      nombre: nombre.trim(),
      fecha_inicio: inicio,
      fecha_fin: fin,
      estado,
    };
    try {
      if (registro) await actualizarPeriodo({ ...datos, id: registro.id });
      else await crearPeriodo(datos);
      if (!registro) limpiar();
      onCambio(false);
      router.refresh();
    } catch (err) {
      // El nombre es UNIQUE en la tabla: distinguir el choque de un fallo
      // cualquiera es lo que convierte el aviso en algo accionable.
      const mensaje = (err as Error).message ?? "";
      setError(
        /duplicate|unique|ya existe/i.test(mensaje)
          ? textos.errorDuplicado
          : textos.errorGeneral,
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog
      open={abierto}
      onOpenChange={(v) => {
        if (!v) limpiar();
        onCambio(v);
      }}
    >
      <DialogContent etiquetaCerrar={textos.cerrar}>
        <DialogHeader>
          <DialogTitle>{edicion ? textos.tituloEditar : textos.titulo}</DialogTitle>
          <DialogDescription>
            {edicion ? textos.subtituloEditar : textos.subtitulo}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="space-y-4">
          <Field
            label={textos.nombre}
            ayuda={textos.nombreAyuda}
            error={errorNombre ?? undefined}
            requerido
          >
            {(p) => (
              <Input
                {...p}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="2026-I"
                className="font-mono"
                autoFocus
              />
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={textos.inicio} requerido>
              {(p) => (
                <Input
                  {...p}
                  type="date"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                />
              )}
            </Field>

            <Field label={textos.fin} error={errorFin ?? undefined} requerido>
              {(p) => (
                <Input
                  {...p}
                  type="date"
                  value={fin}
                  min={inicio || undefined}
                  onChange={(e) => setFin(e.target.value)}
                />
              )}
            </Field>
          </div>

          <Field label={textos.estado}>
            {(p) => (
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger id={p.id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((v) => (
                    <SelectItem key={v} value={v}>
                      {textos.estados[v] ?? v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>

          {error && (
            <p role="alert" className="text-[13px] text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onCambio(false)}
              disabled={enviando}
            >
              {textos.cancelar}
            </Button>
            <Button type="submit" disabled={enviando}>
              {edicion
                ? enviando
                  ? textos.guardando
                  : textos.guardar
                : enviando
                  ? textos.creando
                  : textos.crear}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Botón + diálogo de alta, para usarlo desde una página de servidor. */
export function BotonNuevoPeriodo({
  etiqueta,
  textos,
}: {
  etiqueta: string;
  textos: TextosNuevoPeriodo;
}) {
  const [abierto, setAbierto] = React.useState(false);
  return (
    <>
      <Button onClick={() => setAbierto(true)}>
        <Plus aria-hidden />
        {etiqueta}
      </Button>
      <DialogoPeriodo abierto={abierto} onCambio={setAbierto} textos={textos} />
    </>
  );
}
