import { Pool } from "pg";

/**
 * Pool de conexiones a PostgreSQL (Supabase), reutilizado entre recargas
 * en desarrollo para no agotar conexiones (patrón singleton).
 */
const globalForPg = globalThis as unknown as { pool?: Pool };

const connectionString =
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    ? process.env.DATABASE_URL
    : "postgres://postgres:postgres@127.0.0.1:5432/global_effect";

export const pool =
  globalForPg.pool ?? new Pool({ connectionString });

if (process.env.NODE_ENV !== "production") globalForPg.pool = pool;

/** Ejecuta una consulta parametrizada. Nunca interpolar valores en el SQL. */
export const query = (text: string, params?: unknown[]) => pool.query(text, params);

/** Firma de `query` acotada a una conexión concreta dentro de una transacción. */
export type QueryFn = (
  text: string,
  params?: unknown[],
) => Promise<{ rows: Record<string, unknown>[] }>;

/**
 * Ejecuta varias consultas en una transacción sobre la MISMA conexión.
 *
 * Hace falta porque un expediente de estudiante se escribe en cinco tablas
 * (`estudiante` + familiares + los tres perfiles): si la cuarta falla, un
 * expediente a medias es peor que ninguno — queda un estudiante sin vivienda
 * ni salud que nadie sabe que está incompleto.
 *
 * `pool.query()` no sirve para esto: cada llamada puede tomar una conexión
 * distinta del pool, así que el `BEGIN` y el `INSERT` acabarían en sesiones
 * diferentes y la transacción no envolvería nada.
 *
 * La conexión se devuelve al pool siempre, incluso si el callback lanza.
 */
export async function transaction<T>(fn: (q: QueryFn) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const resultado = await fn((text, params) => client.query(text, params));
    await client.query("COMMIT");
    return resultado;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
