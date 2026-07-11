/**
 * Dominio Bienestar — Inscripción de comida (almuerzo).
 *
 * Acceso PÚBLICO (sin login) para inscribirse. Reglas de negocio:
 *   • Inscripción abierta solo hasta las 8:30 AM (hora del servidor) para el
 *     día en curso; los días futuros pueden pre-registrarse en cualquier
 *     momento (inscripción semanal anticipada).
 *   • No se permite duplicar inscripción del mismo nombre en el mismo día
 *     (restricción UNIQUE (nombre, fecha) + ON CONFLICT).
 *
 * "Automatización" semanal: al pre-registrar varios días se crea una fila por
 * fecha; cada día, la lista del administrador (`inscritosPorFecha`) muestra
 * automáticamente a quienes tienen fila para esa fecha — sin re-inscribirse.
 *
 * La lista con nombres es solo para administración (`operaciones.leer`);
 * el público solo ve el conteo.
 */
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";

const HORA_LIMITE_MIN = 8 * 60 + 30; // 8:30 AM en minutos

const Inscribir = z.object({ nombre: z.string().min(1).max(120) });
const InscribirVarios = z.object({
  nombre: z.string().min(1).max(120),
  fechas: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1),
});

export interface ResultadoInscripcion {
  ok: boolean;
  motivo?: "fuera_de_horario" | "duplicado" | "invalido";
}

export interface ResultadoMultiple {
  procesado: boolean;
  confirmados: string[];
  duplicados: string[];
  rechazados: { fecha: string; motivo: "pasado" | "fuera_de_horario" }[];
}

export interface InscritoComida {
  id: string;
  nombre: string;
  hora_inscripcion: string;
}

// --- Utilidades de fecha/hora (hora del servidor) ---
const pad = (n: number) => String(n).padStart(2, "0");
function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function minutosAhora(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/** Inscribe un nombre al almuerzo del día en curso. Público. */
export async function inscribirComida(input: unknown): Promise<ResultadoInscripcion> {
  const parsed = Inscribir.safeParse(input);
  if (!parsed.success) return { ok: false, motivo: "invalido" };

  if (minutosAhora() > HORA_LIMITE_MIN) return { ok: false, motivo: "fuera_de_horario" };

  const { rowCount } = await query(
    `INSERT INTO inscripcion_comida (nombre)
     VALUES ($1)
     ON CONFLICT (nombre, fecha) DO NOTHING`,
    [parsed.data.nombre.trim()],
  );

  revalidatePath("/comida");
  return rowCount ? { ok: true } : { ok: false, motivo: "duplicado" };
}

/** Adaptador para `useActionState`: inscribe usando datos de formulario. */
export async function inscribirComidaForm(
  _prev: ResultadoInscripcion,
  formData: FormData,
): Promise<ResultadoInscripcion> {
  return inscribirComida({ nombre: formData.get("nombre") });
}

/**
 * Pre-registro de varios días de una vez (inscripción semanal anticipada).
 * Valida cada fecha: los días pasados y el día en curso ya cerrado (>8:30) se
 * rechazan; los días futuros se aceptan. Devuelve el desglose por día.
 */
export async function inscribirVariosDias(input: unknown): Promise<ResultadoMultiple> {
  const parsed = InscribirVarios.safeParse(input);
  if (!parsed.success) {
    return { procesado: true, confirmados: [], duplicados: [], rechazados: [] };
  }
  const nombre = parsed.data.nombre.trim();
  const hoy = hoyISO();
  const cerradoHoy = minutosAhora() > HORA_LIMITE_MIN;

  const validas: string[] = [];
  const rechazados: ResultadoMultiple["rechazados"] = [];
  for (const f of [...new Set(parsed.data.fechas)]) {
    if (f < hoy) rechazados.push({ fecha: f, motivo: "pasado" });
    else if (f === hoy && cerradoHoy) rechazados.push({ fecha: f, motivo: "fuera_de_horario" });
    else validas.push(f);
  }

  let confirmados: string[] = [];
  let duplicados: string[] = [];
  if (validas.length > 0) {
    const { rows } = await query(
      `INSERT INTO inscripcion_comida (nombre, fecha)
       SELECT $1, f FROM unnest($2::date[]) AS f
       ON CONFLICT (nombre, fecha) DO NOTHING
       RETURNING to_char(fecha, 'YYYY-MM-DD') AS fecha`,
      [nombre, validas],
    );
    confirmados = rows.map((r) => r.fecha as string);
    duplicados = validas.filter((f) => !confirmados.includes(f));
  }

  revalidatePath("/comida");
  revalidatePath("/inscripcion-comida");
  return { procesado: true, confirmados, duplicados, rechazados };
}

/** Adaptador para `useActionState`: pre-registro multi-día desde formulario. */
export async function inscribirVariosDiasForm(
  _prev: ResultadoMultiple,
  formData: FormData,
): Promise<ResultadoMultiple> {
  return inscribirVariosDias({
    nombre: formData.get("nombre"),
    fechas: formData.getAll("fechas"),
  });
}

/** Conteo de inscritos de hoy (público, sin nombres). */
export async function contarInscritosHoy(): Promise<number> {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS n FROM inscripcion_comida WHERE fecha = CURRENT_DATE`,
  );
  return rows[0].n as number;
}

/** Lista de inscritos de una fecha (solo administración). YYYY-MM-DD. */
export async function inscritosPorFecha(fecha: string): Promise<InscritoComida[]> {
  await requirePermission("operaciones.leer");
  const { rows } = await query(
    `SELECT id, nombre, hora_inscripcion
       FROM inscripcion_comida
      WHERE fecha = $1::date
      ORDER BY nombre`,
    [fecha],
  );
  return rows as InscritoComida[];
}

/**
 * Notifica a los administradores que la lista del día está lista para
 * imprimir (usar tras el cierre de las 8:30 AM). Pensada para dispararse por
 * una tarea programada (n8n / pg_cron) o manualmente por un admin.
 */
export async function notificarListaComida(): Promise<number> {
  await requirePermission("operaciones.escribir");
  const hoy = hoyISO();
  const { rows } = await query(
    `INSERT INTO notificacion (usuario_id, titulo, mensaje, tipo, enlace)
     SELECT u.id, 'Lista de comida del día',
            'La inscripción cerró. Ya puedes imprimir la lista de hoy.', 'tarea', $1
       FROM usuario u JOIN rol r ON r.id = u.rol_id
      WHERE r.nombre IN ('admin', 'super_admin') AND u.activo
     RETURNING id`,
    [`/inscripcion-comida?fecha=${hoy}`],
  );
  return rows.length;
}
