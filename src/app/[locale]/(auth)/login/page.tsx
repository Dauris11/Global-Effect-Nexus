/**
 * Página de inicio de sesión (Impact Editorial). Panel de marca (tinta) a la
 * izquierda en desktop + formulario a la derecha. El formulario usa
 * `useSearchParams`, por eso va dentro de un `Suspense`.
 */
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Logo } from "@/components/brand/logo";

export default function LoginPage() {
  return (
    // `tema-claro`: la puerta del sistema es pública, nunca en oscuro.
    <main className="tema-claro grid min-h-screen lg:grid-cols-2">
      {/* Panel de marca (desktop) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-charcoal p-12 text-white lg:flex">
        {/* Halo de marca. El color sale del token, no de un rgba escrito aquí
            (docs/10-estandar-de-interfaz.md §3: un componente nunca escribe un color). */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/4 size-80 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--brand-teal) 45%, transparent), transparent)",
          }}
        />
        <Logo className="relative h-8 w-auto" />
        <p className="relative max-w-md font-display text-3xl italic leading-snug text-white/90">
          Bringing Hope · Changing Lives · Transforming Communities
        </p>
        <p className="relative font-mono text-xs uppercase tracking-[0.2em] text-white/50">
          Global Effect Foundation
        </p>
      </div>

      {/* Formulario */}
      <div className="flex flex-col items-center justify-center bg-background px-6 py-12">
        <span className="mb-10 flex items-center rounded-xl bg-brand-charcoal px-3 py-2 lg:hidden">
          <Logo className="h-6 w-auto" priority />
        </span>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
