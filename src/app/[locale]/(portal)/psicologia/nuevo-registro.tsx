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
import { Plus, ScanLine } from "lucide-react";
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
import {
  BuscadorEstudiantes,
  normalizar,
} from "@/components/expedientes/buscador-estudiantes";
import { crearCita } from "@/server/psicologia/actions";
import { identificarEstudianteEnDocumento } from "@/server/ia/actions";

/** Mismos formatos que acepta el OCR del expediente (ver `server/ia/actions`). */
const ACEPTADOS = "image/jpeg,image/png,image/webp,image/gif,application/pdf";

export function NuevoRegistro({
  estudiantes,
}: {
  estudiantes: { id: string; nombre: string }[];
}) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState("");
  const [enviando, enviar] = useTransition();
  /* El estudiante ya no viaja en el FormData: el buscador es un combobox, no
     un `<select name>`. Se guarda aquí y se valida antes de enviar. */
  const [elegido, setElegido] = useState<{ id: string; nombre: string } | null>(null);
  const [leyendo, setLeyendo] = useState(false);
  const [avisoOcr, setAvisoOcr] = useState("");

  /**
   * Lee el documento y busca al joven por nombre.
   *
   * El emparejamiento es por coincidencia de texto normalizado, así que puede
   * fallar: por eso **siempre** dice qué leyó y qué hizo con ello. Preseleccionar
   * en silencio a la persona equivocada sería peor que no preseleccionar nada.
   */
  async function identificar(archivo: File) {
    setAvisoOcr("");
    setError("");
    setLeyendo(true);
    try {
      const datos = new FormData();
      datos.set("archivo", archivo);
      const { nombre, confianza } = await identificarEstudianteEnDocumento(datos);

      if (!nombre) {
        setAvisoOcr("No se pudo leer un nombre en el documento. Búscalo a mano.");
        return;
      }

      const objetivo = normalizar(nombre);
      const coincidencias = estudiantes.filter((e) => {
        const n = normalizar(e.nombre);
        return n === objetivo || n.includes(objetivo) || objetivo.includes(n);
      });

      if (coincidencias.length === 1) {
        setElegido(coincidencias[0]);
        setAvisoOcr(`Leído «${nombre}» (${confianza}% de confianza). Confirma que es correcto.`);
      } else if (coincidencias.length === 0) {
        setAvisoOcr(`Leído «${nombre}», pero no hay ningún expediente con ese nombre.`);
      } else {
        // Varias coincidencias: no se elige por el usuario. Dos hermanos con
        // el mismo apellido acabarían con la cita en el expediente del otro.
        setAvisoOcr(`Leído «${nombre}», pero coincide con ${coincidencias.length} expedientes. Elígelo tú.`);
      }
    } catch (e) {
      setAvisoOcr("");
      setError(e instanceof Error ? e.message : "No se pudo leer el documento.");
    } finally {
      setLeyendo(false);
    }
  }

  function onSubmit(datos: FormData) {
    setError("");

    if (!elegido) {
      setError("Elige un estudiante.");
      return;
    }

    enviar(async () => {
      try {
        await crearCita({
          estudiante_id: elegido.id,
          tipo_registro: datos.get("tipo_registro"),
          fecha: datos.get("fecha"),
          hora: datos.get("hora") || undefined,
          nivel_confidencialidad: datos.get("nivel_confidencialidad"),
          riesgos: datos.get("riesgos") || undefined,
        });
        setElegido(null);
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
          {/* OCR: la psicóloga llega con la ficha en papel, no con el nombre
              tecleado. Identifica al joven y preselecciona; nunca guarda nada
              por su cuenta —la persona confirma antes de enviar—. */}
          <div className="space-y-2 rounded-xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-500/30 dark:bg-indigo-500/10">
            <p className="flex items-center gap-2 text-xs font-medium text-indigo-900 dark:text-indigo-200">
              <ScanLine aria-hidden className="h-4 w-4 shrink-0" />
              ¿Tienes el documento escaneado?
            </p>

            <label className="block">
              <span className="sr-only">Subir documento para identificar al estudiante</span>
              <input
                type="file"
                accept={ACEPTADOS}
                disabled={leyendo}
                onChange={(ev) => {
                  const f = ev.target.files?.[0];
                  // El input se vacía para que subir el mismo archivo otra vez
                  // vuelva a disparar `change` (si falló la primera).
                  ev.target.value = "";
                  if (f) identificar(f);
                }}
                className="block w-full text-xs text-indigo-900 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-indigo-700 disabled:opacity-50 dark:text-indigo-200"
              />
            </label>

            {leyendo && (
              <p role="status" className="text-xs text-indigo-900/80 dark:text-indigo-200/80">
                Leyendo el documento…
              </p>
            )}
            {avisoOcr && (
              <p role="status" className="text-xs text-indigo-900 dark:text-indigo-200">
                {avisoOcr}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="estudiante_id">
              Estudiante <span className="text-destructive">*</span>
            </Label>
            <BuscadorEstudiantes
              id="estudiante_id"
              estudiantes={estudiantes}
              seleccionado={elegido}
              // El buscador devuelve un id vacío cuando se pulsa la X.
              onElegir={(e) => setElegido(e.id ? e : null)}
            />
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
            <Label htmlFor="notas">Notas confidenciales</Label>
            <Textarea
              id="notas"
              name="notas"
              rows={2}
              placeholder="Notas u observaciones confidenciales para el expediente del psicólogo..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="riesgos">Riesgos detectados</Label>
            <Textarea
              id="riesgos"
              name="riesgos"
              rows={2}
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
