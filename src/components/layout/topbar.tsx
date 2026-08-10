/**
 * Barra superior del portal: menú móvil (izquierda), y a la derecha el
 * conmutador de tema y el menú de usuario (nombre · rol · cerrar sesión, vía la
 * Server Action `cerrarSesion` ligada al idioma). En móvil muestra la marca
 * compacta porque el sidebar se oculta.
 */
"use client";

import { useState, useTransition } from "react";
import { ChevronDown, LogOut, Lock, Bell } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useLocale, useTranslations } from "next-intl";
import { cerrarSesion } from "@/server/auth/actions";
import { MODO_DISENO } from "@/lib/modo-diseno";
import { SelectorRolDiseno } from "./selector-rol-diseno";
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
import type { NavItem, PortalTheme } from "@/lib/nav";

/** Roles con título propio en `messages/*.json` (`portal.title.<rol>`). */
const ROLES_CON_TITULO = [
  "estudiante",
  "docente",
  "administrativo",
  "psicologo",
  "contabilidad",
  "admin",
  "super_admin",
];

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
  theme,
  permisos,
}: {
  nombre: string;
  rol: string;
  items: NavItem[];
  theme: PortalTheme;
  permisos?: string[] | null;
}) {
  const tAuth = useTranslations("auth");
  const tPortal = useTranslations("portal");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  // El TopBar es común a los siete portales: el título sale del rol, no de la
  // pantalla. Un rol sin título propio cae en el genérico.
  const claveTitulo = ROLES_CON_TITULO.includes(rol) ? rol : "default";

  return (
    <header
      className="flex w-full items-center justify-between py-3 mb-2 bg-white dark:bg-[#101322] border-b border-slate-200 dark:border-slate-800/60 rounded-xl px-4 mt-2 shadow-sm"
      style={
        {
          "--portal-primary": theme.primary,
          "--portal-hover": theme.hover,
        } as React.CSSProperties
      }
    >
      {/* Izquierda: Título de la Fundación y Portal */}
      <div className="flex items-center gap-3">
        <MobileNav items={items} />
        <div className="hidden md:flex">
          <Logo className="h-7 w-auto invert dark:invert-0" />
        </div>
      </div>

      {/* Derecha: Selector de Idioma, Selector de Rol (si modo diseño), Tema y Usuario */}
      <div className="flex items-center gap-4">
        {MODO_DISENO && <SelectorRolDiseno rolActual={rol} locale={locale} />}
        


        {/* Campana de Notificaciones */}
        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-500 hover:bg-[#e6f4f8] dark:hover:bg-zinc-800 hover:text-[#0a6a8a] transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        <SelectorIdioma tone="light" />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 outline-none group cursor-pointer">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a6a8a] text-sm font-bold text-white shadow-sm border-2 border-white dark:border-[#101322] group-hover:scale-105 transition-transform">
              {iniciales(nombre)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-bold leading-tight text-slate-900 dark:text-white">
                {nombre}
              </span>
              <span className="block text-xs font-medium capitalize leading-tight text-slate-500 dark:text-slate-400">
                {rol.replace(/_/g, " ")}
              </span>
            </span>
            <ChevronDown className="size-4 text-slate-400 ml-1 hidden sm:block group-hover:text-slate-600 transition-colors" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
            <DropdownMenuLabel className="px-3 py-2">
              <span className="block text-sm font-bold text-slate-900 dark:text-white">{nombre}</span>
              <span className="block text-xs capitalize text-slate-500 dark:text-slate-400">
                {rol.replace(/_/g, " ")}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 dark:text-red-400"
              disabled={isPending}
              onSelect={(e) => {
                e.preventDefault();
                startTransition(() => {
                  cerrarSesion(locale);
                });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {tAuth("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
