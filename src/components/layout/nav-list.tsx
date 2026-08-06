/**
 * NavList — navegación compartida por la barra lateral (escritorio) y el cajón
 * móvil. Resalta la ruta activa con una barra a la izquierda que se desliza
 * (transición corta, sin coste de layout). Iconos de lucide (sin emojis).
 *
 * Los ítems marcados `disponible: false` en `lib/nav.ts` no se renderizan como
 * enlaces: son texto apagado con la etiqueta "Pronto". Un enlace que lleva a un
 * 404 se lee como una aplicación rota; un ítem visiblemente pendiente comunica
 * el alcance del sistema sin prometer nada que no esté.
 */
"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav";
import { iconoPorNombre } from "@/components/ui/icono";

export function NavList({
  items,
  onNavigate,
  tone = "dark",
  isCollapsed = false,
}: {
  items: NavItem[];
  /** Se invoca al pulsar un enlace (para cerrar el cajón móvil). */
  onNavigate?: () => void;
  /** `dark` para el sidebar (charcoal); `light` para el cajón móvil o sidebar claro. */
  tone?: "dark" | "light";
  /** Si es true, oculta el texto y solo muestra los iconos. */
  isCollapsed?: boolean;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  // Los pendientes van al final, separados: el menú de trabajo primero.
  const activos = items.filter((i) => i.disponible !== false);
  const pendientes = items.filter((i) => i.disponible === false);

  /**
   * Ruta activa: gana el ítem más específico. `/administrativo` y
   * `/administrativo/tareas` son dos ítems distintos, y estando en tareas solo
   * debe resaltarse el segundo.
   */
  const hrefActivo = activos
    .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav className="space-y-0.5">
      {activos.map((item) => {
        const Icon = iconoPorNombre(item.icon);
        const active = item.href === hrefActivo;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex flex-col cursor-pointer items-center justify-center gap-1.5 py-3 mx-1.5 text-[10px] font-bold transition-all rounded-[1rem]",
              active
                ? "bg-[#2096ba] text-white shadow-md shadow-[#2096ba]/20"
                : "text-white/70 hover:text-white hover:bg-white/10",
            )}
          >

            {Icon && (
              <Icon
                className={cn(
                  "size-5 shrink-0 transition-colors",
                )}
              />
            )}
            <span className="text-center w-full leading-tight">{t(item.labelKey)}</span>
          </Link>
        );
      })}

      {!isCollapsed && pendientes.length > 0 && (
        <>
          <p
            className={cn(
              "px-3 pb-1 pt-5 tabular-nums text-[10px] uppercase tracking-[0.14em]",
              tone === "dark" ? "text-slate-500" : "text-muted-foreground",
            )}
          >
            {t("comingSoonGroup")}
          </p>

          {pendientes.map((item) => {
            const Icon = iconoPorNombre(item.icon);
            return (
              <span
                key={item.href}
                // `aria-disabled` y no `disabled`: no es un control, es un
                // elemento informativo que no recibe foco.
                aria-disabled
                className={cn(
                  "flex cursor-default items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  tone === "dark" ? "text-slate-600" : "text-muted-foreground/60",
                )}
              >
                {Icon && <Icon className="size-4 shrink-0" />}
                <span className="flex-1">{t(item.labelKey)}</span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 tabular-nums text-[9px] uppercase tracking-wide",
                    tone === "dark"
                      ? "bg-white/[0.06] text-slate-500"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {t("comingSoon")}
                </span>
              </span>
            );
          })}
        </>
      )}
    </nav>
  );
}
