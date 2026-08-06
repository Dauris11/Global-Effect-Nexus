"use client";

/**
 * Barra lateral del portal (escritorio).
 * Ahora con tema claro, bordes sutiles y capacidad de colapsarse para dar
 * más espacio al contenido principal.
 */
import { useState } from "react";
import { ChevronLeft, Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { NavList } from "./nav-list";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav";

export function Sidebar({ items }: { items: NavItem[] }) {
  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col transition-all duration-300 md:flex",
        "bg-[#0a6a8a] text-white shadow-lg dark:bg-[#0c232f] border-r border-white/10",
        "w-[90px]",
        "sticky top-0 h-screen z-20"
      )}
    >
      <div className="flex flex-col h-full w-full overflow-hidden items-center py-6">
        
        {/* Logo (Brand Mark Circle) */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white shrink-0 mb-8 bg-white/10">
           <div className="h-4 w-4 bg-white rounded-full shadow-sm" />
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full scrollbar-hide relative z-10 px-2">
          <NavList items={items} isCollapsed={true} />
        </div>

        {/* Ayuda Widget (Bottom) */}
        <div className="mt-auto pt-6 shrink-0">
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/15 transition-colors">
            <span className="font-bold text-sm">?</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
