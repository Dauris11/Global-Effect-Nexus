/**
 * Tarjeta de lista — el bloque de "últimos N" que remata cada portal.
 *
 * El título va en `text-sm text-muted-foreground` a propósito: la lista es lo
 * que importa, no su encabezado, y un título fuerte competiría con el banner
 * de rol que está justo encima.
 *
 * `ItemLista` y `EstadoVacio` se exportan por separado para que cada portal
 * componga sus filas con los datos y colores que le tocan.
 */
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CardLista({
  titulo,
  icono: Icono,
  accion,
  children,
}: {
  titulo: string;
  icono?: LucideIcon;
  /** Insignia o control a la derecha del título (p. ej. "Confidencial"). */
  accion?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {Icono && <Icono aria-hidden className="h-4 w-4" />}
          {titulo}
        </CardTitle>
        {accion}
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
}

export function ItemLista({
  icono: Icono,
  azulejo,
  titulo,
  detalle,
  derecha,
}: {
  icono: LucideIcon;
  azulejo: string;
  titulo: string;
  detalle?: string;
  derecha?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-transparent bg-muted/40 p-3">
      <span
        aria-hidden
        className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", azulejo)}
      >
        <Icono className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="portal-text line-clamp-2 text-sm font-medium leading-5">{titulo}</p>
        {detalle && <p className="portal-text line-clamp-2 text-xs leading-4 text-muted-foreground">{detalle}</p>}
      </div>

      {derecha && <div className="shrink-0 self-center">{derecha}</div>}
    </div>
  );
}

export function EstadoVacio({ mensaje }: { mensaje: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{mensaje}</p>;
}
