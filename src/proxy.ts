/**
 * Proxy (antes "middleware") — internacionalización + sesión + protección de
 * rutas (RBAC). En Next.js 16 la convención `middleware.ts` se renombró a
 * `proxy.ts`; la API y el `config.matcher` son equivalentes.
 *
 * 1. next-intl resuelve el prefijo de idioma (/es, /en).
 * 2. Supabase refresca la sesión (renueva cookies del token) en cada petición.
 * 3. Las rutas del área autenticada exigen sesión; si no hay, se redirige al
 *    login conservando el destino. La autorización fina por permiso se aplica
 *    en las Server Actions con `requirePermission()`.
 */
import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing, type Locale } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Segmentos (sin prefijo de idioma) que requieren sesión iniciada.
 *
 * La lista cubre prefijos: `/administrativo` protege también
 * `/administrativo/personal`. Es la primera barrera, no la única —la
 * autorización por permiso la aplica cada pantalla y cada Server Action con
 * `requirePermission()`—, pero una ruta que falte aquí llega hasta el
 * componente sin sesión y depende de que ese componente se acuerde de
 * comprobarla.
 */
const RUTAS_PROTEGIDAS = [
  "/dashboard",
  "/administrativo",
  "/expedientes",
  "/academico",
  "/academias",
  "/patrocinadores",
  "/contabilidad",
  "/psicologia",
  "/calendario",
  "/reportes",
  "/configuracion",
  "/inscripcion-comida",
  "/servicios-mensuales",
  // Requiere sesión (no permiso): el estudiante pide su propia cita.
  "/cita-psicologia",
  "/portal",
];

export async function proxy(request: NextRequest) {
  // 1. Respuesta base de i18n (rewrite/redirect con el locale resuelto).
  const response = intlMiddleware(request);

  // 2. Refresco de sesión: enlazamos Supabase a las cookies de esta petición.
  let user = null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes("placeholder") &&
    !supabaseUrl.includes("[PROJECT_REF]")
  ) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      });

      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
    } catch {
      // Ignorar en desarrollo sin credenciales configuradas
    }
  }

  // 3. Protección de rutas del portal.
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const hasLocale = routing.locales.includes(segments[0] as Locale);
  const locale = hasLocale ? (segments[0] as Locale) : routing.defaultLocale;
  const rutaSinLocale = "/" + segments.slice(hasLocale ? 1 : 0).join("/");

  const esProtegida = RUTAS_PROTEGIDAS.some(
    (p) => rutaSinLocale === p || rutaSinLocale.startsWith(p + "/"),
  );

  if (esProtegida && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Excluye api, auth (callback OAuth), estáticos y archivos con extensión.
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
