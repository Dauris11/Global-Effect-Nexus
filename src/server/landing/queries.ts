/**
 * Consultas del dominio Landing. Las lecturas públicas (slides activos,
 * estadísticas, eventos) no exigen sesión: alimentan la página de inicio.
 * El listado completo (incluye inactivos) es para el panel de administración.
 */
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import type { LandingSlide, LandingEstadisticas, EventoPublico } from "./types";

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

/** Próximos eventos públicos (desde hoy). */
export async function eventosPublicos(limite = 4): Promise<EventoPublico[]> {
  const { rows } = await query(
    `SELECT id, titulo, tipo, fecha, ubicacion
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
