/**
 * NavList — navegación compartida por la barra lateral (escritorio) y el cajón
 * móvil. Resalta la ruta activa con una barra teal a la izquierda que se desliza
 * (transición corta, sin coste de layout). Iconos de lucide (sin emojis).
 */
"use client";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  HeartHandshake,
  Wallet,
  Brain,
  Calendar,
  BarChart3,
  Settings,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  GraduationCap,
  HeartHandshake,
  Wallet,
  Brain,
  Calendar,
  BarChart3,
  Settings,
  Utensils,
};

export function NavList({
  items,
  onNavigate,
  tone = "dark",
}: {
  items: NavItem[];
  /** Se invoca al pulsar un enlace (para cerrar el cajón móvil). */
  onNavigate?: () => void;
  /** `dark` para el sidebar (charcoal); `light` para el cajón móvil. */
  tone?: "dark" | "light";
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
              tone === "dark"
                ? active
                  ? "bg-white/[0.07] text-white"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                : active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {/* Indicador activo: barra teal que aparece a la izquierda */}
            <span
              className={cn(
                "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200 ease-out",
                active ? "opacity-100" : "scale-y-0 opacity-0",
              )}
            />
            {Icon && (
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  active && tone === "dark" && "text-primary",
                )}
              />
            )}
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
