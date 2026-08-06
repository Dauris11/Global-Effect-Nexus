/**
 * Formulario público de inscripción de comida con selección de VARIOS días
 * de la semana (pre-registro anticipado). Usa `useActionState` sobre
 * `inscribirVariosDiasForm` y muestra el desglose por día.
 */
"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { inscribirVariosDiasForm } from "@/server/comida";
import type { ResultadoMultiple } from "@/server/comida";
import { Button } from "@/components/ui/button";

const inicial: ResultadoMultiple = {
  procesado: false,
  confirmados: [],
  duplicados: [],
  rechazados: [],
};

export interface DiaOpcion {
  value: string;
  label: string;
  disabled: boolean;
}

export function MealForm({ dias }: { dias: DiaOpcion[] }) {
  const t = useTranslations("comida");
  const router = useRouter();
  const [state, action, pending] = useActionState(inscribirVariosDiasForm, inicial);

  useEffect(() => {
    if (state.procesado && state.confirmados.length > 0) router.refresh();
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <input
        name="nombre"
        required
        placeholder={t("namePlaceholder")}
        className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t("chooseDays")}</legend>
        <div className="grid grid-cols-1 gap-2">
          {dias.map((d) => (
            <label
              key={d.value}
              className={`flex items-center gap-3 rounded-md border border-input px-3 py-2 text-sm ${
                d.disabled ? "opacity-40" : "cursor-pointer hover:bg-muted"
              }`}
            >
              <input
                type="checkbox"
                name="fechas"
                value={d.value}
                disabled={d.disabled}
                defaultChecked={!d.disabled && d.value === dias.find((x) => !x.disabled)?.value}
              />
              <span className="capitalize">{d.label}</span>
              {d.disabled && (
                <span className="ml-auto text-xs text-muted-foreground">{t("closed")}</span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" className="w-full" disabled={pending}>
        {t("submit")}
      </Button>

      {state.procesado && (
        <div className="space-y-1 rounded-md bg-muted p-3 text-sm">
          {state.confirmados.length > 0 && (
            <p className="flex items-center gap-2 font-medium text-primary">
              <CheckCircle2 className="size-4" />
              {t("registeredDays")}: {state.confirmados.length}
            </p>
          )}
          {state.duplicados.length > 0 && (
            <p className="text-amber-600">
              {t("alreadyDays")}: {state.duplicados.length}
            </p>
          )}
          {state.rechazados.length > 0 && (
            <p className="text-muted-foreground">
              {t("rejectedDays")}: {state.rechazados.length}
            </p>
          )}
          {state.confirmados.length === 0 &&
            state.duplicados.length === 0 &&
            state.rechazados.length === 0 && <p className="text-destructive">{t("invalid")}</p>}
        </div>
      )}
    </form>
  );
}
