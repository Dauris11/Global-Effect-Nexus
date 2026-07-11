/**
 * Barra superior del portal: identidad del usuario activo (nombre · rol) y
 * botón de cerrar sesión (Server Action `cerrarSesion` enlazada al idioma).
 */
"use client";

import { LogOut } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cerrarSesion } from "@/server/auth/actions";
import { Button } from "@/components/ui/button";
import { IconMark } from "@/components/brand/icon-mark";

export function TopBar({ nombre, rol }: { nombre: string; rol: string }) {
  const t = useTranslations("auth");
  const locale = useLocale();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        {/* Marca compacta en móvil (el sidebar se oculta) */}
        <span className="flex items-center rounded-md bg-brand-charcoal px-1.5 py-1.5 md:hidden">
          <IconMark className="h-5 w-auto" />
        </span>
        <div className="text-sm text-muted-foreground">
          {nombre} · <span className="font-medium capitalize">{rol}</span>
        </div>
      </div>
      <form action={cerrarSesion.bind(null, locale)}>
        <Button type="submit" variant="ghost" size="sm">
          <LogOut className="size-4" />
          {t("signOut")}
        </Button>
      </form>
    </header>
  );
}
