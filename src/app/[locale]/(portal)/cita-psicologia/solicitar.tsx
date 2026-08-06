/**
 * Formulario de solicitud de cita (estudiante).
 *
 * Solo fecha y hora. No hay campo de motivo a propósito: lo que el joven
 * quiera contar lo cuenta en la cita, no en un formulario que queda escrito en
 * una tabla antes de hablar con nadie.
 *
 * `min` en la fecha impide pedir para ayer; la validación real la hace la
 * Server Action, esto solo evita el intento.
 */
"use client";

import { useState, useTransition } from "react";
import { CalendarPlus, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { solicitarCita } from "@/server/psicologia/actions";

export function SolicitarCitaForm({ estudianteId }: { estudianteId: string }) {
  const [error, setError] = useState("");
  const [hecho, setHecho] = useState(false);
  const [enviando, enviar] = useTransition();

  const hoy = new Date().toISOString().slice(0, 10);

  function onSubmit(datos: FormData) {
    setError("");
    setHecho(false);
    enviar(async () => {
      try {
        await solicitarCita({
          estudiante_id: estudianteId,
          fecha: datos.get("fecha"),
          hora: datos.get("hora") || undefined,
        });
        setHecho(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo pedir la cita.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CalendarPlus aria-hidden className="h-4 w-4" />
          Pedir una cita
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fecha">
                Día <span className="text-destructive">*</span>
              </Label>
              <Input id="fecha" name="fecha" type="date" min={hoy} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hora">Hora preferida</Label>
              <Input id="hora" name="hora" type="time" />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            El equipo de psicología confirmará la hora. Si prefieres no indicar
            ninguna, déjala vacía.
          </p>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          {hecho && (
            <p
              role="status"
              className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              <CheckCircle2 aria-hidden className="h-4 w-4 shrink-0 text-emerald-600" />
              Cita pedida. Aparece abajo como programada.
            </p>
          )}

          <Button type="submit" disabled={enviando} className="w-full">
            {enviando ? "Enviando…" : "Pedir cita"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
