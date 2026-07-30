/**
 * Inscribir en una materia (prematrícula) — ClickUp S6 · #221.
 *
 * La tabla tiene `UNIQUE (estudiante_id, materia_id, periodo_id)` y la acción del
 * servidor usa `ON CONFLICT DO NOTHING`, así que inscribir dos veces no rompe
 * nada — pero **devuelve cadena vacía en vez de un id**. Eso hay que contarlo:
 * sin aviso, el usuario ve el diálogo cerrarse y da por hecho que se inscribió
 * una segunda materia. Aquí se distingue "inscrito" de "ya estaba inscrito".
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { crearInscripcion } from "@/server/academico/actions";
import { Button } from "@/components/ui/button";
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

export interface TextosInscribir {
  titulo: string;
  subtitulo: string;
  estudiante: string;
  materia: string;
  periodo: string;
  elegir: string;
  sinMaterias: string;
  sinEstudiantes: string;
  crear: string;
  creando: string;
  cancelar: string;
  cerrar: string;
  errorCampos: string;
  yaInscrito: string;
  errorGeneral: string;
}

export function DialogoInscribir({
  abierto,
  onCambio,
  textos,
  estudiantes,
  materias,
  periodos,
  periodoPorDefecto,
}: {
  abierto: boolean;
  onCambio: (v: boolean) => void;
  textos: TextosInscribir;
  estudiantes: { id: string; nombre: string }[];
  materias: { id: string; nombre: string }[];
  periodos: { id: string; nombre: string }[];
  periodoPorDefecto?: string;
}) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [aviso, setAviso] = React.useState<string | null>(null);

  const [estudiante, setEstudiante] = React.useState("");
  const [materia, setMateria] = React.useState("");
  const [periodo, setPeriodo] = React.useState(periodoPorDefecto ?? periodos[0]?.id ?? "");

  function limpiar() {
    setEstudiante("");
    setMateria("");
    setPeriodo(periodoPorDefecto ?? periodos[0]?.id ?? "");
    setError(null);
    setAviso(null);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);

    if (!estudiante || !materia || !periodo) {
      setError(textos.errorCampos);
      return;
    }

    setEnviando(true);
    try {
      const id = await crearInscripcion({
        estudiante_id: estudiante,
        materia_id: materia,
        periodo_id: periodo,
      });

      // Cadena vacía = el ON CONFLICT no insertó nada: ya existía.
      if (!id) {
        setAviso(textos.yaInscrito);
        setEnviando(false);
        return;
      }

      limpiar();
      onCambio(false);
      router.refresh();
    } catch {
      setError(textos.errorGeneral);
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
          <Field label={textos.estudiante} requerido>
            {(p) => (
              <Select value={estudiante} onValueChange={setEstudiante}>
                <SelectTrigger id={p.id}>
                  <SelectValue
                    placeholder={estudiantes.length ? textos.elegir : textos.sinEstudiantes}
                  />
                </SelectTrigger>
                <SelectContent>
                  {estudiantes.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>

          <Field label={textos.materia} requerido>
            {(p) => (
              <Select value={materia} onValueChange={setMateria}>
                <SelectTrigger id={p.id}>
                  <SelectValue
                    placeholder={materias.length ? textos.elegir : textos.sinMaterias}
                  />
                </SelectTrigger>
                <SelectContent>
                  {materias.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>

          <Field label={textos.periodo} requerido>
            {(p) => (
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger id={p.id}>
                  <SelectValue placeholder={textos.elegir} />
                </SelectTrigger>
                <SelectContent>
                  {periodos.map((per) => (
                    <SelectItem key={per.id} value={per.id}>
                      {per.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>

          {aviso && (
            <p role="alert" className="text-[13px] font-medium text-prioridad-alta">
              {aviso}
            </p>
          )}
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
export function BotonInscribir({
  etiqueta,
  textos,
  estudiantes,
  materias,
  periodos,
  periodoPorDefecto,
}: {
  etiqueta: string;
  textos: TextosInscribir;
  estudiantes: { id: string; nombre: string }[];
  materias: { id: string; nombre: string }[];
  periodos: { id: string; nombre: string }[];
  periodoPorDefecto?: string;
}) {
  const [abierto, setAbierto] = React.useState(false);
  return (
    <>
      <Button onClick={() => setAbierto(true)}>
        <Plus aria-hidden />
        {etiqueta}
      </Button>
      <DialogoInscribir
        abierto={abierto}
        onCambio={setAbierto}
        textos={textos}
        estudiantes={estudiantes}
        materias={materias}
        periodos={periodos}
        periodoPorDefecto={periodoPorDefecto}
      />
    </>
  );
}
