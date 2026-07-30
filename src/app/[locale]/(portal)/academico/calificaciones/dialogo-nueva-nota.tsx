/**
 * Registro de calificación — ClickUp S6 · #220.
 *
 * Aquí sí es todo obligatorio, al contrario que en el expediente: una nota sin
 * estudiante, sin curso o sin período no es un dato incompleto, es un dato que
 * no significa nada. El expediente se llena en semanas; una nota se registra
 * entera o no se registra.
 *
 * La nota se muestra **con su banda de color mientras se teclea**. No es adorno:
 * es la confirmación de que el número escrito es el que se quería escribir. Un
 * 6 en lugar de un 60 se ve al instante porque el campo se pone rojo.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { registrarCalificacion } from "@/server/academico/actions";
import { bandaDeNota, paletaDe } from "@/lib/estados";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { ChipEstado } from "@/components/ui/chip-estado";
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

export interface TextosNuevaNota {
  titulo: string;
  subtitulo: string;
  estudiante: string;
  curso: string;
  periodo: string;
  elegir: string;
  nota: string;
  notaAyuda: string;
  tipo: string;
  observaciones: string;
  crear: string;
  creando: string;
  cancelar: string;
  cerrar: string;
  errorCampos: string;
  errorNota: string;
  errorGeneral: string;
  sinCursos: string;
  sinEstudiantes: string;
  tipos: Record<string, string>;
  bandas: Record<string, string>;
}

const TIPOS = ["examen", "tarea", "proyecto", "participacion", "final"];

/** Nombre de la banda para el chip, a partir del token de dominio. */
const NOMBRE_BANDA: Record<string, string> = {
  "nota-excelente": "excelente",
  "nota-buena": "buena",
  "nota-riesgo": "riesgo",
  "nota-critica": "critica",
};

export function DialogoNuevaNota({
  abierto,
  onCambio,
  textos,
  estudiantes,
  cursos,
  periodos,
}: {
  abierto: boolean;
  onCambio: (v: boolean) => void;
  textos: TextosNuevaNota;
  estudiantes: { id: string; nombre: string }[];
  cursos: { id: string; nombre: string }[];
  periodos: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorNota, setErrorNota] = React.useState<string | null>(null);

  const [estudiante, setEstudiante] = React.useState("");
  const [curso, setCurso] = React.useState("");
  // El período activo viene preseleccionado: es el caso normal, y ahorra un
  // clic en la acción que más se repite del módulo.
  const [periodo, setPeriodo] = React.useState(periodos[0]?.id ?? "");
  const [nota, setNota] = React.useState("");
  const [tipo, setTipo] = React.useState("examen");
  const [observaciones, setObservaciones] = React.useState("");

  const notaNumero = nota === "" ? null : Number(nota);
  const notaValida =
    notaNumero != null && Number.isFinite(notaNumero) && notaNumero >= 0 && notaNumero <= 100;
  const banda = notaValida ? bandaDeNota(notaNumero) : "neutral";

  function limpiar() {
    setEstudiante("");
    setCurso("");
    setPeriodo(periodos[0]?.id ?? "");
    setNota("");
    setTipo("examen");
    setObservaciones("");
    setError(null);
    setErrorNota(null);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorNota(null);

    if (!estudiante || !curso || !periodo) {
      setError(textos.errorCampos);
      return;
    }
    if (!notaValida) {
      setErrorNota(textos.errorNota);
      return;
    }

    setEnviando(true);
    try {
      await registrarCalificacion({
        estudiante_id: estudiante,
        curso_id: curso,
        periodo_id: periodo,
        nota: notaNumero,
        tipo_evaluacion: tipo,
        observaciones: observaciones.trim() || undefined,
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
          <Field label={textos.estudiante} requerido>
            {(p) => (
              <Select value={estudiante} onValueChange={setEstudiante}>
                <SelectTrigger id={p.id}>
                  <SelectValue
                    placeholder={
                      estudiantes.length ? textos.elegir : textos.sinEstudiantes
                    }
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={textos.curso} requerido>
              {(p) => (
                <Select value={curso} onValueChange={setCurso}>
                  <SelectTrigger id={p.id}>
                    <SelectValue
                      placeholder={cursos.length ? textos.elegir : textos.sinCursos}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre}
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={textos.nota}
              ayuda={textos.notaAyuda}
              error={errorNota ?? undefined}
              requerido
            >
              {(p) => (
                <div className="flex items-center gap-3">
                  <Input
                    {...p}
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    inputMode="decimal"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    className={cn(
                      "font-mono tabular-nums",
                      notaValida && paletaDe(banda).texto,
                    )}
                  />
                  {/* El chip nombra la banda: el color no puede ser el único
                      portador del significado (estándar §3.2). */}
                  {notaValida && (
                    <ChipEstado estado={banda} punto className="shrink-0">
                      {textos.bandas[NOMBRE_BANDA[banda] ?? ""] ?? ""}
                    </ChipEstado>
                  )}
                </div>
              )}
            </Field>

            <Field label={textos.tipo}>
              {(p) => (
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger id={p.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((v) => (
                      <SelectItem key={v} value={v}>
                        {textos.tipos[v] ?? v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
          </div>

          <Field label={textos.observaciones}>
            {(p) => (
              <Textarea
                {...p}
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
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
export function BotonNuevaNota({
  etiqueta,
  textos,
  estudiantes,
  cursos,
  periodos,
}: {
  etiqueta: string;
  textos: TextosNuevaNota;
  estudiantes: { id: string; nombre: string }[];
  cursos: { id: string; nombre: string }[];
  periodos: { id: string; nombre: string }[];
}) {
  const [abierto, setAbierto] = React.useState(false);
  return (
    <>
      <Button onClick={() => setAbierto(true)}>
        <Plus aria-hidden />
        {etiqueta}
      </Button>
      <DialogoNuevaNota
        abierto={abierto}
        onCambio={setAbierto}
        textos={textos}
        estudiantes={estudiantes}
        cursos={cursos}
        periodos={periodos}
      />
    </>
  );
}
