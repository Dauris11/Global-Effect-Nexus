/**
 * Diálogo "Nuevo registro" del módulo Psicología.
 *
 * Crea una cita, un seguimiento o una evaluación. Escribe con la Server Action
 * `crearCita`, que exige `psicologia.escribir` y revalida esta ruta.
 *
 * El campo de notas **no** está aquí a propósito. `crearCita` no guarda notas:
 * el contenido de una nota psicológica se escribe con `crearNota`, contra otra
 * tabla y en un segundo paso deliberado. Meterlo en el mismo formulario haría
 * fácil dejar caer información sensible en un registro que se lista.
 */
"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { crearCita } from "@/server/psicologia/actions";

export function NuevoRegistro({
  estudiantes,
}: {
  estudiantes: { id: string; nombre: string }[];
}) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState("");
  const [enviando, enviar] = useTransition();

  function onSubmit(datos: FormData) {
    setError("");
    enviar(async () => {
      try {
        await crearCita({
          estudiante_id: datos.get("estudiante_id"),
          tipo_registro: datos.get("tipo_registro"),
          fecha: datos.get("fecha"),
          hora: datos.get("hora") || undefined,
          nivel_confidencialidad: datos.get("nivel_confidencialidad"),
          riesgos: datos.get("riesgos") || undefined,
        });
        setAbierto(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar el registro.");
      }
    });
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden />
          Nuevo registro
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo registro de psicología</DialogTitle>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="estudiante_id">
              Estudiante <span className="text-destructive">*</span>
            </Label>
            <select
              id="estudiante_id"
              name="estudiante_id"
              required
              defaultValue=""
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
            >
              <option value="" disabled>
                Selecciona…
              </option>
              {estudiantes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tipo_registro">Tipo</Label>
              <select
                id="tipo_registro"
                name="tipo_registro"
                defaultValue="cita"
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
              >
                <option value="cita">Cita</option>
                <option value="seguimiento">Seguimiento</option>
                <option value="evaluacion">Evaluación</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nivel_confidencialidad">Confidencialidad</Label>
              <select
                id="nivel_confidencialidad"
                name="nivel_confidencialidad"
                defaultValue="medio"
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
              >
                <option value="alto">Alto</option>
                <option value="medio">Medio</option>
                <option value="bajo">Bajo</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fecha">
                Fecha <span className="text-destructive">*</span>
              </Label>
              <Input id="fecha" name="fecha" type="date" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hora">Hora</Label>
              <Input id="hora" name="hora" type="time" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="riesgos">Riesgos detectados</Label>
            <Textarea
              id="riesgos"
              name="riesgos"
              rows={3}
              placeholder="Deja vacío si no se detectó ninguno."
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando…" : "Guardar registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
