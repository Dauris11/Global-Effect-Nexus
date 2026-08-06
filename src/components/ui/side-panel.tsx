/**
 * SidePanel — panel de detalle que entra desde la derecha.
 *
 * Patrón tomado de Asana (estándar §10): al abrir el detalle de un registro,
 * el contexto de la lista o el tablero sigue visible detrás, así que el
 * usuario puede saltar de una tarea a otra sin cerrar y volver a abrir.
 *
 * Se apoya en Radix Dialog para no reimplementar foco atrapado, `Esc` y
 * devolución del foco. La única diferencia es la posición y la animación.
 */
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const SidePanel = DialogPrimitive.Root;
const SidePanelTrigger = DialogPrimitive.Trigger;
const SidePanelClose = DialogPrimitive.Close;

function SidePanelContent({
  className,
  children,
  etiquetaCerrar = "Cerrar",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  etiquetaCerrar?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          // Velo muy tenue: el tablero de atrás debe seguir siendo legible.
          "fixed inset-0 z-50 bg-brand-deep/25",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col",
          "border-l border-border bg-surface shadow-lg",
          "duration-250 ease-out",
          "data-[state=open]:animate-in data-[state=open]:slide-in-from-right",
          "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "absolute right-4 top-4 rounded-sm p-1.5 text-muted-foreground transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <X className="size-4" />
          <span className="sr-only">{etiquetaCerrar}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function SidePanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("shrink-0 border-b border-border px-6 py-5 pr-14", className)}
      {...props}
    />
  );
}

function SidePanelBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex-1 overflow-y-auto px-6 py-5", className)} {...props} />;
}

function SidePanelFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-border px-6 py-4",
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function SidePanelTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold leading-tight", className)}
      {...props}
    />
  );
}

function SidePanelDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("mt-1 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  SidePanel,
  SidePanelTrigger,
  SidePanelClose,
  SidePanelContent,
  SidePanelHeader,
  SidePanelBody,
  SidePanelFooter,
  SidePanelTitle,
  SidePanelDescription,
};
