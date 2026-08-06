/**
 * Gestor de noticias del blog público.
 *
 * Convive con el gestor de diapositivas del hero en la misma pantalla: las dos
 * son la cara pública del sitio y las lleva la misma persona.
 *
 * El estado *publicada* se cambia desde la lista con un solo control, sin
 * abrir el formulario: retirar algo del sitio público tiene que ser inmediato,
 * y obligar a entrar en un diálogo para desmarcar una casilla mete fricción
 * justo donde no debe haberla.
 */
"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  guardarNoticia,
  cambiarPublicacionNoticia,
  eliminarNoticia,
} from "@/server/landing/actions";
import type { Noticia } from "@/server/landing/types";

type NoticiaAdmin = Noticia & { publicada: boolean };

export function NoticiasManager({ noticias }: { noticias: NoticiaAdmin[] }) {
  const [editando, setEditando] = useState<NoticiaAdmin | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState("");
  const [ocupado, actuar] = useTransition();

  function nueva() {
    setEditando(null);
    setError("");
    setAbierto(true);
  }

  function editar(n: NoticiaAdmin) {
    setEditando(n);
    setError("");
    setAbierto(true);
  }

  function onSubmit(datos: FormData) {
    setError("");
    actuar(async () => {
      try {
        await guardarNoticia({
          id: editando?.id,
          titulo: datos.get("titulo"),
          resumen: datos.get("resumen") || undefined,
          contenido: datos.get("contenido") || undefined,
          imagen_url: datos.get("imagen_url") || undefined,
          fecha: datos.get("fecha"),
          autor: datos.get("autor") || undefined,
          publicada: datos.get("publicada") === "on",
        });
        setAbierto(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar la noticia.");
      }
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold">Noticias del blog</h2>
          <p className="text-sm text-muted-foreground">
            Se muestran en la página de inicio junto a las actividades ya
            celebradas.
          </p>
        </div>
        <Button onClick={nueva}>
          <Plus aria-hidden />
          Nueva noticia
        </Button>
      </div>

      {noticias.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Newspaper}
              title="Sin noticias"
              description="Publica la primera y aparecerá en la página de inicio."
            />
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {noticias.map((n) => (
            <li key={n.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      {n.titulo}
                      <Badge
                        className={
                          n.publicada
                            ? "bg-emerald-100 text-[10px] text-emerald-700"
                            : "bg-slate-100 text-[10px] text-slate-600"
                        }
                      >
                        {n.publicada ? "Publicada" : "Borrador"}
                      </Badge>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {format(new Date(`${n.fecha}T00:00:00`), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                      {n.autor ? ` · ${n.autor}` : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={n.publicada ? "Retirar del sitio" : "Publicar"}
                      disabled={ocupado}
                      onClick={() =>
                        actuar(async () => {
                          await cambiarPublicacionNoticia({
                            id: n.id,
                            publicada: !n.publicada,
                          });
                        })
                      }
                    >
                      {n.publicada ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar"
                      onClick={() => editar(n)}
                    >
                      <Pencil aria-hidden />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Borrar"
                      disabled={ocupado}
                      onClick={() =>
                        actuar(async () => {
                          await eliminarNoticia({ id: n.id });
                        })
                      }
                    >
                      <Trash2 aria-hidden className="text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar noticia" : "Nueva noticia"}</DialogTitle>
          </DialogHeader>

          <form action={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titulo">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input id="titulo" name="titulo" defaultValue={editando?.titulo ?? ""} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="resumen">Resumen</Label>
              <Textarea
                id="resumen"
                name="resumen"
                rows={2}
                defaultValue={editando?.resumen ?? ""}
                placeholder="Dos líneas: es lo que se lee en la tarjeta."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contenido">Contenido</Label>
              <Textarea
                id="contenido"
                name="contenido"
                rows={5}
                defaultValue={editando?.contenido ?? ""}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fecha">
                  Fecha <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  defaultValue={editando?.fecha ?? new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="autor">Autor</Label>
                <Input id="autor" name="autor" defaultValue={editando?.autor ?? ""} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="imagen_url">Imagen (URL)</Label>
              <Input
                id="imagen_url"
                name="imagen_url"
                defaultValue={editando?.imagen_url ?? ""}
                placeholder="Opcional. Sin imagen, la tarjeta se muestra solo con texto."
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="publicada"
                defaultChecked={editando?.publicada ?? false}
                className="size-4 rounded border-input"
              />
              Visible en la página de inicio
            </label>

            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={ocupado}>
                {ocupado ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
