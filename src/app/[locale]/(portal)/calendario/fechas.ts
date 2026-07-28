/**
 * Utilidades de fecha del calendario.
 *
 * Todo se trabaja con la cadena `YYYY-MM-DD` y no con objetos `Date`: la base
 * de datos guarda días (`DATE`, sin hora) y convertir un día a `Date` mete de
 * inmediato la zona horaria en la ecuación —en República Dominicana, UTC-4, un
 * `new Date("2026-11-09")` cae el 8 de noviembre a las 20:00. Comparar y
 * ordenar cadenas `YYYY-MM-DD` es exacto y ordena bien por sí solo.
 *
 * `Date` se usa solo para dos cosas: contar días de un mes y formatear en el
 * idioma activo, y en ambos casos se construye con (año, mes, día) locales.
 */

/** Día de hoy como `YYYY-MM-DD` en la zona del navegador/servidor. */
export function hoyISO(): string {
  return aISO(new Date());
}

/** `Date` → `YYYY-MM-DD` (componentes locales, sin pasar por UTC). */
export function aISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** `YYYY-MM-DD` → `Date` local a mediodía (inmune a saltos de horario). */
export function aFecha(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d, 12);
}

/** Mes de un día: `2026-11-09` → `2026-11`. */
export function mesDe(iso: string): string {
  return iso.slice(0, 7);
}

/** Mes actual como `YYYY-MM`. */
export function mesActual(): string {
  return mesDe(hoyISO());
}

/** ¿Es un mes válido en formato `YYYY-MM`? */
export function esMesValido(mes: string | undefined | null): mes is string {
  return typeof mes === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(mes);
}

/** Mes vecino: `desplazarMes("2026-01", -1)` → `"2025-12"`. */
export function desplazarMes(mes: string, meses: number): string {
  const [a, m] = mes.split("-").map(Number);
  const d = new Date(a, m - 1 + meses, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Cuántos días tiene el mes. */
export function diasDelMes(mes: string): number {
  const [a, m] = mes.split("-").map(Number);
  return new Date(a, m, 0).getDate(); // día 0 del mes siguiente
}

/**
 * Días de relleno antes del día 1 para que la semana empiece en lunes.
 * `getDay()` devuelve 0 para domingo, así que el domingo son 6 huecos.
 */
export function huecosIniciales(mes: string): number {
  const [a, m] = mes.split("-").map(Number);
  const dia = new Date(a, m - 1, 1).getDay();
  return (dia + 6) % 7;
}

/** Los siete días de la semana empezando en lunes, en el idioma activo. */
export function nombresDeDias(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  // 2026-06-01 es lunes; sirve de ancla para recorrer la semana.
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2026, 5, 1 + i)));
}
