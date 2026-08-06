/**
 * Consultas del dominio Landing. Las lecturas públicas (slides activos,
 * estadísticas, eventos) no exigen sesión: alimentan la página de inicio.
 * El listado completo (incluye inactivos) es para el panel de administración.
 */
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import type { LandingSlide, LandingEstadisticas, EventoPublico, EntradaBlog, Noticia } from "./types";

/** Diapositivas activas del hero, ordenadas (público). */
export async function slidesActivos(): Promise<LandingSlide[]> {
  const { rows } = await query(
    `SELECT id, titulo, subtitulo, texto, imagen_url, cta_texto, cta_enlace, orden, activo
       FROM landing_slide
      WHERE activo = TRUE
      ORDER BY orden, created_at`,
  );
  return rows as LandingSlide[];
}

/** Estadísticas en vivo para la barra de la landing (público). */
export async function estadisticasLanding(): Promise<LandingEstadisticas> {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM estudiante WHERE estado = 'activo') AS estudiantes_activos,
       (SELECT COUNT(*) FROM materia WHERE estado = 'activa')     AS materias,
       (SELECT COUNT(*) FROM patrocinador WHERE estado = 'activo') AS patrocinadores`,
  );
  const r = rows[0];
  return {
    estudiantes_activos: Number(r.estudiantes_activos),
    materias: Number(r.materias),
    patrocinadores: Number(r.patrocinadores),
  };
}

/**
 * Próximos eventos públicos (desde hoy).
 *
 * La fecha se formatea en SQL. El tipo `EventoPublico` declara `fecha: string`,
 * pero una columna `DATE` la devuelve el driver como `Date`, así que el tipo era
 * mentira y el primer `fecha.split()` de la interfaz reventaba. Devolver texto
 * `YYYY-MM-DD` hace que el tipo sea cierto y evita de paso que la zona horaria
 * corra el día al construir el `Date` en el cliente.
 */
export async function eventosPublicos(limite = 4): Promise<EventoPublico[]> {
  const { rows } = await query(
    `SELECT id, titulo, tipo,
            to_char(fecha, 'YYYY-MM-DD') AS fecha,
            ubicacion
       FROM evento
      WHERE fecha >= CURRENT_DATE AND estado <> 'cancelado'
      ORDER BY fecha
      LIMIT $1`,
    [limite],
  );
  return rows as EventoPublico[];
}

/** Todas las diapositivas (activas e inactivas) para el panel. */
export async function todosLosSlides(): Promise<LandingSlide[]> {
  await requirePermission("landing.administrar");
  const { rows } = await query(
    `SELECT id, titulo, subtitulo, texto, imagen_url, cta_texto, cta_enlace, orden, activo
       FROM landing_slide
      ORDER BY orden, created_at`,
  );
  return rows as LandingSlide[];
}

/**
 * Entradas del blog público: noticias publicadas + eventos ya celebrados.
 *
 * Se unen en SQL y no en JavaScript porque el orden por fecha tiene que
 * aplicarse al conjunto, no a cada lista por separado: mezclando después habría
 * que traer de más de ambas tablas para garantizar que el corte es correcto.
 *
 * Se excluyen los eventos `administrativo`: la operación interna de la
 * Fundación no es contenido público, igual que en el portal del estudiante.
 * También los cancelados — anunciar en el blog algo que no llegó a ocurrir.
 */
export async function entradasDelBlog(limite = 6): Promise<EntradaBlog[]> {
  const { rows } = await query(
    `SELECT id, 'noticia' AS origen, titulo, resumen, imagen_url,
            to_char(fecha, 'YYYY-MM-DD') AS fecha, autor AS etiqueta
       FROM noticia
      WHERE publicada
     UNION ALL
     SELECT id, 'evento' AS origen, titulo, descripcion AS resumen, NULL AS imagen_url,
            to_char(fecha, 'YYYY-MM-DD') AS fecha, tipo AS etiqueta
       FROM evento
      WHERE fecha < CURRENT_DATE
        AND tipo <> 'administrativo'
        AND estado <> 'cancelado'
     ORDER BY fecha DESC
      LIMIT $1`,
    [limite],
  );
  return rows as EntradaBlog[];
}

/** Todas las noticias, publicadas o no, para el panel de administración. */
export async function todasLasNoticias(): Promise<(Noticia & { publicada: boolean })[]> {
  const { rows } = await query(
    `SELECT id, titulo, resumen, contenido, imagen_url,
            to_char(fecha, 'YYYY-MM-DD') AS fecha, autor, publicada
       FROM noticia
      ORDER BY fecha DESC`,
  );
  return rows as (Noticia & { publicada: boolean })[];
}
