/**
 * Configuración de enrutamiento i18n: idiomas soportados (es, en) y el
 * idioma por defecto. Fuente única usada por middleware, navegación y
 * la resolución de mensajes por petición.
 */
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
});
