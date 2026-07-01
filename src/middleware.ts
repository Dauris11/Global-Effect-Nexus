import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Middleware de internacionalización (prefijo de idioma en la ruta).
// La protección de rutas por rol (RBAC) se integrará aquí en S4.
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
