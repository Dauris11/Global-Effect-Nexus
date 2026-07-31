/**
 * Cliente de Supabase para el servidor (Server Components, Route Handlers y
 * Server Actions). Lee y escribe la sesión desde las cookies de la petición
 * usando la API de cookies de Next.js. La verificación de la sesión (firma
 * JWT vía JWKS de Supabase) la hace el propio SDK con `auth.getUser()`.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // En Server Components no se pueden escribir cookies; el refresco de
          // sesión se hace en el middleware. Se ignora el error de forma segura.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* llamado desde un Server Component: ignorar */
          }
        },
      },
    },
  );
}
