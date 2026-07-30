/**
 * Creación de materia — ClickUp S6 · #219.
 *
 * Diálogo y no página: son nueve campos y es una acción puntual que interrumpe
 * (estándar §6). El contraste con el expediente es deliberado — ese son seis
 * secciones de ficha social y sí necesita pantalla propia.
 *
 * El período es opcional a propósito: el catálogo se arma antes de que el
 * período exista (se planifican materias para el cuatrimestre que viene), así
 * que exigirlo bloquearía el trabajo normal de coordinación.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { crearMateria } from "@/server/academico/actions";
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
  type DocenteOpcion,
  type TextosSelectorDocente,
} from "../selector-docente";

export interface TextosNuevaMateria {
  titulo: string;
  subtitulo: string;
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

export function DialogoNuevaMateria({
  abierto,
  onCambio,
  textos,
  periodos,
  docentes,
}: {
  abierto: boolean;
  onCambio: (v: boolean) => void;
  textos: TextosNuevaMateria;
  periodos: { id: string; nombre: string }[];
  docentes: DocenteOpcion[];
}) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorNombre, setErrorNombre] = React.useState<string | null>(null);

  const [nombre, setNombre] = React.useState("");
  const [codigo, setCodigo] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [periodo, setPeriodo] = React.useState(SIN_PERIODO);
  const [creditos, setCreditos] = React.useState("3");
  const [profesor, setProfesor] = React.useState(DOCENTE_SIN);
  const [profesorExterno, setProfesorExterno] = React.useState("");
  const [estado, setEstado] = React.useState("activa");
  const [horario, setHorario] = React.useState("");
  const [aula, setAula] = React.useState("");

  function limpiar() {
    setNombre("");
    setCodigo("");
    setDescripcion("");
    setPeriodo(SIN_PERIODO);
    setCreditos("3");
    setProfesor(DOCENTE_SIN);
    setProfesorExterno("");
    setEstado("activa");
    setHorario("");
    setAula("");
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
    try {
      await crearMateria({
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
              {enviando ? textos.creando : textos.crear}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Botón + diálogo, para usarlo desde una página de servidor. */
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
      <DialogoNuevaMateria
        abierto={abierto}
        onCambio={setAbierto}
        textos={textos}
        periodos={periodos}
        docentes={docentes}
      />
    </>
  );
}
