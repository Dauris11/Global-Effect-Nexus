/**
 * Color de una entrada del calendario.
 *
 * Vive aparte del componente para que la misma regla la usen todas las vistas
 * (mes, semana, día, lista) y cualquier módulo que muestre entradas: tareas,
 * proyectos, citas de psicología o eventos académicos.
 *
 * La regla: el color codifica **urgencia o estado**, nunca la categoría. Una
 * tarea lleva el color de su prioridad —el mismo de su riel en el tablero, para
 * reconocerla entre pantallas— y un evento el de su estado. La categoría se
 * comunica con texto, en el chip (docs/10-estandar-de-interfaz.md §3.2).
 */
import type { EntradaAgenda } from "@/server/operaciones/types";
import { bandaDeEvento, bandaDePrioridad, type EstadoDominio } from "@/lib/estados";

export function bandaDeEntrada(e: EntradaAgenda): EstadoDominio {
  return e.origen === "tarea" ? bandaDePrioridad(e.categoria) : bandaDeEvento(e.estado);
}
