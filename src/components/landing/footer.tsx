/**
 * Footer institucional de la landing page.
 * Rediseño completo: tema oscuro profundo, acento púrpura, sin tokens viejos.
 */
"use client";

import { useTranslations } from "next-intl";
import { MapPin, Mail, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SelectorIdioma } from "@/components/layout/selector-idioma";

export function LandingFooter() {
  const t = useTranslations("landing");

  const secciones = [
    { label: t("navAccess"),   href: "#acceso"     },
    { label: t("navWork"),     href: "#labor"       },
    { label: t("navEventos"),  href: "#eventos"     },
    { label: t("navFaq"),      href: "#faq"         },
  ];

  const puertas = [
    { label: t("access_portal_title"), href: "/login"   },
    { label: t("access_meals_title"),  href: "/comida"  },
  ];

  return (
    <footer id="footer" className="relative bg-[#050810]">
      {/* Top separator line with glow */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#1d4ed8]/40 to-transparent"
      />
      {/* Top purple accent bar */}
      <div aria-hidden className="h-[2px] w-full bg-gradient-to-r from-[#1d4ed8] via-[#60a5fa] to-[#1d4ed8]" />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">

          {/* Brand column */}
          <div>
            {/* Logo mark */}
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-[#1d4ed8]/40 bg-[#1d4ed8]/15 font-bold text-lg text-white">
                G
              </span>
              <div>
                <p className="font-display text-sm font-bold text-white">Global Effect</p>
                <p className="tabular-nums text-[10px] uppercase tracking-[0.15em] text-white/35">Foundation</p>
              </div>
            </div>

            <p className="mt-5 max-w-xs text-sm italic leading-relaxed text-white/40">
              {t("footerTagline")}
            </p>

            <address className="mt-6 space-y-2.5 text-sm not-italic text-white/40">
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#60a5fa]" aria-hidden />
                <span>{t("footerAddress")}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-[#60a5fa]" aria-hidden />
                <a
                  href={`mailto:${t("footerEmail")}`}
                  className="transition-colors hover:text-white"
                >
                  {t("footerEmail")}
                </a>
              </p>
            </address>
          </div>

          {/* Nav column */}
          <div>
            <h3 className="mb-5 tabular-nums text-[10px] uppercase tracking-[0.2em] text-white/50">
              {t("footerThisPage")}
            </h3>
            <ul className="space-y-3 text-sm">
              {secciones.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    className="flex items-center gap-2 text-white/40 transition-colors hover:text-white"
                  >
                    <span className="size-1 rounded-full bg-[#1d4ed8]/60" />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Access column */}
          <div>
            <h3 className="mb-5 tabular-nums text-[10px] uppercase tracking-[0.2em] text-white/50">
              {t("footerAccess")}
            </h3>
            <ul className="mb-8 space-y-3 text-sm">
              {puertas.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="flex items-center gap-2 text-white/40 transition-colors hover:text-white"
                  >
                    <span className="size-1 rounded-full bg-[#60a5fa]/60" />
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
            <SelectorIdioma />
          </div>
        </div>

        {/* Sub-footer */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/6 pt-8 tabular-nums text-xs text-white/25 md:flex-row">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
            <span>
              © {new Date().getFullYear()} Global Effect Foundation.{" "}
              {t("footerAccessNote")}
            </span>
          </div>
          <span>{t("footerVersion")}</span>
        </div>
      </div>
    </footer>
  );
}
