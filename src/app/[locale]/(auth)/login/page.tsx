import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    // Centered card layout on dark background with glow nebula
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#060d18] px-4 py-12 relative overflow-hidden">
      {/* Background glow (Nebula) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80rem 55rem at 50% 50%, rgba(29,78,216,0.15) 0%, transparent 60%)`,
        }}
      />
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
