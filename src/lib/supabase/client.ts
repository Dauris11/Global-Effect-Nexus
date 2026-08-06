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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const safeUrl = url.includes("[PROJECT_REF]") ? "https://placeholder.supabase.co" : url;
  
  return createBrowserClient(
    safeUrl || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key",
  );
}
