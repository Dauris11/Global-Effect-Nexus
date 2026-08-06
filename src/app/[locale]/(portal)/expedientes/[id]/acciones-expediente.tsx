/**
 * Acciones de la ficha de un expediente — ClickUp S5 · #357.
 *
 * Editar y eliminar, cada uno con su permiso: escribir para lo primero,
 * `expedientes.eliminar` para lo segundo, que en `db/seed.sql` solo tiene
 * `super_admin`. El servidor decide y aquí solo se muestra lo concedido —
 * enseñar un botón que va a responder "no autorizado" es peor que no tenerlo.
 *
 * El borrado se niega si el joven tiene vida registrada (notas, matrícula,
 * citas). Ver `eliminarExpediente` en `server/estudiantes/actions.ts`.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { eliminarExpediente } from "@/server/estudiantes/actions";
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

export interface TextosAccionesExpediente {
  menu: string;
  editar: string;
  eliminar: string;
  confirmarTitulo: string;
  confirmarTexto: string;
  enUsoTitulo: string;
  enUsoTexto: string;
  /** enrollments · grades · history · appointments · notes · service */
  dependencias: Record<string, string>;
  eliminando: string;
  entendido: string;
  cancelar: string;
  cerrar: string;
  errorGeneral: string;
}

export function AccionesExpediente({
  id,
  nombre,
  rutaListado,
  puedeEditar,
  puedeEliminar,
  textos,
}: {
  id: string;
  nombre: string;
  rutaListado: string;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  textos: TextosAccionesExpediente;
}) {
  const router = useRouter();
  const [borrando, setBorrando] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [enUso, setEnUso] = React.useState<{ clave: string; total: number }[] | null>(
    null,
  );

  if (!puedeEditar && !puedeEliminar) return null;

  function cerrar(v: boolean) {
    if (!v) {
      setError(null);
      setEnUso(null);
    }
    setBorrando(v);
  }

  async function confirmar() {
    setError(null);
    setEnviando(true);
    try {
      const r = await eliminarExpediente({ id });
      if (r.ok) {
        // Al listado y no a la ficha: la ficha ya no existe.
        router.push(rutaListado);
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={textos.menu}>
            <MoreHorizontal aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {puedeEditar && (
            <DropdownMenuItem asChild>
              <Link href={`${rutaListado}/${id}/editar`}>
                <Pencil aria-hidden />
                {textos.editar}
              </Link>
            </DropdownMenuItem>
          )}
          {puedeEliminar && (
            <DropdownMenuItem
              onSelect={() => setBorrando(true)}
              className="text-destructive focus:text-destructive [&_svg]:text-destructive"
            >
              <Trash2 aria-hidden />
              {textos.eliminar}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={borrando} onOpenChange={cerrar}>
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
                  <span className="tabular-nums font-semibold tabular-nums">{d.total}</span>
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
    </>
  );
}
