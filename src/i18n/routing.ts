/**
 * Configuración de enrutamiento i18n: idiomas soportados y el idioma por
 * defecto. Fuente única usada por middleware, navegación y la resolución de
 * mensajes por petición. Español es el idioma por defecto (sin prefijo
 * forzado); inglés, francés e italiano se sirven bajo /en, /fr, /it.
 */
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en", "fr", "it"],
  defaultLocale: "es",
});

/** Tipo de idioma soportado, derivado de la configuración de rutas. */
export type Locale = (typeof routing.locales)[number];
