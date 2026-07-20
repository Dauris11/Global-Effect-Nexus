/**
 * Barra lateral del portal (escritorio). Superficie de tinta (charcoal) de
 * marca: sobria y premium (referencia Linear/Notion), con el wordmark blanco
 * arriba y la navegación filtrada por rol (el RBAC lo aplica el layout). La
 * franja inferior recuerda que es la plataforma de la Fundación.
 */
import { Logo } from "@/components/brand/logo";
import { NavList } from "./nav-list";
import type { NavItem } from "@/lib/nav";

export function Sidebar({ items }: { items: NavItem[] }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-brand-charcoal md:flex">
      <div className="flex h-16 items-center px-6">
        <Logo className="h-6 w-auto" />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <NavList items={items} tone="dark" />
      </div>
      <div className="border-t border-white/10 px-6 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
          Fundación Global Effect
        </p>
      </div>
    </aside>
  );
}
