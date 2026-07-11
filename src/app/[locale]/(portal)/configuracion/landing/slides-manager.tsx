/**
 * Gestor de diapositivas del hero (cliente). Permite crear una diapositiva,
 * activarla/desactivarla y eliminarla. Consume las Server Actions del dominio
 * landing; tras cada cambio refresca la vista. La lista usa auto-animate.
 */
"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Eye, EyeOff, Trash2, Plus } from "lucide-react";
import {
  guardarSlideForm,
  eliminarSlide,
  cambiarVisibilidadSlide,
  type GuardarSlideState,
} from "@/server/landing/actions";
import type { LandingSlide } from "@/server/landing/types";
import { Button } from "@/components/ui/button";

const input =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function SlidesManager({ slides }: { slides: LandingSlide[] }) {
  const router = useRouter();
  const [listRef] = useAutoAnimate<HTMLUListElement>();
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<GuardarSlideState, FormData>(
    guardarSlideForm,
    {},
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  const toggle = (s: LandingSlide) =>
    startTransition(async () => {
      await cambiarVisibilidadSlide({ id: s.id, activo: !s.activo });
      router.refresh();
    });

  const borrar = (s: LandingSlide) =>
    startTransition(async () => {
      await eliminarSlide({ id: s.id });
      router.refresh();
    });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Lista */}
      <ul ref={listRef} className="space-y-3">
        {slides.length === 0 && (
          <li className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No hay diapositivas. Crea la primera con el formulario.
          </li>
        )}
        {slides.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold">
              {s.orden}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{s.titulo}</div>
              {s.subtitulo && (
                <div className="truncate text-sm text-muted-foreground">{s.subtitulo}</div>
              )}
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                s.activo
                  ? "bg-brand-teal/10 text-brand-teal"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s.activo ? "Activa" : "Oculta"}
            </span>
            <button
              onClick={() => toggle(s)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={s.activo ? "Ocultar" : "Mostrar"}
            >
              {s.activo ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
            <button
              onClick={() => borrar(s)}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Eliminar"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      {/* Formulario de creación */}
      <form
        ref={formRef}
        action={action}
        className="h-fit space-y-3 rounded-xl border border-border bg-card p-5"
      >
        <h2 className="flex items-center gap-2 font-semibold">
          <Plus className="size-4" /> Nueva diapositiva
        </h2>
        <input name="titulo" required placeholder="Título" className={input} />
        <input name="subtitulo" placeholder="Subtítulo" className={input} />
        <textarea name="texto" placeholder="Texto" rows={2} className={`${input} h-auto`} />
        <input name="imagen_url" placeholder="URL de imagen (opcional)" className={input} />
        <div className="grid grid-cols-2 gap-2">
          <input name="cta_texto" placeholder="Botón (texto)" className={input} />
          <input name="cta_enlace" placeholder="Botón (enlace)" className={input} />
        </div>
        <div className="flex items-center gap-3">
          <input
            name="orden"
            type="number"
            defaultValue={0}
            min={0}
            className={`${input} w-24`}
            aria-label="Orden"
          />
          <label className="flex items-center gap-2 text-sm">
            <input name="activo" type="checkbox" defaultChecked /> Activa
          </label>
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          Guardar diapositiva
        </Button>
      </form>
    </div>
  );
}
