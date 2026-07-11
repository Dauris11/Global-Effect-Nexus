/**
 * Barra lateral del portal. Recibe ya filtrados los ítems permitidos para el
 * rol (el layout aplica el RBAC) y resalta la ruta activa. Los iconos son de
 * lucide-react (sin emojis, por convención del proyecto).
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
import { Logo } from "@/components/brand/logo";
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

export function Sidebar({ items }: { items: NavItem[] }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:block">
      <div className="flex h-14 items-center bg-brand-charcoal px-5">
        <Logo className="h-5 w-auto" />
      </div>
      <nav className="space-y-1 px-3 py-2">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {Icon && <Icon className="size-4 shrink-0" />}
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
