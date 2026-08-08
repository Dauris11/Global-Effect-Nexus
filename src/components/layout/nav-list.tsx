"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav";
import { iconoPorNombre } from "@/components/ui/icono";

export function NavList({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const activos = items.filter((i) => i.disponible !== false);

  const hrefActivo = activos
    .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <>
      {activos.map((item) => {
        const Icon = iconoPorNombre(item.icon);
        const active = item.href === hrefActivo;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-[5px] w-[68px] min-h-[64px] py-[9px] rounded-[11px] no-underline transition-colors duration-150 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
              "max-md:w-auto max-md:min-h-0 max-md:py-[6px] max-md:px-2",
              active
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "text-white/60 hover:text-white hover:bg-white/10",
            )}
          >
            {Icon && (
              <Icon
                className="w-[19px] h-[19px]"
                strokeWidth={1.7}
              />
            )}
            <span className="text-[9.5px] font-semibold tracking-[0.01em] text-center leading-[1.15]">
              {t(item.labelKey)}
            </span>
          </Link>
        );
      })}
    </>
  );
}
