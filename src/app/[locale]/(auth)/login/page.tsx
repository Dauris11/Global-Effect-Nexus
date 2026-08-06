/**
 * Página de inicio de sesión — la puerta única de los seis portales.
 *
 * El panel izquierdo no es decoración: el sistema tiene seis portales por rol
 * (03-modulos-funcionales.md § Portales por rol) y la duda razonable de quien
 * llega aquí es "¿cuál me toca?". La respuesta es que no elige —el rol de su
 * cuenta decide el destino—, y eso se dice en la puerta en vez de dejar que lo
 * descubra al entrar.
 *
 * En móvil el panel desaparece entero: ahí el formulario es lo único que
 * importa y una columna de marca solo alejaría los campos del pulgar.
 *
 * El formulario usa `useSearchParams`, por eso va dentro de un `Suspense`.
 */
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "./login-form";
import { Logo } from "@/components/brand/logo";

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Panel de marca — solo desktop. */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#171A1D] p-12 text-white lg:flex">
        {/* Halo turquesa. Va en el color institucional y muy difuminado: es
            profundidad, no un glow. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-[#2096BA] opacity-20 blur-3xl"
        />

        <Logo className="relative h-9 w-auto" priority />

        <div className="relative max-w-md">
          <h2 className="font-heading text-3xl font-bold leading-tight">
            {t("gateHeading")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">{t("gateNote")}</p>
          <p className="mt-6 border-l-2 border-[#2096BA] pl-4 text-sm text-slate-300">
            {t("gatePortals")}
          </p>
        </div>

        <p className="relative text-xs text-slate-500">{t("brandTagline")}</p>
      </div>

      {/* Formulario. */}
      <div className="relative flex flex-col justify-center bg-slate-50 px-6 py-12">
        <Link
          href="/"
          className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
          {t("backHome")}
        </Link>

        <div className="mx-auto w-full max-w-sm">
          <span className="mb-8 flex w-fit items-center rounded-xl bg-[#171A1D] px-3 py-2 lg:hidden">
            <Logo className="h-6 w-auto" priority />
          </span>

          <Suspense>
            <LoginForm />
          </Suspense>

          <p className="mt-8 text-xs leading-relaxed text-slate-500">{t("needAccess")}</p>
        </div>
      </div>
    </main>
  );
}
