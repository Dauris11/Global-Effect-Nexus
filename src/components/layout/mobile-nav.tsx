/**
 * MobileNav — navegación en pantallas estrechas (el sidebar se oculta). Botón
 * de menú en el topbar que abre un cajón lateral (Radix Dialog) con la misma
 * lista de rutas. El cajón entra deslizándose desde la izquierda con curva
 * ease-drawer; el overlay hace un fundido. Cierra al navegar.
 */
"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import { NavList } from "./nav-list";
import type { NavItem } from "@/lib/nav";

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("portal");

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={t("openMenu")}
        className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95 md:hidden"
      >
        <Menu className="size-5" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-foreground/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 md:hidden" />
        <Dialog.Content
          className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-foreground shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left md:hidden"
          style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
        >
          <Dialog.Title className="sr-only">{t("menu")}</Dialog.Title>
          <div className="flex h-16 items-center justify-between px-6">
            <Logo className="h-6 w-auto" />
            <Dialog.Close
              aria-label={t("closeMenu")}
              className="flex size-9 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2">
            <NavList items={items} onNavigate={() => setOpen(false)} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
