/**
 * Envoltorios de navegación conscientes del idioma (Link, redirect,
 * usePathname, useRouter, getPathname) que preservan el prefijo de locale.
 * Usar estos en lugar de los de next/navigation dentro del área localizada.
 */
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
