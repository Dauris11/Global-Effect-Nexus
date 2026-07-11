/**
 * Cliente de Supabase para el navegador (componentes cliente).
 *
 * Usa la clave publicable (anon) — segura para el cliente porque el acceso
 * real a los datos se controla con RLS en la BD y con RBAC en el servidor.
 * Para leer/escribir datos de negocio se usa la capa `src/server/<dominio>`
 * (pg parametrizado); este cliente se reserva para autenticación y Storage.
 */
"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
