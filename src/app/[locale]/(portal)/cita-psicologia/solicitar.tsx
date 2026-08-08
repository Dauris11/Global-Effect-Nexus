/**
 * Formulario de solicitud de cita (estudiante).
 *
 * El día se elige en el calendario, no en un `<input type="date">`: el joven ve
 * el mes completo y sus citas ya pedidas marcadas, así que no vuelve a pedir
 * para un día en el que ya tiene una.
 *
 * Sigue sin haber campo de motivo, por la razón que traía el formulario
 * original: lo que quiera contar lo cuenta en la cita, no en un formulario que
 * queda escrito en una tabla antes de hablar con nadie. La Server Action acepta
 * un motivo opcional por si algún día se decide lo contrario.
 *
 * El expediente NO viaja en el formulario. La acción lo resuelve desde la
 * sesión; mandarlo desde aquí dejaría agendar a nombre de otro estudiante.
 */
"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarPlus, CheckCircle2, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MiniCalendar } from "@/components/portal/mini-calendar";
import { solicitarCita } from "@/server/psicologia/actions";
import type { PsicologoAsignado } from "@/server/psicologia/types";

export function SolicitarCitaForm({
  psicologo,
  fechasOcupadas,
}: {
  /** Psicólogo de cabecera; `null` si administración aún no lo asignó. */
  psicologo: PsicologoAsignado | null;
  /** Días en los que el joven ya tiene cita, para marcarlos en el calendario. */
  fechasOcupadas: string[];
}) {
  const [fecha, setFecha] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [hecho, setHecho] = useState(false);
  const [enviando, enviar] = useTransition();

  const hoy = new Date();

  function onSubmit(datos: FormData) {
    setError("");
    setHecho(false);

    if (!fecha) {
      setError("Elige un día en el calendario.");
      return;
    }

    enviar(async () => {
      try {
        await solicitarCita({
          // `format` y no `toISOString`: este último pasa por UTC y en
          // República Dominicana devolvería el día anterior.
          fecha: format(fecha, "yyyy-MM-dd"),
          hora: datos.get("hora") || undefined,
        });
        setHecho(true);
        setFecha(null);
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
          {psicologo ? (
            <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <UserRound aria-hidden className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Tu psicólogo
                </p>
                <p className="truncate text-sm font-semibold">{psicologo.nombre}</p>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              Todavía no tienes un psicólogo asignado. Puedes pedir la cita igual:
              el equipo la recibe y te asigna a alguien.
            </p>
          )}

          <div className="space-y-1.5">
            <Label>
              Día <span className="text-destructive">*</span>
            </Label>
            <MiniCalendar
              fechasConEventos={fechasOcupadas}
              onSeleccionar={setFecha}
              seleccionada={fecha}
              minima={hoy}
            />
            <p aria-live="polite" className="text-xs text-muted-foreground">
              {fecha
                ? `Elegiste el ${format(fecha, "EEEE d 'de' MMMM", { locale: es })}.`
                : "Toca un día del calendario."}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hora">Hora preferida</Label>
            <Input id="hora" name="hora" type="time" />
            <p className="text-xs text-muted-foreground">
              El equipo de psicología confirmará la hora. Si prefieres no indicar
              ninguna, déjala vacía.
            </p>
          </div>

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
              Cita pedida. Aparece abajo como programada y avisamos a psicología.
            </p>
          )}

          <Button type="submit" disabled={enviando || !fecha} className="w-full">
            {enviando ? "Enviando…" : "Pedir cita"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
