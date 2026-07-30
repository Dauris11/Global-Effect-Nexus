/**
 * Creación de curso técnico — ClickUp S6 · #219.
 *
 * No pide "inscritos": esa columna la mueve la matrícula, no el formulario de
 * alta. Un curso se crea con su capacidad y empieza en cero inscritos; teclear
 * un número ahí sería un dato que deja de ser cierto en cuanto alguien se
 * inscriba (mismo criterio que el avance de un proyecto, estándar §10).
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { crearCurso } from "@/server/academico/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export interface TextosNuevoCurso {
  titulo: string;
  subtitulo: string;
  nombre: string;
  nombrePlaceholder: string;
  descripcion: string;
  docente: string;
  periodo: string;
  sinPeriodo: string;
  estado: string;
  capacidad: string;
  horario: string;
  horarioPlaceholder: string;
  modalidad: string;
  ayudaInscritos: string;
  crear: string;
  creando: string;
  cancelar: string;
  cerrar: string;
  errorNombre: string;
  errorGeneral: string;
  estados: Record<string, string>;
  modalidades: Record<string, string>;
}

const ESTADOS = ["activo", "planificado", "finalizado"];
const MODALIDADES = ["presencial", "virtual", "mixto"];
const SIN_PERIODO = "__sin_periodo__";

export function DialogoNuevoCurso({
  abierto,
  onCambio,
  textos,
  periodos,
}: {
  abierto: boolean;
  onCambio: (v: boolean) => void;
  textos: TextosNuevoCurso;
  periodos: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorNombre, setErrorNombre] = React.useState<string | null>(null);

  const [nombre, setNombre] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [docente, setDocente] = React.useState("");
  const [periodo, setPeriodo] = React.useState(SIN_PERIODO);
  const [estado, setEstado] = React.useState("activo");
  const [capacidad, setCapacidad] = React.useState("30");
  const [horario, setHorario] = React.useState("");
  const [modalidad, setModalidad] = React.useState("presencial");

  function limpiar() {
    setNombre("");
    setDescripcion("");
    setDocente("");
    setPeriodo(SIN_PERIODO);
    setEstado("activo");
    setCapacidad("30");
    setHorario("");
    setModalidad("presencial");
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
      await crearCurso({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        docente: docente.trim() || undefined,
        periodo_id: periodo === SIN_PERIODO ? undefined : periodo,
        estado,
        capacidad: capacidad || 0,
        horario: horario.trim() || undefined,
        modalidad,
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
          <Field label={textos.nombre} error={errorNombre ?? undefined} requerido>
            {(p) => (
              <Input
                {...p}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={textos.nombrePlaceholder}
                autoFocus
              />
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={textos.docente}>
              {(p) => (
                <Input {...p} value={docente} onChange={(e) => setDocente(e.target.value)} />
              )}
            </Field>

            <Field label={textos.capacidad} ayuda={textos.ayudaInscritos}>
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  min={0}
                  max={500}
                  value={capacidad}
                  onChange={(e) => setCapacidad(e.target.value)}
                />
              )}
            </Field>

            <Field label={textos.periodo}>
              {(p) => (
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger id={p.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SIN_PERIODO}>{textos.sinPeriodo}</SelectItem>
                    {periodos.map((per) => (
                      <SelectItem key={per.id} value={per.id}>
                        {per.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>

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

            <Field label={textos.modalidad}>
              {(p) => (
                <Select value={modalidad} onValueChange={setModalidad}>
                  <SelectTrigger id={p.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODALIDADES.map((v) => (
                      <SelectItem key={v} value={v}>
                        {textos.modalidades[v] ?? v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>

            <Field label={textos.horario} ayuda={textos.horarioPlaceholder}>
              {(p) => (
                <Input {...p} value={horario} onChange={(e) => setHorario(e.target.value)} />
              )}
            </Field>
          </div>

          <Field label={textos.descripcion}>
            {(p) => (
              <Textarea
                {...p}
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
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
export function BotonNuevoCurso({
  etiqueta,
  textos,
  periodos,
}: {
  etiqueta: string;
  textos: TextosNuevoCurso;
  periodos: { id: string; nombre: string }[];
}) {
  const [abierto, setAbierto] = React.useState(false);
  return (
    <>
      <Button onClick={() => setAbierto(true)}>
        <Plus aria-hidden />
        {etiqueta}
      </Button>
      <DialogoNuevoCurso
        abierto={abierto}
        onCambio={setAbierto}
        textos={textos}
        periodos={periodos}
      />
    </>
  );
}
