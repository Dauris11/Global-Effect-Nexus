/**
 * Psicólogo de cabecera del expediente — migración 0021.
 *
 * Quién ve esto: solo el equipo con `psicologia.leer`. La tarjeta entera se
 * omite para el resto en vez de mostrarse en gris; el expediente lo llevan
 * administración y psicología, pero a quién acompaña a cada joven lo decide
 * psicología.
 *
 * Quién puede cambiarlo: `psicologia.escribir`. Sin él la tarjeta se ve pero no
 * trae selector — enseñar un control que va a responder "no autorizado" es peor
 * que no tenerlo (mismo criterio que `acciones-expediente.tsx`).
 *
 * Guarda al elegir, sin botón de confirmar: es un campo único y reversible, y
 * un "Guardar" aparte solo añade un paso donde no hay nada que revisar. El
 * error, si lo hay, se muestra y el selector vuelve al valor anterior.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, UserRound } from "lucide-react";
import { asignarPsicologo } from "@/server/psicologia/actions";
import type { PsicologoAsignado } from "@/server/psicologia/types";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Valor centinela del "sin asignar": Radix Select no admite `value=""`. */
const SIN_ASIGNAR = "__ninguno__";

export interface TextosPsicologoAsignado {
  titulo: string;
  etiqueta: string;
  sinAsignar: string;
  sinAsignarPista: string;
  soloLectura: string;
  guardando: string;
  error: string;
  ayuda: string;
}

export function PsicologoDelExpediente({
  estudianteId,
  asignado,
  disponibles,
  puedeAsignar,
  textos,
}: {
  estudianteId: string;
  asignado: PsicologoAsignado | null;
  /** Psicólogos activos. Llega vacío si no hay ninguno dado de alta. */
  disponibles: PsicologoAsignado[];
  puedeAsignar: boolean;
  textos: TextosPsicologoAsignado;
}) {
  const router = useRouter();
  const [valor, setValor] = React.useState(asignado?.id ?? SIN_ASIGNAR);
  const [guardando, setGuardando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function cambiar(nuevo: string) {
    const anterior = valor;
    setValor(nuevo);
    setError(null);
    setGuardando(true);
    try {
      await asignarPsicologo({
        estudiante_id: estudianteId,
        psicologo_id: nuevo === SIN_ASIGNAR ? null : nuevo,
      });
      // `refresh` y no un estado local: el nombre asignado se lee en el
      // servidor, y así la pantalla queda con el dato real y no con el que
      // este componente cree haber guardado.
      router.refresh();
    } catch {
      setValor(anterior);
      setError(textos.error);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
          <Heart aria-hidden className="size-4" />
        </span>

        <div className="min-w-0 flex-1 space-y-3">
          <p className="tabular-nums text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {textos.titulo}
          </p>

          {puedeAsignar ? (
            <div className="space-y-1.5">
              <Label htmlFor="psicologo">{textos.etiqueta}</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={valor}
                  onValueChange={cambiar}
                  disabled={guardando || disponibles.length === 0}
                >
                  <SelectTrigger id="psicologo" className="max-w-sm">
                    <SelectValue placeholder={textos.sinAsignar} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SIN_ASIGNAR}>{textos.sinAsignar}</SelectItem>
                    {disponibles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {guardando && (
                  <span
                    role="status"
                    className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
                  >
                    <Loader2 aria-hidden className="size-3.5 animate-spin" />
                    {textos.guardando}
                  </span>
                )}
              </div>

              <p className="text-[13px] text-muted-foreground">
                {disponibles.length === 0 ? textos.sinAsignarPista : textos.ayuda}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-[15px] font-medium">
                <UserRound aria-hidden className="size-4 text-muted-foreground" />
                {asignado?.nombre ?? textos.sinAsignar}
              </p>
              <p className="text-[13px] text-muted-foreground">{textos.soloLectura}</p>
            </div>
          )}

          {error && (
            <p role="alert" className="text-[13px] text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
