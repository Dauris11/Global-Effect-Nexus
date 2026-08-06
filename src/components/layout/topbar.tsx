/**
 * Barra superior del portal: menú móvil (izquierda), y a la derecha el
 * conmutador de tema y el menú de usuario (nombre · rol · cerrar sesión, vía la
 * Server Action `cerrarSesion` ligada al idioma). En móvil muestra la marca
 * compacta porque el sidebar se oculta.
 */
"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cerrarSesion } from "@/server/auth/actions";
import { IconMark } from "@/components/brand/icon-mark";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { SelectorIdioma } from "./selector-idioma";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { NavItem } from "@/lib/nav";

/** Iniciales para el avatar (máx. 2). */
function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function TopBar({
  nombre,
  rol,
  items,
}: {
  nombre: string;
  rol: string;
  items: NavItem[];
}) {
  const t = useTranslations("auth");
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <MobileNav items={items} />
        <span className="flex items-center rounded-md bg-foreground px-1.5 py-1.5 md:hidden">
          <IconMark className="h-5 w-auto" />
        </span>
      </div>

      <div className="flex items-center gap-1">
        <SelectorIdioma className="mr-1" />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 outline-none transition-colors hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/12 tabular-nums text-xs font-semibold text-primary">
              {iniciales(nombre)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium leading-tight text-foreground">
                {nombre}
              </span>
              <span className="block text-xs capitalize leading-tight text-muted-foreground">
                {rol.replace(/_/g, " ")}
              </span>
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <span className="block text-sm font-medium text-foreground">{nombre}</span>
              <span className="block capitalize text-muted-foreground">
                {rol.replace(/_/g, " ")}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form action={cerrarSesion.bind(null, locale)}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full">
                  <LogOut />
                  {t("signOut")}
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
