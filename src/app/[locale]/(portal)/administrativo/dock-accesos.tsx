/**
 * Riel de accesos del portal administrativo — ClickUp S9 · #458.
 *
 * Envuelve el `Dock` vertical para poder usarlo desde una página de servidor:
 * los iconos viajan **por nombre** y se resuelven aquí, del lado del cliente,
 * porque React no serializa componentes a través de esa frontera (es la misma
 * razón por la que existe `components/ui/icono.tsx`).
 *
 * El ítem de la ruta activa queda marcado, así que el riel también dice dónde
 * está el usuario, no solo a dónde puede ir.
 */
"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Icono } from "@/components/ui/icono";
import { Dock, DockItem, DockIcon, DockLabel } from "@/components/ui/dock";

export interface AccesoDock {
  href: string;
  label: string;
  /** Nombre del icono en el registro de `components/ui/icono.tsx`. */
  icono: string;
}

export function DockAccesos({
  accesos,
  className,
}: {
  accesos: AccesoDock[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <Dock className={className}>
      {accesos.map((a) => {
        const activo = pathname === a.href;
        return (
          <DockItem key={a.href}>
            <DockLabel>{a.label}</DockLabel>
            <Link
              href={a.href}
              aria-label={a.label}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "flex size-full items-center justify-center rounded-xl",
                "transition-colors duration-150 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activo
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-primary",
              )}
            >
              <DockIcon>
                <Icono nombre={a.icono} />
              </DockIcon>
            </Link>
          </DockItem>
        );
      })}
    </Dock>
  );
}
