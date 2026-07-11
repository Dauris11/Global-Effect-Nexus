/**
 * Página de inicio de sesión. Envuelve el formulario (cliente) en un
 * `Suspense` porque usa `useSearchParams`, requisito de Next para el
 * renderizado estático.
 */
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
