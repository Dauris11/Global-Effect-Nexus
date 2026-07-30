/**
 * Alta y edición de materia — ClickUp S6 · #219 y #383.
 *
 * Diálogo y no página: son nueve campos y es una acción puntual que interrumpe
 * (estándar §6). El contraste con el expediente es deliberado — ese son seis
 * secciones de ficha social y sí necesita pantalla propia.
 *
 * El período es opcional a propósito: el catálogo se arma antes de que el
 * período exista (se planifican materias para el cuatrimestre que viene), así
 * que exigirlo bloquearía el trabajo normal de coordinación.
 *
 * **Un solo componente para crear y para editar.** Son los mismos nueve campos
 * con las mismas reglas; separarlos en dos diálogos duplicaría el formulario
 * entero para cambiar la llamada final, y el día que se añada un campo se
 * añadiría a uno de los dos. Lo que cambia con `registro` es el título, la
 * etiqueta del botón y a qué acción se llama.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { actualizarMateria, crearMateria } from "@/server/academico/actions";
import type { Materia } from "@/server/academico/types";
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

export interface TextosNuevaMateria {
  titulo: string;
  subtitulo: string;
  tituloEditar: string;
  subtituloEditar: string;
  nombre: string;
  nombrePlaceholder: string;
  codigo: string;
  descripcion: string;
  periodo: string;
  sinPeriodo: string;
  creditos: string;
  estado: string;
  horario: string;
  horarioPlaceholder: string;
  aula: string;
  crear: string;
  creando: string;
  guardar: string;
  guardando: string;
  cancelar: string;
  cerrar: string;
  errorNombre: string;
  errorGeneral: string;
  estados: Record<string, string>;
  selectorDocente: TextosSelectorDocente;
}

const ESTADOS = ["activa", "inactiva"];
/** Centinela: Radix Select reserva `""` para limpiar la selección. */
const SIN_PERIODO = "__sin_periodo__";

export function DialogoMateria({
  abierto,
  onCambio,
  textos,
  periodos,
  docentes,
  registro,
}: {
  abierto: boolean;
  onCambio: (v: boolean) => void;
  textos: TextosNuevaMateria;
  periodos: { id: string; nombre: string }[];
  docentes: DocenteOpcion[];
  /** Presente ⇒ edición. Ausente ⇒ alta. */
  registro?: Materia;
}) {
  const router = useRouter();
  const edicion = registro !== undefined;

  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorNombre, setErrorNombre] = React.useState<string | null>(null);

  /** Valores de partida: los del registro si se edita, los de fábrica si no. */
  const iniciales = React.useMemo(() => {
    const docente = seleccionInicial(
      registro?.profesor_usuario_id ?? null,
      registro?.profesor_nombre ?? null,
      docentes,
    );
    return {
      nombre: registro?.nombre ?? "",
      codigo: registro?.codigo ?? "",
      descripcion: registro?.descripcion ?? "",
      periodo: registro?.periodo_id ?? SIN_PERIODO,
      creditos: String(registro?.creditos ?? 3),
      estado: registro?.estado ?? "activa",
      horario: registro?.horario ?? "",
      aula: registro?.aula ?? "",
      profesor: edicion ? docente.seleccion : DOCENTE_SIN,
      profesorExterno: edicion ? docente.nombreExterno : "",
    };
  }, [registro, docentes, edicion]);

  const [nombre, setNombre] = React.useState(iniciales.nombre);
  const [codigo, setCodigo] = React.useState(iniciales.codigo);
  const [descripcion, setDescripcion] = React.useState(iniciales.descripcion);
  const [periodo, setPeriodo] = React.useState(iniciales.periodo);
  const [creditos, setCreditos] = React.useState(iniciales.creditos);
  const [profesor, setProfesor] = React.useState(iniciales.profesor);
  const [profesorExterno, setProfesorExterno] = React.useState(iniciales.profesorExterno);
  const [estado, setEstado] = React.useState(iniciales.estado);
  const [horario, setHorario] = React.useState(iniciales.horario);
  const [aula, setAula] = React.useState(iniciales.aula);

  function limpiar() {
    setNombre(iniciales.nombre);
    setCodigo(iniciales.codigo);
    setDescripcion(iniciales.descripcion);
    setPeriodo(iniciales.periodo);
    setCreditos(iniciales.creditos);
    setProfesor(iniciales.profesor);
    setProfesorExterno(iniciales.profesorExterno);
    setEstado(iniciales.estado);
    setHorario(iniciales.horario);
    setAula(iniciales.aula);
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
    const quienImparte = resolverDocente(profesor, profesorExterno, docentes);
    const datos = {
      nombre: nombre.trim(),
      codigo: codigo.trim() || undefined,
      descripcion: descripcion.trim() || undefined,
      periodo_id: periodo === SIN_PERIODO ? undefined : periodo,
      creditos: creditos || 0,
      profesor_nombre: quienImparte.nombre,
      profesor_usuario_id: quienImparte.usuarioId,
      estado,
      horario: horario.trim() || undefined,
      aula: aula.trim() || undefined,
    };

    try {
      if (registro) await actualizarMateria({ ...datos, id: registro.id });
      else await crearMateria(datos);
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
        // Al cerrar sin guardar se descartan los cambios: en alta vuelve a
        // vacío, en edición vuelve a lo que dice la base de datos.
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
            <Field label={textos.codigo}>
              {(p) => (
                <Input {...p} value={codigo} onChange={(e) => setCodigo(e.target.value)} />
              )}
            </Field>

            <Field label={textos.creditos}>
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  min={0}
                  max={20}
                  value={creditos}
                  onChange={(e) => setCreditos(e.target.value)}
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

            <SelectorDocente
              docentes={docentes}
              textos={textos.selectorDocente}
              seleccion={profesor}
              onSeleccion={setProfesor}
              nombreExterno={profesorExterno}
              onNombreExterno={setProfesorExterno}
            />

            <Field label={textos.aula}>
              {(p) => <Input {...p} value={aula} onChange={(e) => setAula(e.target.value)} />}
            </Field>
          </div>

          <Field label={textos.horario} ayuda={textos.horarioPlaceholder}>
            {(p) => (
              <Input {...p} value={horario} onChange={(e) => setHorario(e.target.value)} />
            )}
          </Field>

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
export function BotonNuevaMateria({
  etiqueta,
  textos,
  periodos,
  docentes,
}: {
  etiqueta: string;
  textos: TextosNuevaMateria;
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
      <DialogoMateria
        abierto={abierto}
        onCambio={setAbierto}
        textos={textos}
        periodos={periodos}
        docentes={docentes}
      />
    </>
  );
}
