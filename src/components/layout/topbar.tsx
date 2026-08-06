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
    <header className="flex w-full items-center justify-between py-2 mb-2">
      {/* Izquierda: Título de la Fundación y Portal */}
      <div className="flex items-center gap-3">
        <MobileNav items={items} />
        <div className="hidden md:flex flex-col">
          <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-[#2096ba] dark:text-[#38bdf8]">
            Fundación Global Effect
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Portal del Estudiante
          </h1>
        </div>
      </div>

      {/* Derecha: Selector de Idioma, Tema y Usuario */}
      <div className="flex items-center gap-3">
        <SelectorIdioma tone="light" />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-full bg-white dark:bg-[#18181c] border border-slate-200/80 dark:border-zinc-800 p-1.5 pr-4 shadow-sm outline-none transition-all hover:bg-slate-50 dark:hover:bg-zinc-800/50">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a6a8a] dark:bg-[#2096ba] text-xs font-bold text-white shadow-sm">
              {iniciales(nombre)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-bold leading-tight text-slate-900 dark:text-white">
                {nombre}
              </span>
              <span className="block text-[10px] font-medium capitalize leading-tight text-slate-500 dark:text-slate-400">
                {rol.replace(/_/g, " ")}
              </span>
            </span>
            <ChevronDown className="size-3.5 text-slate-400 ml-1" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
            <DropdownMenuLabel className="px-3 py-2">
              <span className="block text-sm font-bold text-slate-900 dark:text-white">{nombre}</span>
              <span className="block text-xs capitalize text-slate-500 dark:text-slate-400">
                {rol.replace(/_/g, " ")}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form action={cerrarSesion.bind(null, locale)}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full cursor-pointer text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
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
