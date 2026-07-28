/**
 * Configuración de enrutamiento i18n: idiomas soportados y el idioma por
 * defecto. Fuente única usada por middleware, navegación y la resolución de
 * mensajes por petición.
 *
 * Dos idiomas, y son los dos que la Fundación usa de verdad: **español** para
 * la operación diaria en La Vega (idioma por defecto, sin prefijo forzado) e
 * **inglés** bajo `/en` para los patrocinadores en Estados Unidos.
 *
 * Añadir un idioma es añadirlo a esta lista y crear `messages/<locale>.json`
 * con exactamente las mismas claves que `es.json`; también hay que ampliar la
 * restricción `usuario_idioma_check` de la base de datos.
 */
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
});

/** Tipo de idioma soportado, derivado de la configuración de rutas. */
export type Locale = (typeof routing.locales)[number];
