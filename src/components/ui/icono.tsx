/**
 * Registro de iconos del sistema.
 *
 * Un componente de servidor no puede pasar un componente de icono como prop a
 * un componente cliente: React solo serializa datos planos a través de esa
 * frontera. Por eso los iconos se referencian **por nombre** y se resuelven
 * aquí, del lado del cliente.
 *
 * Es también el sitio donde se decide qué iconos existen en el producto. Uno
 * nuevo se añade a este mapa, no se importa suelto en una pantalla.
 * Solo `lucide-react`; nunca emojis.
 */
"use client";

import { createElement } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Folder,
  FolderKanban,
  GraduationCap,
  Heart,
  HeartHandshake,
  LayoutDashboard,
  Lock,
  ListChecks,
  Settings,
  User,
  UserCog,
  Users,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export const ICONOS = {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Folder,
  FolderKanban,
  GraduationCap,
  Heart,
  HeartHandshake,
  LayoutDashboard,
  Lock,
  ListChecks,
  Settings,
  User,
  UserCog,
  Users,
  Utensils,
  Wallet,
} satisfies Record<string, LucideIcon>;

/** Nombres válidos. Usar este tipo en los props evita nombres inventados. */
export type NombreIcono = keyof typeof ICONOS;

/** Resuelve un icono por nombre. Devuelve `null` si el nombre no existe. */
export function iconoPorNombre(nombre: string): LucideIcon | null {
  return (ICONOS as Record<string, LucideIcon>)[nombre] ?? null;
}

/**
 * Pinta un icono del registro. No renderiza nada si el nombre no existe.
 *
 * Se usa `createElement` en vez de JSX porque el componente se resuelve en
 * tiempo de ejecución: con JSX, el linter no puede distinguir una búsqueda en
 * un mapa estático de un componente definido dentro del render.
 */
export function Icono({
  nombre,
  className,
}: {
  nombre: string;
  className?: string;
}) {
  const componente = iconoPorNombre(nombre);
  if (!componente) return null;
  return createElement(componente, { className, "aria-hidden": true });
}
