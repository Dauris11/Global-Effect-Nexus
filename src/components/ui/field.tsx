/**
 * Field — envoltorio de un campo de formulario: etiqueta, control, ayuda y
 * error, con la asociación ARIA ya resuelta.
 *
 * Existe para que ningún formulario del sistema tenga que recordar cablear
 * `aria-describedby` ni `aria-invalid` a mano. El mensaje de error sustituye
 * al de ayuda (no se apilan) y se anuncia con `role="alert"`.
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

interface FieldProps {
  /** Texto de la etiqueta. */
  label: string;
  /** Texto de ayuda bajo el control; lo oculta el error si lo hay. */
  ayuda?: string;
  /** Mensaje de error. Su presencia marca el campo como inválido. */
  error?: string;
  /** Marca visualmente el campo como obligatorio. */
  requerido?: boolean;
  className?: string;
  /**
   * Recibe los props que el control debe reenviar (id y ARIA). Se usa como
   * función para poder aplicarlos al input real sea cual sea.
   */
  children: (props: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }) => React.ReactNode;
}

function Field({ label, ayuda, error, requerido, className, children }: FieldProps) {
  const id = React.useId();
  const idAyuda = `${id}-ayuda`;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {requerido && (
          <span className="ml-1 text-destructive" aria-hidden>
            *
          </span>
        )}
      </Label>

      {children({
        id,
        "aria-describedby": error || ayuda ? idAyuda : undefined,
        "aria-invalid": error ? true : undefined,
      })}

      {(error || ayuda) && (
        <p
          id={idAyuda}
          role={error ? "alert" : undefined}
          className={cn(
            "text-[13px] leading-snug",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {error ?? ayuda}
        </p>
      )}
    </div>
  );
}

export { Field };
