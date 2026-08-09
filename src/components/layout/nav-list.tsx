"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { hojasNav, type NavItem } from "@/lib/nav";
import { iconoPorNombre } from "@/components/ui/icono";

function claveItem(item: NavItem) {
  return item.href ?? item.labelKey;
}

function itemActivo(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function estiloEnlace(active: boolean) {
  return cn(
    "flex flex-col items-center justify-center gap-[5px] w-[68px] min-h-[64px] py-[9px] rounded-[11px] no-underline transition-colors duration-150 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
    "max-md:w-auto max-md:min-h-0 max-md:py-[6px] max-md:px-2",
    active
      ? "bg-[var(--portal-primary)] text-[var(--portal-primary-foreground)] shadow-sm"
      : "text-white/60 hover:text-white hover:bg-[var(--portal-hover-soft)]",
  );
}

function NavLink({
  item,
  active,
  onNavigate,
  compact,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const t = useTranslations("nav");
  const Icon = iconoPorNombre(item.icon);

  if (!item.href) return null;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        estiloEnlace(active),
        compact && "w-full min-h-0 flex-row justify-start gap-3 px-3 py-2 rounded-lg max-md:w-full",
      )}
    >
      {Icon && <Icon className={cn("w-[19px] h-[19px]", compact && "shrink-0")} strokeWidth={1.7} />}
      <span
        className={cn(
          "text-[9.5px] font-semibold tracking-[0.01em] text-center leading-[1.15]",
          compact && "text-sm text-left",
        )}
      >
        {t(item.labelKey)}
      </span>
    </Link>
  );
}

function NavGroup({
  item,
  pathname,
  hrefActivo,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  hrefActivo?: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const Icon = iconoPorNombre(item.icon);
  const hijos = (item.children ?? []).filter((c) => c.disponible !== false && c.href);
  const activo = hijos.some((h) => h.href && itemActivo(pathname, h.href));

  return (
    <div
      className="relative w-full flex justify-center max-md:w-auto"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={cn(estiloEnlace(activo), "cursor-pointer border-0 bg-transparent max-md:min-w-0")}
      >
        {Icon && <Icon className="w-[19px] h-[19px]" strokeWidth={1.7} />}
        <span className="text-[9.5px] font-semibold tracking-[0.01em] text-center leading-[1.15]">
          {t(item.labelKey)}
        </span>
      </button>

      {open && hijos.length > 0 && (
        <div
          className={cn(
            "absolute left-full top-0 z-50 ml-2 min-w-[180px] rounded-xl border border-white/10 bg-[var(--portal-sidebar-edge)] py-1.5 shadow-xl",
            "max-md:fixed max-md:left-1/2 max-md:top-auto max-md:bottom-[72px] max-md:-translate-x-1/2 max-md:ml-0",
          )}
          role="menu"
        >
          {hijos.map((hijo) => (
            <Link
              key={claveItem(hijo)}
              href={hijo.href!}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              aria-current={hijo.href === hrefActivo ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-sm no-underline transition-colors",
                hijo.href === hrefActivo
                  ? "bg-[var(--portal-primary)] text-[var(--portal-primary-foreground)]"
                  : "text-white/80 hover:bg-[var(--portal-hover-soft)] hover:text-white",
              )}
            >
              {(() => {
                const HijoIcon = iconoPorNombre(hijo.icon);
                return HijoIcon ? <HijoIcon className="size-4 shrink-0" strokeWidth={1.7} /> : null;
              })()}
              {t(hijo.labelKey)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function NavList({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activos = items.filter((i) => i.disponible !== false);

  const hrefActivo = hojasNav(activos)
    .filter((i) => i.href && itemActivo(pathname, i.href))
    .sort((a, b) => (b.href!.length - a.href!.length))[0]?.href;

  return (
    <>
      {activos.map((item) => {
        if (item.children?.length) {
          return (
            <NavGroup
              key={claveItem(item)}
              item={item}
              pathname={pathname}
              hrefActivo={hrefActivo}
              onNavigate={onNavigate}
            />
          );
        }

        return (
          <NavLink
            key={claveItem(item)}
            item={item}
            active={item.href === hrefActivo}
            onNavigate={onNavigate}
          />
        );
      })}
    </>
  );
}
