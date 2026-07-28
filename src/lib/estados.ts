/**
 * Mapa único de estados del dominio a clases de color.
 *
 * Es la pieza que hace que el sistema sea uno solo: una nota reprobada, un
 * egreso y una tarea urgente comparten rojo porque las tres dicen "esto
 * requiere atención ahora", y lo dicen desde aquí, no desde cada módulo.
 *
 * Ninguna pantalla debe traducir un estado a color por su cuenta. Si falta un
 * estado, se añade a este archivo y a la capa 3 de tokens en `globals.css`.
 * Ver docs/10-estandar-de-interfaz.md §3.2.
 *
 * Las clases se guardan completas y literales porque Tailwind analiza el
 * código fuente en busca de cadenas: una clase construida por concatenación
 * (`text-${x}`) no se genera nunca.
 */

/** Todos los estados con color propio en el sistema. */
export type EstadoDominio =
  | "nota-excelente"
  | "nota-buena"
  | "nota-riesgo"
  | "nota-critica"
  | "flujo-ingreso"
  | "flujo-egreso"
  | "confid-alto"
  | "confid-medio"
  | "confid-bajo"
  | "tarea-pendiente"
  | "tarea-progreso"
  | "tarea-completada"
  | "tarea-cancelada"
  | "prioridad-baja"
  | "prioridad-media"
  | "prioridad-alta"
  | "prioridad-urgente"
  | "neutral";

interface Paleta {
  /** Color sólido: texto, icono y riel. */
  texto: string;
  /** Fondo suave del chip. */
  fondo: string;
  /** Color del riel de estado (borde izquierdo). */
  riel: string;
  /** Fondo sólido para barras de progreso y puntos. */
  solido: string;
}

const PALETA: Record<EstadoDominio, Paleta> = {
  "nota-excelente": {
    texto: "text-nota-excelente",
    fondo: "bg-nota-excelente-suave",
    riel: "border-l-nota-excelente",
    solido: "bg-nota-excelente",
  },
  "nota-buena": {
    texto: "text-nota-buena",
    fondo: "bg-nota-buena-suave",
    riel: "border-l-nota-buena",
    solido: "bg-nota-buena",
  },
  "nota-riesgo": {
    texto: "text-nota-riesgo",
    fondo: "bg-nota-riesgo-suave",
    riel: "border-l-nota-riesgo",
    solido: "bg-nota-riesgo",
  },
  "nota-critica": {
    texto: "text-nota-critica",
    fondo: "bg-nota-critica-suave",
    riel: "border-l-nota-critica",
    solido: "bg-nota-critica",
  },

  "flujo-ingreso": {
    texto: "text-flujo-ingreso",
    fondo: "bg-flujo-ingreso-suave",
    riel: "border-l-flujo-ingreso",
    solido: "bg-flujo-ingreso",
  },
  "flujo-egreso": {
    texto: "text-flujo-egreso",
    fondo: "bg-flujo-egreso-suave",
    riel: "border-l-flujo-egreso",
    solido: "bg-flujo-egreso",
  },

  "confid-alto": {
    texto: "text-confid-alto",
    fondo: "bg-confid-alto-suave",
    riel: "border-l-confid-alto",
    solido: "bg-confid-alto",
  },
  "confid-medio": {
    texto: "text-confid-medio",
    fondo: "bg-confid-medio-suave",
    riel: "border-l-confid-medio",
    solido: "bg-confid-medio",
  },
  "confid-bajo": {
    texto: "text-confid-bajo",
    fondo: "bg-confid-bajo-suave",
    riel: "border-l-confid-bajo",
    solido: "bg-confid-bajo",
  },

  "tarea-pendiente": {
    texto: "text-tarea-pendiente",
    fondo: "bg-tarea-pendiente-suave",
    riel: "border-l-tarea-pendiente",
    solido: "bg-tarea-pendiente",
  },
  "tarea-progreso": {
    texto: "text-tarea-progreso",
    fondo: "bg-tarea-progreso-suave",
    riel: "border-l-tarea-progreso",
    solido: "bg-tarea-progreso",
  },
  "tarea-completada": {
    texto: "text-tarea-completada",
    fondo: "bg-tarea-completada-suave",
    riel: "border-l-tarea-completada",
    solido: "bg-tarea-completada",
  },
  "tarea-cancelada": {
    texto: "text-tarea-cancelada",
    fondo: "bg-tarea-cancelada-suave",
    riel: "border-l-tarea-cancelada",
    solido: "bg-tarea-cancelada",
  },

  "prioridad-baja": {
    texto: "text-prioridad-baja",
    fondo: "bg-prioridad-baja-suave",
    riel: "border-l-prioridad-baja",
    solido: "bg-prioridad-baja",
  },
  "prioridad-media": {
    texto: "text-prioridad-media",
    fondo: "bg-prioridad-media-suave",
    riel: "border-l-prioridad-media",
    solido: "bg-prioridad-media",
  },
  "prioridad-alta": {
    texto: "text-prioridad-alta",
    fondo: "bg-prioridad-alta-suave",
    riel: "border-l-prioridad-alta",
    solido: "bg-prioridad-alta",
  },
  "prioridad-urgente": {
    texto: "text-prioridad-urgente",
    fondo: "bg-prioridad-urgente-suave",
    riel: "border-l-prioridad-urgente",
    solido: "bg-prioridad-urgente",
  },

  neutral: {
    texto: "text-muted-foreground",
    fondo: "bg-muted",
    riel: "border-l-border",
    solido: "bg-muted-foreground",
  },
};

/** Clases de color de un estado. */
export function paletaDe(estado: EstadoDominio): Paleta {
  return PALETA[estado] ?? PALETA.neutral;
}

// ---------------------------------------------------------------------------
// Traductores: del valor que guarda la base de datos al estado visual.
// ---------------------------------------------------------------------------

/**
 * Banda de color de una calificación en escala 0–100.
 * Bandas de docs/03-modulos-funcionales.md: ≥90 · 70–89 · 60–69 · <60.
 */
export function bandaDeNota(nota: number | null | undefined): EstadoDominio {
  if (nota == null || Number.isNaN(nota)) return "neutral";
  if (nota >= 90) return "nota-excelente";
  if (nota >= 70) return "nota-buena";
  if (nota >= 60) return "nota-riesgo";
  return "nota-critica";
}

/** Signo de un movimiento contable. */
export function bandaDeFlujo(tipo: string): EstadoDominio {
  return tipo === "ingreso" ? "flujo-ingreso" : "flujo-egreso";
}

/** Estado de una tarea (enum `tarea.estado`). */
export function bandaDeTarea(estado: string): EstadoDominio {
  switch (estado) {
    case "en_progreso":
      return "tarea-progreso";
    case "completada":
      return "tarea-completada";
    case "cancelada":
      return "tarea-cancelada";
    default:
      return "tarea-pendiente";
  }
}

/** Prioridad de una tarea (enum `tarea.prioridad`). */
export function bandaDePrioridad(prioridad: string): EstadoDominio {
  switch (prioridad) {
    case "urgente":
      return "prioridad-urgente";
    case "alta":
      return "prioridad-alta";
    case "baja":
      return "prioridad-baja";
    default:
      return "prioridad-media";
  }
}

/**
 * Estado de un evento de calendario (enum `evento.estado`).
 *
 * Reutiliza los colores de estado de tarea a propósito: en una celda del
 * calendario conviven eventos y tareas, y "todavía no ha pasado" no puede
 * pintarse de dos colores distintos según de qué tabla venga la fila.
 */
export function bandaDeEvento(estado: string): EstadoDominio {
  switch (estado) {
    case "en_curso":
      return "tarea-progreso";
    case "completado":
      return "tarea-completada";
    case "cancelado":
      return "tarea-cancelada";
    default:
      return "tarea-pendiente";
  }
}

/** Nivel de confidencialidad o riesgo de un registro de psicología. */
export function bandaDeConfidencialidad(nivel: string): EstadoDominio {
  switch (nivel) {
    case "alto":
      return "confid-alto";
    case "medio":
      return "confid-medio";
    case "bajo":
      return "confid-bajo";
    default:
      return "neutral";
  }
}
