/**
 * Footer institucional de la landing page ("Impact Editorial").
 *
 * Incluye datos de contacto verificados en La Vega, accesos institucionales,
 * indicador de estado del sistema y selector de idioma.
 */
"use client";

import { useTranslations } from "next-intl";
import { MapPin, Mail, ShieldCheck, Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { SelectorIdioma } from "@/components/layout/selector-idioma";

export function LandingFooter() {
  const t = useTranslations("landing");

  const secciones = [
    { label: t("navAccess"), href: "#acceso" },
    { label: t("navWork"), href: "#labor" },
    { label: t("navEventos"), href: "#eventos" },
    { label: t("navFaq"), href: "#faq" },
  ];

  const puertas = [
    { label: t("access_portal_title"), href: "/login" },
    { label: t("access_meals_title"), href: "/comida" },
  ];

  return (
    <footer id="footer" className="border-t-4 border-primary bg-brand-charcoal text-white/60">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Columna Marca e Información */}
          <div>
            <span className="inline-block rounded-lg bg-white/5 p-2 backdrop-blur-xs">
              <Logo className="h-8 w-auto" />
            </span>
            <p className="mt-5 max-w-xs font-display text-base italic leading-snug text-white/80">
              {t("footerTagline")}
            </p>

            <address className="mt-6 space-y-2.5 text-sm not-italic text-white/70">
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-teal" aria-hidden />
                <span>{t("footerAddress")}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-brand-teal" aria-hidden />
                <a
                  href={`mailto:${t("footerEmail")}`}
                  className="transition-colors hover:text-white underline underline-offset-4"
                >
                  {t("footerEmail")}
                </a>
              </p>
            </address>
          </div>

          {/* Columna Navegación Pública */}
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/90 font-semibold mb-4">
              {t("footerThisPage")}
            </h3>
            <ul className="space-y-3 text-sm">
              {secciones.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    className="transition-colors hover:text-white flex items-center gap-1.5"
                  >
                    <span className="size-1 rounded-full bg-brand-teal/60" />
                    <span>{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna Accesos Directos */}
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/90 font-semibold mb-4">
              {t("footerAccess")}
            </h3>
            <ul className="space-y-3 text-sm mb-6">
              {puertas.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="transition-colors hover:text-white flex items-center gap-1.5"
                  >
                    <span className="size-1 rounded-full bg-brand-gold/60" />
                    <span>{p.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <SelectorIdioma />
            </div>
          </div>
        </div>

        {/* Sub-footer */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 font-mono text-[11px] text-white/55 md:flex-row">
          {/* El escudo va en el gris de la línea, no en verde: un check verde
              aquí se lee como un sello de certificación que no tenemos, y el
              color funcional del sistema no significa "seguro" (§3.2). */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 shrink-0" aria-hidden />
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
