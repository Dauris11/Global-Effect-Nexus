/**
 * Footer institucional de la landing. Fondo slate-900 con borde superior
 * turquesa (marca), logo blanco + lema + redes, y tres columnas de enlaces
 * (Plataforma, Institución, Soporte). Los enlaces de plataforma llevan al
 * portal; el resto son marcadores (`#`) hasta que existan sus páginas.
 */
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/logo";

// Iconos de redes como SVG inline (lucide no incluye iconos de marca).
const redes: { label: string; svg: React.ReactNode }[] = [
  {
    label: "Instagram",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
        <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5H17V4.7c-.3 0-1.3-.1-2.45-.1-2.4 0-4.05 1.47-4.05 4.17v2.33H7.8V14h2.7v8z" />
      </svg>
    ),
  },
  {
    label: "Web",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

export async function LandingFooter() {
  const t = await getTranslations("landing");
  const locale = await getLocale();
  const L = (h: string) => `/${locale}${h}`;

  const columnas = [
    {
      title: t("footerPlatform"),
      links: [
        { label: t("footerAcademic"), href: L("/login") },
        { label: t("footerAccounting"), href: L("/login") },
        { label: t("footerPsychology"), href: L("/login") },
        { label: t("footerScholarships"), href: L("/login") },
      ],
    },
    {
      title: t("footerInstitution"),
      links: [
        { label: t("footerAbout"), href: "#" },
        { label: t("footerPrograms"), href: "#" },
        { label: t("footerDonations"), href: "#" },
        { label: t("footerNews"), href: "#" },
      ],
    },
    {
      title: t("footerSupport"),
      links: [
        { label: t("footerHelp"), href: "#" },
        { label: t("footerTech"), href: "#" },
        { label: t("footerTerms"), href: "#" },
        { label: t("footerPrivacy"), href: "#" },
      ],
    },
  ];

  return (
    <footer id="footer" className="border-t-4 border-brand-teal bg-brand-charcoal text-white/60">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Logo className="h-8 w-auto" />
            <p className="mt-4 font-display text-base italic text-white/70">{t("footerTagline")}</p>
            <div className="mt-5 flex gap-2">
              {redes.map((r) => (
                <a
                  key={r.label}
                  href="#"
                  aria-label={r.label}
                  className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {r.svg}
                </a>
              ))}
            </div>
          </div>

          {columnas.map((c) => (
            <div key={c.title}>
              <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-white/90">
                {c.title}
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 font-mono text-xs text-white/40 md:flex-row">
          <span>
            © {new Date().getFullYear()} Global Effect Foundation. {t("footerRights")}
          </span>
          <span>{t("footerTagline2")}</span>
        </div>
      </div>
    </footer>
  );
}
