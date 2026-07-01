import { Pool } from "pg";

/**
 * Pool de conexiones a PostgreSQL (Supabase), reutilizado entre recargas
 * en desarrollo para no agotar conexiones (patrón singleton).
 */
const globalForPg = globalThis as unknown as { pool?: Pool };

export const pool =
  globalForPg.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalForPg.pool = pool;

/** Ejecuta una consulta parametrizada. Nunca interpolar valores en el SQL. */
export const query = (text: string, params?: unknown[]) => pool.query(text, params);
