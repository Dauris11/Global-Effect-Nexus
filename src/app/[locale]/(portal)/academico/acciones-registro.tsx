/**
 * Acciones por registro del catálogo Académico — ClickUp S6 · #383, #384, #394.
 *
 * Dos piezas que comparten Materias, Cursos y Períodos: el menú de la fila y la
 * confirmación de borrado. Están juntas aquí porque el borrado del catálogo se
 * comporta igual en los tres sitios, y el comportamiento —no el aspecto— es lo
 * que no debe divergir.
 *
 * **La confirmación no pregunta "¿seguro?".** Un diálogo que solo pide confirmar
 * se aprende a despachar sin leerlo. Este dice qué se va a borrar por su nombre
 * y, si el registro está en uso, deja de ser una confirmación: se convierte en
 * una explicación de por qué no se puede y de qué hacer en su lugar
 * (desactivarlo). Ver `contarDependencias` en `server/academico/actions.ts`.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { ResultadoEliminar } from "@/server/academico/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface TextosAcciones {
  menu: string;
  editar: string;
  eliminar: string;
  /** Título de la confirmación, con `{name}`. */
  confirmarTitulo: string;
  confirmarTexto: string;
  /** Encabezado del aviso de "está en uso", con `{name}`. */
  enUsoTitulo: string;
  enUsoTexto: string;
  /** Nombre de cada dependencia: enrollments · grades · subjects · courses · enrolled. */
  dependencias: Record<string, string>;
  eliminando: string;
  entendido: string;
  cancelar: string;
  cerrar: string;
  errorGeneral: string;
}

/** Menú de la fila: editar y eliminar. */
export function MenuAcciones({
  textos,
  onEditar,
  onEliminar,
}: {
  textos: TextosAcciones;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={textos.menu}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onEditar}>
          <Pencil aria-hidden />
          {textos.editar}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={onEliminar}
          className="text-destructive focus:text-destructive [&_svg]:text-destructive"
        >
          <Trash2 aria-hidden />
          {textos.eliminar}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DialogoEliminar({
  abierto,
  onCambio,
  nombre,
  textos,
  alEliminar,
}: {
  abierto: boolean;
  onCambio: (v: boolean) => void;
  /** El nombre del registro; se muestra literal para que nadie borre a ciegas. */
  nombre: string;
  textos: TextosAcciones;
  /** La Server Action ya con su id. Devuelve por qué no se pudo, si no se pudo. */
  alEliminar: () => Promise<ResultadoEliminar>;
}) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [enUso, setEnUso] = React.useState<{ clave: string; total: number }[] | null>(
    null,
  );

  // El diálogo se reutiliza entre registros: al cerrarlo se olvida el resultado
  // anterior, o el siguiente borrado abriría con el aviso del previo.
  function cerrar(v: boolean) {
    if (!v) {
      setError(null);
      setEnUso(null);
    }
    onCambio(v);
  }

  async function confirmar() {
    setError(null);
    setEnviando(true);
    try {
      const r = await alEliminar();
      if (r.ok) {
        cerrar(false);
        router.refresh();
      } else {
        setEnUso(r.dependencias);
      }
    } catch {
      setError(textos.errorGeneral);
    } finally {
      setEnviando(false);
    }
  }

  const bloqueado = enUso !== null;

  return (
    <Dialog open={abierto} onOpenChange={cerrar}>
      <DialogContent etiquetaCerrar={textos.cerrar}>
        <DialogHeader>
          <DialogTitle>
            {(bloqueado ? textos.enUsoTitulo : textos.confirmarTitulo).replace(
              "{name}",
              nombre,
            )}
          </DialogTitle>
          <DialogDescription>
            {bloqueado ? textos.enUsoTexto : textos.confirmarTexto}
          </DialogDescription>
        </DialogHeader>

        {bloqueado && (
          <ul className="space-y-1 rounded-md bg-muted/60 px-3 py-2.5">
            {enUso.map((d) => (
              <li
                key={d.clave}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <span className="text-muted-foreground">
                  {textos.dependencias[d.clave] ?? d.clave}
                </span>
                <span className="font-mono font-semibold tabular-nums">{d.total}</span>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p role="alert" className="text-[13px] text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          {bloqueado ? (
            <Button type="button" onClick={() => cerrar(false)}>
              {textos.entendido}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => cerrar(false)}
                disabled={enviando}
              >
                {textos.cancelar}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmar}
                disabled={enviando}
              >
                {enviando ? textos.eliminando : textos.eliminar}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
