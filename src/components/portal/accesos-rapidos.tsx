/**
 * Rejilla de accesos rápidos — los módulos que cada rol usa a diario.
 *
 * Va justo debajo del banner porque es la navegación real del portal: el
 * sidebar tiene todo, pero esto son los tres o cuatro sitios a los que esa
 * persona entra de verdad.
 *
 * `azulejo` llega como par de clases literales (`bg-emerald-50
 * text-emerald-600`) para que Tailwind las compile.
 */
import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AccesoRapido {
  href: string;
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  azulejo: string;
  /**
   * `false` si la pantalla destino todavía no existe — misma convención que
   * `NavItem.disponible` en `lib/nav.ts`. El acceso se pinta apagado y sin
   * enlace: un 404 desde la portada del portal se lee como "esto está roto",
   * no como "esto llega en un sprint posterior".
   */
  disponible?: false;
}

export function AccesosRapidos({
  accesos,
  columnas = "sm:grid-cols-2 lg:grid-cols-4",
}: {
  accesos: AccesoRapido[];
  columnas?: string;
}) {
  return (
    <ul className={cn("grid gap-4", columnas)}>
      {accesos.map((a) => {
        const Icono = a.icono;

        const cuerpo = (
          <Card
            interactive={a.disponible !== false}
            className={cn(
              "h-full",
              a.disponible === false
                ? "opacity-60"
                : "cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md",
            )}
          >
            <CardContent className="p-5">
              <span
                aria-hidden
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  a.azulejo,
                )}
              >
                <Icono className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold">{a.titulo}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {a.disponible === false ? "Próximamente" : a.descripcion}
              </p>
            </CardContent>
          </Card>
        );

        return (
          <li key={a.href}>
            {a.disponible === false ? (
              <div aria-disabled className="block h-full">
                {cuerpo}
              </div>
            ) : (
              <Link href={a.href} className="block h-full">
                {cuerpo}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
