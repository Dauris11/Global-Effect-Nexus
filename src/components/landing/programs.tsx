/**
 * Programas en bento grid (repartición por módulos). Un tile destacado (teal)
 * de Administración + tiles menores. Layout asimétrico en desktop; uniforme en
 * móvil. Hover con transform/opacity; foco visible (accesibilidad).
 */
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  Building2,
  GraduationCap,
  ClipboardList,
  Brain,
  Wallet,
  CalendarPlus,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface Tile {
  stem: string;
  icon: LucideIcon;
  href: string;
  span: string;
}

const FEATURE: Tile = {
  stem: "portalAdmin",
  icon: Building2,
  href: "/dashboard",
  span: "sm:col-span-2 lg:col-span-3 lg:row-span-2",
};

const TILES: Tile[] = [
  { stem: "portalTechnical", icon: GraduationCap, href: "/login", span: "sm:col-span-2 lg:col-span-3" },
  { stem: "portalAdministrative", icon: ClipboardList, href: "/login", span: "sm:col-span-2 lg:col-span-3" },
  { stem: "portalPsychology", icon: Brain, href: "/login", span: "lg:col-span-2" },
  { stem: "portalAccounting", icon: Wallet, href: "/login", span: "lg:col-span-2" },
  { stem: "portalAppointment", icon: CalendarPlus, href: "/login", span: "lg:col-span-2" },
];

export async function Programs() {
  const t = await getTranslations("landing");
  const locale = await getLocale();
  const L = (h: string) => `/${locale}${h}`;
  const Icon = FEATURE.icon;

  return (
    <section id="programas" aria-labelledby="programas-title" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-teal">
          {t("eyebrowAccess")}
        </p>
        <h2
          id="programas-title"
          className="mt-2 max-w-xl font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
        >
          {t("selectPortal")}
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[13rem]">
          {/* Tile destacado (teal) */}
          <Link
            href={L(FEATURE.href)}
            className={`group flex flex-col justify-between rounded-3xl bg-brand-teal p-7 text-white transition duration-200 ease-out hover:bg-brand-teal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-teal ${FEATURE.span}`}
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15">
              <Icon className="size-6" />
            </span>
            <div>
              <h3 className="font-display text-2xl font-semibold">{t(`${FEATURE.stem}Title`)}</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">
                {t(`${FEATURE.stem}Desc`)}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                {t("accessPortal")}
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* Tiles menores */}
          {TILES.map(({ stem, icon: TileIcon, href, span }) => (
            <Link
              key={stem}
              href={L(href)}
              className={`group flex flex-col justify-between rounded-3xl border border-border bg-card p-6 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-teal ${span}`}
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-teal/10 text-brand-teal">
                <TileIcon className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {t(`${stem}Title`)}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t(`${stem}Desc`)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
