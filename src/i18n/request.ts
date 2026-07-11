/**
 * Configuración por petición de next-intl: resuelve el idioma activo
 * (con respaldo al idioma por defecto) y carga el diccionario de mensajes
 * correspondiente desde messages/{locale}.json.
 */
import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
