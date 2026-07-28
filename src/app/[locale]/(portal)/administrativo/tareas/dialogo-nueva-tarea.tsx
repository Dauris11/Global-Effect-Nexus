/**
 * Creación de tarea — ClickUp S9 · #441 (prioridad/visibilidad) y #442
 * (asignación múltiple).
 *
 * Al guardar, la Server Action dispara las automatizaciones de #444–447:
 * evento de calendario con la fecha límite, correo a cada asignado y webhook
 * al CRM. Aquí no se duplica nada de eso; solo se recoge el formulario.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { crearTarea } from "@/server/operaciones/actions";
import type { Proyecto } from "@/server/operaciones/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
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

export interface TextosNuevaTarea {
  titulo: string;
  subtitulo: string;
  campoTitulo: string;
  campoTituloPlaceholder: string;
  campoDescripcion: string;
  campoProyecto: string;
  campoPrioridad: string;
  campoVisibilidad: string;
  campoFechaLimite: string;
  campoAsignados: string;
  ayudaAsignados: string;
  sinProyecto: string;
  crear: string;
  creando: string;
  cancelar: string;
  cerrar: string;
  errorTitulo: string;
  errorGeneral: string;
  prioridad: Record<string, string>;
  visibilidad: Record<string, string>;
}

interface Props {
  abierto: boolean;
  onCambio: (abierto: boolean) => void;
  proyectos: Proyecto[];
  asignables: { id: string; nombre: string }[];
  textos: TextosNuevaTarea;
}

const SIN_PROYECTO = "sin-proyecto";

export function DialogoNuevaTarea({
  abierto,
  onCambio,
  proyectos,
  asignables,
  textos,
}: Props) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorTitulo, setErrorTitulo] = React.useState<string | null>(null);

  const [titulo, setTitulo] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [proyectoId, setProyectoId] = React.useState(SIN_PROYECTO);
  const [prioridad, setPrioridad] = React.useState("media");
  const [visibilidad, setVisibilidad] = React.useState("asignados");
  const [fechaLimite, setFechaLimite] = React.useState("");
  const [asignados, setAsignados] = React.useState<string[]>([]);

  function limpiar() {
    setTitulo("");
    setDescripcion("");
    setProyectoId(SIN_PROYECTO);
    setPrioridad("media");
    setVisibilidad("asignados");
    setFechaLimite("");
    setAsignados([]);
    setError(null);
    setErrorTitulo(null);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorTitulo(null);

    if (!titulo.trim()) {
      setErrorTitulo(textos.errorTitulo);
      return;
    }

    setEnviando(true);
    try {
      await crearTarea({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        proyecto_id: proyectoId === SIN_PROYECTO ? undefined : proyectoId,
        visibilidad,
        prioridad,
        fecha_limite: fechaLimite || undefined,
        asignados,
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
      <DialogContent className="max-w-xl" etiquetaCerrar={textos.cerrar}>
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
            <Field label={textos.campoProyecto}>
              {(p) => (
                <Select value={proyectoId} onValueChange={setProyectoId}>
                  <SelectTrigger id={p.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SIN_PROYECTO}>{textos.sinProyecto}</SelectItem>
                    {proyectos.map((pr) => (
                      <SelectItem key={pr.id} value={pr.id}>
                        {pr.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>

            <Field label={textos.campoFechaLimite}>
              {(p) => (
                <Input
                  {...p}
                  type="date"
                  value={fechaLimite}
                  onChange={(e) => setFechaLimite(e.target.value)}
                />
              )}
            </Field>

            <Field label={textos.campoPrioridad}>
              {(p) => (
                <Select value={prioridad} onValueChange={setPrioridad}>
                  <SelectTrigger id={p.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["baja", "media", "alta", "urgente"].map((v) => (
                      <SelectItem key={v} value={v}>
                        {textos.prioridad[v]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>

            <Field label={textos.campoVisibilidad}>
              {(p) => (
                <Select value={visibilidad} onValueChange={setVisibilidad}>
                  <SelectTrigger id={p.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["asignados", "todos"].map((v) => (
                      <SelectItem key={v} value={v}>
                        {textos.visibilidad[v]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
          </div>

          {/* Asignación múltiple: lista de casillas, no un multi-select.
              El equipo son ~20 personas y verlas todas es más rápido. */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">{textos.campoAsignados}</legend>
            <p className="text-[13px] text-muted-foreground">{textos.ayudaAsignados}</p>
            <div className="max-h-44 space-y-1 overflow-y-auto rounded-md border border-border p-2">
              {asignables.map((u) => {
                const marcado = asignados.includes(u.id);
                return (
                  <div key={u.id} className="flex items-center gap-2.5 rounded-sm px-1 py-1.5">
                    <Checkbox
                      id={`asignado-${u.id}`}
                      checked={marcado}
                      onCheckedChange={(v) =>
                        setAsignados((prev) =>
                          v === true ? [...prev, u.id] : prev.filter((x) => x !== u.id),
                        )
                      }
                    />
                    <Avatar nombre={u.nombre} tamano="sm" />
                    <Label htmlFor={`asignado-${u.id}`} className="cursor-pointer font-normal">
                      {u.nombre}
                    </Label>
                  </div>
                );
              })}
            </div>
          </fieldset>

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
