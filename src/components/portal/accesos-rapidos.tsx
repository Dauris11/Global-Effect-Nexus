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
  textoEnlace?: string;
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
              "h-full rounded-[1.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden",
              a.disponible === false
                ? "opacity-60"
                : "cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md",
            )}
          >
            <CardContent className="p-5 flex flex-col h-full bg-white dark:bg-[#18181c]">
              <span
                aria-hidden
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  a.azulejo,
                )}
              >
                <Icono className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-slate-200">{a.titulo}</h3>
              <p className="mt-1 text-xs text-slate-500 flex-1">
                {a.disponible === false ? "Próximamente" : a.descripcion}
              </p>
              
              {a.disponible !== false && (
                <div className="mt-4 flex items-center text-xs font-semibold text-slate-800 dark:text-slate-300">
                  {a.textoEnlace ?? "Ver detalles"} <svg className="ml-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              )}
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
