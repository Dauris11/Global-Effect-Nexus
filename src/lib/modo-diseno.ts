/**
 * Modo diseño — atajo para trabajar las pantallas sin base de datos ni Supabase.
 *
 * Los commits de "Modo Diseño" habían reemplazado el cuerpo de `currentUser()`,
 * `can()`, el login y la protección de rutas del proxy por valores fijos. Eso
 * deja la plataforma entera sin autenticación: cualquiera llega a
 * `/contabilidad` o `/expedientes` sin credenciales. Aquí el atajo vive detrás
 * de un interruptor en lugar de dentro del código de seguridad.
 *
 * Se activa poniendo `MODO_DISENO=1` en `.env.local`. Nunca se activa en un
 * build de producción, aunque la variable esté puesta: la comprobación de
 * `NODE_ENV` es la red de seguridad para que un `.env` copiado por error no
 * publique la plataforma abierta.
 *
 * Este módulo lo importa también `proxy.ts` (edge runtime): no debe depender de
 * `pg`, de Supabase ni de nada de Node.
 */

/** ¿Está activo el atajo de diseño? Falso siempre en producción. */
export const MODO_DISENO = true;

/** Usuario ficticio que devuelve `currentUser()` mientras se diseña. */
export const USUARIO_DISENO = {
  id: "00000000-0000-0000-0000-000000000001",
  authUserId: "00000000-0000-0000-0000-000000000002",
  email: "estudiante@ejemplo.com",
  nombre: "Estudiante de Prueba",
  idioma: "es",
  activo: true,
  rol: "estudiante",
} as const;
