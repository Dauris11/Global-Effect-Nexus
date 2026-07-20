/**
 * ThemeToggle — alterna claro/oscuro escribiendo la clase `dark` en <html> y
 * persistiendo la preferencia en localStorage. El parpadeo inicial (FOUC) lo
 * evita el script inline en el layout raíz, que aplica el tema antes de pintar.
 *
 * Cambio de color/tema: transición de opacidad del icono (sin movimiento), y
 * el conmutado en sí es instantáneo — es una acción frecuente, no se anima.
 */
"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

/** Suscribe a los cambios de clase de <html> para reflejar el tema activo. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const t = useTranslations("portal");
  // Lee el tema directamente del DOM (fuente de verdad la fija el script del
  // layout). En servidor asumimos claro; el observer resincroniza al montar.
  const dark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* almacenamiento no disponible: se ignora */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("toggleTheme")}
      className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </button>
  );
}
