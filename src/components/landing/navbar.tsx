/**
 * Navbar de la landing — "Impact Editorial".
 *
 * Tres arreglos sobre la versión anterior:
 *
 * - **La sección activa se detecta con `IntersectionObserver`, no con
 *   aritmética de `scrollY`.** Antes, cada evento de desplazamiento recorría las
 *   cuatro secciones llamando a `offsetTop`/`offsetHeight`, y cada una de esas
 *   lecturas fuerza al navegador a recalcular la maqueta. Eso es *layout
 *   thrashing* en el bucle más caliente de la página. El observador da el mismo
 *   dato sin tocar la maqueta y sin escuchar el scroll.
 * - **Barra de progreso de lectura.** La landing es larga y no había ninguna
 *   pista de cuánto quedaba. Se escribe directamente sobre el `style` del
 *   elemento desde `requestAnimationFrame`: sin estado de React, así que
 *   desplazarse no vuelve a renderizar la cabecera.
 * - **La cabecera se compacta al bajar** (64px → 56px) y aparece su sombra. Es la
 *   señal de "te separaste del principio" y devuelve altura de pantalla al
 *   contenido.
 *
 * El aviso del comedor es ahora un enlace: era la información más urgente de la
 * página y no llevaba a ninguna parte.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X, ArrowRight, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { SelectorIdioma } from "@/components/layout/selector-idioma";
import { cn } from "@/lib/utils";

const SECCIONES = [
  { href: "#patrocinio", clave: "navSponsors" },
  { href: "#acceso", clave: "navAccess" },
  { href: "#labor", clave: "navWork" },
  { href: "#eventos", clave: "navEventos" },
  { href: "#faq", clave: "navFaq" },
] as const;

export function Navbar() {
  const t = useTranslations("landing");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [activa, setActiva] = useState<string>("");
  const [compacta, setCompacta] = useState(false);
  const progresoRef = useRef<HTMLDivElement>(null);

  /** Sección visible: el observador avisa, nadie mide la maqueta. */
  useEffect(() => {
    const objetivos = SECCIONES.map((s) => document.querySelector(s.href)).filter(
      (el): el is Element => el !== null,
    );
    if (objetivos.length === 0) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        // La activa es la más visible de las que están en pantalla; con varias
        // a la vez (secciones cortas) gana la que ocupa más área.
        const visible = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiva(`#${visible.target.id}`);
      },
      // La franja central de la pantalla decide: una sección "es" la activa
      // cuando ocupa el centro, no cuando asoma por el borde inferior.
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.5, 1] },
    );
    objetivos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, []);

  /** Progreso de lectura y compactado. Un solo listener, agrupado en un frame. */
  useEffect(() => {
    let frame = 0;

    const medir = () => {
      frame = 0;
      const doc = document.documentElement;
      const recorrido = doc.scrollHeight - doc.clientHeight;
      const p = recorrido > 0 ? Math.min(doc.scrollTop / recorrido, 1) : 0;
      if (progresoRef.current) progresoRef.current.style.transform = `scaleX(${p})`;
      setCompacta(doc.scrollTop > 24);
    };

    const alDesplazar = () => {
      if (frame) return;
      frame = requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener("scroll", alDesplazar, { passive: true });
    window.addEventListener("resize", alDesplazar, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", alDesplazar);
      window.removeEventListener("resize", alDesplazar);
    };
  }, []);

  /** `Esc` cierra el cajón móvil (§8: lo que se abre se cierra con teclado). */
  useEffect(() => {
    if (!menuAbierto) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuAbierto(false);
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [menuAbierto]);

  return (
    <>
      {/* Aviso de servicio: el comedor es lo único con hora de cierre */}
      <div className="border-b border-white/10 bg-brand-charcoal px-4 py-2 font-mono text-sm text-white/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <Link
            href="/comida"
            className="group flex min-w-0 items-center gap-2 transition-colors hover:text-white"
          >
            <Clock className="size-3.5 shrink-0 text-brand-gold" aria-hidden />
            <span className="truncate">{t("mealNoticePill")}</span>
            <ArrowRight
              className="size-3 shrink-0 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100"
              aria-hidden
            />
          </Link>
          <div className="hidden shrink-0 items-center gap-2 text-xs text-white/50 sm:flex">
            <span aria-hidden className="inline-block size-2 rounded-full bg-emerald-500" />
            <span>{t("systemStatusPill")}</span>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md",
          "transition-shadow duration-200",
          compacta && "shadow-plana",
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between gap-4 px-6",
            "transition-[height] duration-200 ease-out",
            compacta ? "h-16" : "h-20",
          )}
        >
          <Link href="/" aria-label="Global Effect" className="flex shrink-0 items-center">
            <span className="flex items-center rounded-lg bg-brand-charcoal px-3 py-2 transition-opacity hover:opacity-95 shadow-md">
              <Logo className={cn("w-auto transition-all duration-200", compacta ? "h-8" : "h-10")} priority />
            </span>
          </Link>

          {/* Navegación de escritorio */}
          <nav className="hidden items-center gap-8 font-mono text-[13px] uppercase tracking-[0.12em] text-muted-foreground lg:flex">
            {SECCIONES.map((s) => {
              const esActiva = activa === s.href;
              return (
                <a
                  key={s.href}
                  href={s.href}
                  aria-current={esActiva ? "true" : undefined}
                  className={cn(
                    "relative py-1 transition-colors duration-150 hover:text-foreground",
                    esActiva ? "font-semibold text-foreground" : "",
                  )}
                >
                  {t(s.clave)}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-primary transition-all duration-200 ease-out",
                      esActiva ? "w-full opacity-100" : "w-0 opacity-0",
                    )}
                  />
                </a>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <SelectorIdioma />
            <Link
              href="/login"
              className="group hidden items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-base font-semibold text-primary-foreground transition duration-150 ease-out hover:bg-brand-teal-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
            >
              {t("enter")}
              <ArrowRight
                className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>

            <button
              type="button"
              onClick={() => setMenuAbierto((p) => !p)}
              aria-label={menuAbierto ? t("menuClose") : t("menuOpen")}
              aria-expanded={menuAbierto}
              aria-controls="menu-movil"
              className="flex size-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent lg:hidden"
            >
              {menuAbierto ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Progreso de lectura: se escala por transform, no se re-renderiza */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-transparent"
        >
          <div
            ref={progresoRef}
            className="h-full w-full origin-left bg-primary"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        {/* Cajón móvil */}
        {menuAbierto && (
          <div
            id="menu-movil"
            className="animate-fade-up border-b border-border bg-background p-6 lg:hidden"
          >
            <nav className="flex flex-col gap-1 font-mono text-sm uppercase tracking-[0.12em]">
              {SECCIONES.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  onClick={() => setMenuAbierto(false)}
                  className={cn(
                    "flex items-center justify-between border-b border-border/50 py-3 transition-colors",
                    activa === s.href
                      ? "font-semibold text-primary"
                      : "text-foreground/80 hover:text-primary",
                  )}
                >
                  {t(s.clave)}
                  <ArrowRight className="size-3.5 opacity-40" aria-hidden />
                </a>
              ))}
              <div className="mt-4 grid gap-2">
                <Link
                  href="/login"
                  onClick={() => setMenuAbierto(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-base font-semibold text-primary-foreground"
                >
                  {t("enter")}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href="/comida"
                  onClick={() => setMenuAbierto(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-gold/50 bg-brand-gold/10 py-3 text-base font-semibold text-brand-gold"
                >
                  {t("access_meals_cta")}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
