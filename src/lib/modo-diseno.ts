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
export const MODO_DISENO =
  process.env.NODE_ENV !== "production" &&
  (process.env.NEXT_PUBLIC_MODO_DISENO === "1" || process.env.MODO_DISENO === "1");

/** Perfiles ficticios por rol para probar portales en modo diseño. */
export const PERFILES_DISENO: Record<
  string,
  { id: string; authUserId: string; email: string; nombre: string; rol: string }
> = {
  estudiante: {
    id: "00000000-0000-0000-0000-000000000001",
    authUserId: "00000000-0000-0000-0000-000000000002",
    email: "estudiante@ejemplo.com",
    nombre: "Estudiante de Prueba",
    rol: "estudiante",
  },
  psicologo: {
    id: "00000000-0000-0000-0000-000000000003",
    authUserId: "00000000-0000-0000-0000-000000000004",
    email: "psicologia@ejemplo.com",
    nombre: "Dra. María Elena (Psicología)",
    rol: "psicologo",
  },
  docente: {
    id: "00000000-0000-0000-0000-000000000005",
    authUserId: "00000000-0000-0000-0000-000000000006",
    email: "docente@ejemplo.com",
    nombre: "Prof. Carlos Rodríguez",
    rol: "docente",
  },
  administrativo: {
    id: "00000000-0000-0000-0000-000000000007",
    authUserId: "00000000-0000-0000-0000-000000000008",
    email: "admin@ejemplo.com",
    nombre: "Coordinador Administrativo",
    rol: "administrativo",
  },
  contabilidad: {
    id: "00000000-0000-0000-0000-000000000009",
    authUserId: "00000000-0000-0000-0000-000000000010",
    email: "contabilidad@ejemplo.com",
    nombre: "Lic. Ana Gómez (Contabilidad)",
    rol: "contabilidad",
  },
  admin: {
    id: "00000000-0000-0000-0000-000000000011",
    authUserId: "00000000-0000-0000-0000-000000000012",
    email: "administrador@ejemplo.com",
    nombre: "Administrador General",
    rol: "admin",
  },
  super_admin: {
    id: "00000000-0000-0000-0000-000000000013",
    authUserId: "00000000-0000-0000-0000-000000000014",
    email: "superadmin@ejemplo.com",
    nombre: "Super Administrador",
    rol: "super_admin",
  },
};

/** Usuario ficticio por defecto mientras se diseña. */
export const USUARIO_DISENO = PERFILES_DISENO.estudiante;

