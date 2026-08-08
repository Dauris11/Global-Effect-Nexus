"use client";

/**
 * Barra lateral del portal (escritorio).
 * Implementada con el diseño "Rail" solicitado.
 */
import { cn } from "@/lib/utils";
import { NavList } from "./nav-list";
import type { NavItem } from "@/lib/nav";
import { HelpCircle } from "lucide-react";

export function Sidebar({ items }: { items: NavItem[] }) {
  return (
    <aside
      className={cn(
        "flex flex-col items-center bg-[#1F3D2E]",
        "py-[22px] pb-[18px]",
        "w-[84px] h-screen sticky top-0 z-20",
        // En móvil se vuelve bottom bar (adaptación responsiva)
        "max-md:fixed max-md:bottom-0 max-md:top-auto max-md:left-0 max-md:right-0 max-md:h-auto max-md:w-full max-md:flex-row max-md:px-2.5 max-md:py-2.5 max-md:shadow-[0_-6px_20px_rgba(0,0,0,0.15)] max-md:justify-around"
      )}
      aria-label="Navegación principal"
    >
      {/* Logo mark: anillos concéntricos */}
      <svg 
        className="w-10 h-10 mb-[30px] text-[#E7A73E] shrink-0 max-md:hidden" 
        viewBox="0 0 40 40" 
        fill="none" 
        aria-hidden="true"
      >
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.4" opacity="0.35"/>
        <circle cx="20" cy="20" r="12.5" stroke="currentColor" strokeWidth="1.6" opacity="0.65"/>
        <circle cx="20" cy="20" r="7" fill="currentColor"/>
      </svg>
      
      <div className="flex flex-col gap-1.5 w-full items-center flex-1 max-md:flex-row max-md:justify-around">
        <NavList items={items} />
      </div>

      <div className="w-8 h-[1px] bg-white/12 my-2.5 shrink-0 max-md:hidden" />

      <a 
        href="#" 
        className="w-14 h-14 rounded-full bg-[#28503C] border border-white/15 flex items-center justify-center text-[#E7A73E] no-underline transition-transform hover:-translate-y-0.5 shrink-0 max-md:w-11 max-md:h-11" 
        title="Soporte técnico"
      >
        <HelpCircle className="w-[22px] h-[22px] stroke-[1.6px]" />
      </a>
    </aside>
  );
}
