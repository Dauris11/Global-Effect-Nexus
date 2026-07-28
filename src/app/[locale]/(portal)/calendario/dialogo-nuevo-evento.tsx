/**
 * Creación de evento de calendario — apoyo de ClickUp S9 · #452.
 *
 * El calendario sin forma de añadir nada dejaría su estado vacío como un aviso
 * y no como una invitación a actuar, que es lo que exige el estándar (§6). Los
 * eventos que nacen de una tarea no se crean aquí: los genera `crearTarea`.
 *
 * Es un diálogo y no un panel lateral porque crear es una decisión puntual que
 * interrumpe, no un registro que se recorra en serie (§6).
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { crearEvento } from "@/server/operaciones/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const TIPOS = ["academico", "administrativo", "social", "reunion", "otro"];

export interface TextosNuevoEvento {
  titulo: string;
  subtitulo: string;
  campoTitulo: string;
  campoTituloPlaceholder: string;
  campoDescripcion: string;
  campoTipo: string;
  campoFecha: string;
  campoHoraInicio: string;
  campoHoraFin: string;
  campoUbicacion: string;
  campoResponsable: string;
  ayudaHora: string;
  crear: string;
  creando: string;
  cancelar: string;
  cerrar: string;
  errorTitulo: string;
  errorFecha: string;
  errorGeneral: string;
  tipo: Record<string, string>;
}

export function DialogoNuevoEvento({
  abierto,
  onCambio,
  fechaInicial,
  textos,
}: {
  abierto: boolean;
  onCambio: (v: boolean) => void;
  /** Día que trae preseleccionado (el 1 del mes visible). */
  fechaInicial: string;
  textos: TextosNuevoEvento;
}) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorTitulo, setErrorTitulo] = React.useState<string | null>(null);
  const [errorFecha, setErrorFecha] = React.useState<string | null>(null);

  const [titulo, setTitulo] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [tipo, setTipo] = React.useState("otro");
  const [fecha, setFecha] = React.useState(fechaInicial);
  const [horaInicio, setHoraInicio] = React.useState("");
  const [horaFin, setHoraFin] = React.useState("");
  const [ubicacion, setUbicacion] = React.useState("");
  const [responsable, setResponsable] = React.useState("");

  function limpiar() {
    setTitulo("");
    setDescripcion("");
    setTipo("otro");
    setFecha(fechaInicial);
    setHoraInicio("");
    setHoraFin("");
    setUbicacion("");
    setResponsable("");
    setError(null);
    setErrorTitulo(null);
    setErrorFecha(null);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorTitulo(null);
    setErrorFecha(null);

    if (!titulo.trim()) {
      setErrorTitulo(textos.errorTitulo);
      return;
    }
    if (!fecha) {
      setErrorFecha(textos.errorFecha);
      return;
    }

    setEnviando(true);
    try {
      await crearEvento({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        tipo,
        fecha,
        hora_inicio: horaInicio || undefined,
        hora_fin: horaFin || undefined,
        ubicacion: ubicacion.trim() || undefined,
        responsable: responsable.trim() || undefined,
      });
      limpiar();
      onCambio(false);
      router.refresh();
    } catch {
      setError(textos.errorGeneral);
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
          <DialogTitle>{textos.titulo}</DialogTitle>
          <DialogDescription>{textos.subtitulo}</DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="space-y-4">
          <Field label={textos.campoTitulo} error={errorTitulo ?? undefined} requerido>
            {(p) => (
              <Input
                {...p}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder={textos.campoTituloPlaceholder}
                autoFocus
              />
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={textos.campoTipo}>
              {(p) => (
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger id={p.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((v) => (
                      <SelectItem key={v} value={v}>
                        {textos.tipo[v]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>

            <Field label={textos.campoFecha} error={errorFecha ?? undefined} requerido>
              {(p) => (
                <Input
                  {...p}
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              )}
            </Field>

            <Field label={textos.campoHoraInicio} ayuda={textos.ayudaHora}>
              {(p) => (
                <Input
                  {...p}
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                />
              )}
            </Field>

            <Field label={textos.campoHoraFin}>
              {(p) => (
                <Input
                  {...p}
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                />
              )}
            </Field>

            <Field label={textos.campoUbicacion}>
              {(p) => (
                <Input
                  {...p}
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                />
              )}
            </Field>

            <Field label={textos.campoResponsable}>
              {(p) => (
                <Input
                  {...p}
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                />
              )}
            </Field>
          </div>

          <Field label={textos.campoDescripcion}>
            {(p) => (
              <Textarea
                {...p}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
              />
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
              {enviando ? textos.creando : textos.crear}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Botón + diálogo, para usarlo desde una página de servidor. */
export function BotonNuevoEvento({
  etiqueta,
  fechaInicial,
  textos,
}: {
  etiqueta: string;
  fechaInicial: string;
  textos: TextosNuevoEvento;
}) {
  const [abierto, setAbierto] = React.useState(false);
  return (
    <>
      <Button onClick={() => setAbierto(true)}>{etiqueta}</Button>
      <DialogoNuevoEvento
        abierto={abierto}
        onCambio={setAbierto}
        fechaInicial={fechaInicial}
        textos={textos}
      />
    </>
  );
}
