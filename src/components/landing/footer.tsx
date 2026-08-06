/**
 * Footer institucional.
 *
 * Cierra la página con el filete turquesa arriba (la única marca de color
 * sobre el slate-900) y reparte contacto, secciones y accesos en columnas.
 */
import { Mail, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";

export async function LandingFooter() {
  const t = await getTranslations("landing");
  const año = new Date().getFullYear();

  return (
    <footer
      id="footer"
      className="border-t-4 bg-slate-900"
      style={{ borderTopColor: "#2096BA" }}
    >
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo className="h-9 w-auto brightness-200" />
            <p className="mt-4 max-w-xs text-sm text-slate-400">{t("footerTagline")}</p>
          </div>

          <div>
            <h2 className="font-heading text-sm font-semibold text-white">
              {t("footerAccess")}
            </h2>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/login" className="text-xs text-slate-400 hover:text-white">
                  {t("enter")}
                </Link>
              </li>
              <li>
                <Link href="/comida" className="text-xs text-slate-400 hover:text-white">
                  {t("heroCta2")}
                </Link>
              </li>
              <li>
                <a href="#portales" className="text-xs text-slate-400 hover:text-white">
                  {t("navAccess")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-sm font-semibold text-white">
              {t("footerThisPage")}
            </h2>
            <ul className="mt-4 space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {t("footerAddress")}
              </li>
              <li className="flex items-start gap-2">
                <Mail aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <a href={`mailto:${t("footerEmail")}`} className="hover:text-white">
                  {t("footerEmail")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-500">
            © {año} Global Effect · {t("footerRights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
