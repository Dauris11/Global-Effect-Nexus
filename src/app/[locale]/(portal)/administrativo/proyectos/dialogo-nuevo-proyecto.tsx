/**
 * Creación de proyecto — ClickUp S9 · #449.
 *
 * No pide el porcentaje de avance: se calcula desde las tareas cerradas
 * automáticamente. Un número tecleado a mano deja de ser
 * cierto el mismo día.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { crearProyecto } from "@/server/operaciones/actions";
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

export interface TextosNuevoProyecto {
  titulo: string;
  subtitulo: string;
  campoNombre: string;
  campoNombrePlaceholder: string;
  campoDescripcion: string;
  campoResponsable: string;
  campoEstado: string;
  campoInicio: string;
  campoFin: string;
  ayudaAvance: string;
  crear: string;
  creando: string;
  cancelar: string;
  cerrar: string;
  errorNombre: string;
  errorGeneral: string;
  estado: Record<string, string>;
}

const ESTADOS = ["planificacion", "en_curso", "completado", "pausado"];

export function DialogoNuevoProyecto({
  abierto,
  onCambio,
  textos,
}: {
  abierto: boolean;
  onCambio: (v: boolean) => void;
  textos: TextosNuevoProyecto;
}) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorNombre, setErrorNombre] = React.useState<string | null>(null);

  const [nombre, setNombre] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [responsable, setResponsable] = React.useState("");
  const [estado, setEstado] = React.useState("planificacion");
  const [inicio, setInicio] = React.useState("");
  const [fin, setFin] = React.useState("");

  function limpiar() {
    setNombre("");
    setDescripcion("");
    setResponsable("");
    setEstado("planificacion");
    setInicio("");
    setFin("");
    setError(null);
    setErrorNombre(null);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorNombre(null);

    if (!nombre.trim()) {
      setErrorNombre(textos.errorNombre);
      return;
    }

    setEnviando(true);
    try {
      await crearProyecto({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        responsable: responsable.trim() || undefined,
        estado,
        fecha_inicio: inicio || undefined,
        fecha_fin: fin || undefined,
        progreso: 0,
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
          <Field label={textos.campoNombre} error={errorNombre ?? undefined} requerido>
            {(p) => (
              <Input
                {...p}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={textos.campoNombrePlaceholder}
                autoFocus
              />
            )}
          </Field>

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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={textos.campoResponsable}>
              {(p) => (
                <Input
                  {...p}
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                />
              )}
            </Field>

            <Field label={textos.campoEstado}>
              {(p) => (
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger id={p.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((v) => (
                      <SelectItem key={v} value={v}>
                        {textos.estado[v]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>

            <Field label={textos.campoInicio}>
              {(p) => (
                <Input
                  {...p}
                  type="date"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                />
              )}
            </Field>

            <Field label={textos.campoFin}>
              {(p) => (
                <Input
                  {...p}
                  type="date"
                  value={fin}
                  onChange={(e) => setFin(e.target.value)}
                />
              )}
            </Field>
          </div>

          <p className="text-[13px] text-muted-foreground">{textos.ayudaAvance}</p>

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

/** Botón + diálogo, para poder usarlo desde una página de servidor. */
export function BotonNuevoProyecto({
  etiqueta,
  textos,
}: {
  etiqueta: string;
  textos: TextosNuevoProyecto;
}) {
  const [abierto, setAbierto] = React.useState(false);
  return (
    <>
      <Button onClick={() => setAbierto(true)}>{etiqueta}</Button>
      <DialogoNuevoProyecto abierto={abierto} onCambio={setAbierto} textos={textos} />
    </>
  );
}
