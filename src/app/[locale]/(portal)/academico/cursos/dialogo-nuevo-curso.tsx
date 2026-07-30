/**
 * Alta y edición de curso técnico — ClickUp S6 · #219 y #384.
 *
 * No pide "inscritos" ni al crear ni al editar: esa columna la mueve la
 * matrícula, no el formulario. Un curso se crea con su capacidad y empieza en
 * cero inscritos; teclear un número ahí sería un dato que deja de ser cierto en
 * cuanto alguien se inscriba, y en la edición sería peor — un cambio de horario
 * acabaría corrigiendo el cupo sin que nadie lo pidiera (mismo criterio que el
 * avance de un proyecto, estándar §10).
 *
 * Un solo componente para las dos operaciones, por lo mismo que en Materias:
 * son los mismos campos y las mismas reglas.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { actualizarCurso, crearCurso } from "@/server/academico/actions";
import type { Curso } from "@/server/academico/types";
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
import {
  DOCENTE_SIN,
  SelectorDocente,
  resolverDocente,
  seleccionInicial,
  type DocenteOpcion,
  type TextosSelectorDocente,
} from "../selector-docente";

export interface TextosNuevoCurso {
  titulo: string;
  subtitulo: string;
  tituloEditar: string;
  subtituloEditar: string;
  nombre: string;
  nombrePlaceholder: string;
  descripcion: string;
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
  guardar: string;
  guardando: string;
  cancelar: string;
  cerrar: string;
  errorNombre: string;
  errorGeneral: string;
  estados: Record<string, string>;
  modalidades: Record<string, string>;
  selectorDocente: TextosSelectorDocente;
}

const ESTADOS = ["activo", "planificado", "finalizado"];
const MODALIDADES = ["presencial", "virtual", "mixto"];
const SIN_PERIODO = "__sin_periodo__";

export function DialogoCurso({
  abierto,
  onCambio,
  textos,
  periodos,
  docentes,
  registro,
}: {
  abierto: boolean;
  onCambio: (v: boolean) => void;
  textos: TextosNuevoCurso;
  periodos: { id: string; nombre: string }[];
  docentes: DocenteOpcion[];
  /** Presente ⇒ edición. Ausente ⇒ alta. */
  registro?: Curso;
}) {
  const router = useRouter();
  const edicion = registro !== undefined;

  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorNombre, setErrorNombre] = React.useState<string | null>(null);

  const iniciales = React.useMemo(() => {
    const docente = seleccionInicial(
      registro?.docente_usuario_id ?? null,
      registro?.docente ?? null,
      docentes,
    );
    return {
      nombre: registro?.nombre ?? "",
      descripcion: registro?.descripcion ?? "",
      periodo: registro?.periodo_id ?? SIN_PERIODO,
      estado: registro?.estado ?? "activo",
      capacidad: String(registro?.capacidad ?? 30),
      horario: registro?.horario ?? "",
      modalidad: registro?.modalidad ?? "presencial",
      docente: edicion ? docente.seleccion : DOCENTE_SIN,
      docenteExterno: edicion ? docente.nombreExterno : "",
    };
  }, [registro, docentes, edicion]);

  const [nombre, setNombre] = React.useState(iniciales.nombre);
  const [descripcion, setDescripcion] = React.useState(iniciales.descripcion);
  const [docente, setDocente] = React.useState(iniciales.docente);
  const [docenteExterno, setDocenteExterno] = React.useState(iniciales.docenteExterno);
  const [periodo, setPeriodo] = React.useState(iniciales.periodo);
  const [estado, setEstado] = React.useState(iniciales.estado);
  const [capacidad, setCapacidad] = React.useState(iniciales.capacidad);
  const [horario, setHorario] = React.useState(iniciales.horario);
  const [modalidad, setModalidad] = React.useState(iniciales.modalidad);

  function limpiar() {
    setNombre(iniciales.nombre);
    setDescripcion(iniciales.descripcion);
    setDocente(iniciales.docente);
    setDocenteExterno(iniciales.docenteExterno);
    setPeriodo(iniciales.periodo);
    setEstado(iniciales.estado);
    setCapacidad(iniciales.capacidad);
    setHorario(iniciales.horario);
    setModalidad(iniciales.modalidad);
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
    const quienImparte = resolverDocente(docente, docenteExterno, docentes);
    const datos = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      docente: quienImparte.nombre,
      docente_usuario_id: quienImparte.usuarioId,
      periodo_id: periodo === SIN_PERIODO ? undefined : periodo,
      estado,
      capacidad: capacidad || 0,
      horario: horario.trim() || undefined,
      modalidad,
    };

    try {
      if (registro) await actualizarCurso({ ...datos, id: registro.id });
      else await crearCurso(datos);
      if (!registro) limpiar();
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
          <DialogTitle>{edicion ? textos.tituloEditar : textos.titulo}</DialogTitle>
          <DialogDescription>
            {edicion ? textos.subtituloEditar : textos.subtitulo}
          </DialogDescription>
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
            <SelectorDocente
              docentes={docentes}
              textos={textos.selectorDocente}
              seleccion={docente}
              onSeleccion={setDocente}
              nombreExterno={docenteExterno}
              onNombreExterno={setDocenteExterno}
            />

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
export function BotonNuevoCurso({
  etiqueta,
  textos,
  periodos,
  docentes,
}: {
  etiqueta: string;
  textos: TextosNuevoCurso;
  periodos: { id: string; nombre: string }[];
  docentes: DocenteOpcion[];
}) {
  const [abierto, setAbierto] = React.useState(false);
  return (
    <>
      <Button onClick={() => setAbierto(true)}>
        <Plus aria-hidden />
        {etiqueta}
      </Button>
      <DialogoCurso
        abierto={abierto}
        onCambio={setAbierto}
        textos={textos}
        periodos={periodos}
        docentes={docentes}
      />
    </>
  );
}
