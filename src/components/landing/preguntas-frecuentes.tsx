/**
 * Sección de Preguntas Frecuentes — Landing Pública ("Impact Editorial").
 *
 * Ofrece claridad inmediata a patrocinadores internacionales y familias locales.
 * Accesible por teclado, responsive y animada con Motion.
 */
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, HelpCircle } from "lucide-react";
import {
  LazyMotion,
  domAnimation,
  m,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import { cn } from "@/lib/utils";
import { SeccionEncabezado } from "./seccion";

const PREGUNTAS = ["q1", "q2", "q3", "q4"] as const;

export function PreguntasFrecuentes() {
  const t = useTranslations("landing");
  const [abierta, setAbierta] = useState<string | null>("q1");
  /**
   * La regla global de `prefers-reduced-motion` de `globals.css` solo alcanza a
   * las transiciones y animaciones de CSS. Motion anima desde JavaScript y se
   * la salta, así que el despliegue del acordeón hay que apagarlo aquí a mano:
   * con movimiento reducido la respuesta aparece y desaparece sin desplegarse.
   */
  const reducido = useReducedMotion();

  const toggle = (clave: string) => {
    setAbierta((prev) => (prev === clave ? null : clave));
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="border-t border-border bg-background py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <SeccionEncabezado
          idTitulo="faq-title"
          eyebrow={t("faqEyebrow")}
          titulo={t("faqTitle")}
          intro={t("faqIntro")}
        />

        <LazyMotion features={domAnimation}>
          <div className="mt-12 space-y-3 max-w-4xl">
            {PREGUNTAS.map((clave) => {
              const isOpen = abierta === clave;
              const titleKey = `faq_${clave}_title` as const;
              const descKey = `faq_${clave}_desc` as const;

              return (
                <div
                  key={clave}
                  className={cn(
                    "overflow-hidden rounded-xl border transition-all duration-200",
                    isOpen
                      ? "border-primary/40 bg-card shadow-sm"
                      : "border-border bg-card/60 hover:border-border/80 hover:bg-card",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggle(clave)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${clave}`}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <span className="flex items-center gap-3 font-display text-lg font-semibold text-foreground">
                      <HelpCircle className="size-5 shrink-0 text-primary" aria-hidden />
                      {t(titleKey)}
                    </span>
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted transition-transform duration-200",
                        isOpen && "rotate-180 bg-primary/10 text-primary",
                      )}
                    >
                      <ChevronDown className="size-4" aria-hidden />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <m.div
                        id={`faq-answer-${clave}`}
                        initial={reducido ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reducido ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={
                          reducido
                            ? { duration: 0 }
                            : { duration: 0.25, ease: [0.23, 1, 0.32, 1] }
                        }
                      >
                        <div className="border-t border-border/60 px-5 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground">
                          {t(descKey)}
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </LazyMotion>
      </div>
    </section>
  );
}
