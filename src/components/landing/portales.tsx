/**
 * Atajos por área — botones de icono con el nombre debajo.
 *
 * Viven dentro de la banda de Acceso, debajo de las tres puertas grandes, y
 * resuelven un caso que esas tres no cubren: quien ya sabe a dónde va. Las
 * fichas de arriba explican; esto lleva.
 *
 * **Por qué apuntan a la pantalla y no a `/login`.** El enlace va directo a
 * `/portal/estudiante`, `/expedientes`, etc. Si no hay sesión, `proxy.ts` ya
 * responde `307` a `/login?redirectTo=…` y, tras entrar, la persona aterriza en
 * la pantalla que pulsó. Mandarlos a `/login` a secas obligaría a navegar otra
 * vez desde el menú, y perderíamos el destino que el usuario acababa de decir.
 * Con sesión abierta, el enlace es directo y no pasa por login.
 *
 * **Por qué no están los seis roles.** Psicología y Contabilidad no tienen aún
 * pantalla propia (su UI llega en S7/S8), y un botón que promete un área y
 * descarga en el panel general es una mentira pequeña que se paga en confianza.
 * Aquí solo hay destinos que existen. Falta permiso, no destino: si alguien
 * pulsa un área que su rol no alcanza, el RBAC del servidor lo detiene — eso es
 * correcto y no algo que la landing deba adivinar.
 *
 * Movimiento (docs/10 §7 y la lista de la skill de diseño):
 *
 * - Entrada en cascada con `Revelar`, 40ms entre botones — dentro de la ventana
 *   de 30–80ms; más lento y la fila se lee como si cargara.
 * - `active:scale-[0.97]`: la respuesta al pulsar. Sin ella un botón grande y
 *   plano no confirma que oyó el clic.
 * - Se transicionan **propiedades nombradas**, nunca `all`: solo `transform`,
 *   color y borde entran en la transición, que son las que no provocan layout.
 * - 150ms y `ease-out`. El hover de una fila de seis se ve decenas de veces por
 *   sesión; a 300ms se volvería pesado.
 * - `hover:` en Tailwind 4 ya va dentro de `@media (hover: hover)`, así que en
 *   táctil no se queda pegado tras el toque.
 */
import { getTranslations } from "next-intl/server";
import {
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  Users,
  Library,
  Calendar,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Revelar } from "./revelar";

const PORTALES = [
  { clave: "estudiante", href: "/portal/estudiante", icono: GraduationCap },
  { clave: "docente", href: "/portal/profesor", icono: BookOpen },
  { clave: "panel", href: "/dashboard", icono: LayoutDashboard },
  { clave: "expedientes", href: "/expedientes", icono: Users },
  { clave: "academico", href: "/academico/materias", icono: Library },
  { clave: "calendario", href: "/calendario", icono: Calendar },
] as const;

export async function Portales() {
  const t = await getTranslations("landing");

  return (
    <div className="mt-16 border-t border-border pt-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        {t("portalsLabel")}
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {PORTALES.map(({ clave, href, icono: Icono }, i) => (
          <Revelar key={clave} como="li" retardo={0.04 * i} y={10}>
            <Link
              href={href}
              className="group flex h-full flex-col items-center gap-3 rounded-xl border border-border bg-card px-3 py-5 text-center transition-[transform,border-color,background-color] duration-150 ease-out hover:-translate-y-0.5 hover:border-primary/50 hover:bg-accent/40 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-150 ease-out group-hover:scale-105">
                <Icono className="size-5" strokeWidth={1.7} aria-hidden />
              </span>
              <span className="text-[13px] font-semibold leading-tight text-foreground transition-colors duration-150 ease-out group-hover:text-primary">
                {t(`portal_${clave}` as never)}
              </span>
            </Link>
          </Revelar>
        ))}
      </ul>

      <p className="mt-5 text-[13px] text-muted-foreground">{t("portalsHint")}</p>
    </div>
  );
}
