/**
 * Preguntas Frecuentes — acordeón con animación.
 * Rediseño completo: tema oscuro, acento púrpura, sin tokens viejos.
 */
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import {
  LazyMotion,
  domAnimation,
  m,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import { cn } from "@/lib/utils";

const PREGUNTAS = ["q1", "q2", "q3", "q4"] as const;

export function PreguntasFrecuentes() {
  const t = useTranslations("landing");
  const [abierta, setAbierta] = useState<string | null>("q1");
  const reducido = useReducedMotion();

  const toggle = (clave: string) => setAbierta((p) => (p === clave ? null : clave));

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative bg-[#080c14] py-24 md:py-32"
    >
      {/* Separator */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/8 to-transparent"
      />
      {/* Bottom glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-1/2 -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(108,62,244,0.1),transparent_70%)]"
      />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[#818cf8]">
            {t("faqEyebrow")}
          </p>
          <h2
            id="faq-title"
            className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight text-white"
          >
            {t("faqTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/45">
            {t("faqIntro")}
          </p>
        </div>

        {/* Accordion */}
        <LazyMotion features={domAnimation}>
          <div className="mx-auto mt-14 max-w-3xl space-y-3">
            {PREGUNTAS.map((clave) => {
              const isOpen = abierta === clave;
              const titleKey = `faq_${clave}_title` as const;
              const descKey  = `faq_${clave}_desc`  as const;

              return (
                <div
                  key={clave}
                  className={cn(
                    "overflow-hidden rounded-2xl border transition-all duration-200",
                    isOpen
                      ? "border-[#6C3EF4]/40 bg-[#6C3EF4]/[0.06] shadow-[0_0_40px_rgba(108,62,244,0.12)]"
                      : "border-white/8 bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.04]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggle(clave)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${clave}`}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3EF4] focus-visible:ring-inset"
                  >
                    <span className="font-display text-base font-semibold text-white md:text-lg">
                      {t(titleKey)}
                    </span>
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                        isOpen
                          ? "rotate-180 border-[#6C3EF4]/50 bg-[#6C3EF4]/20 text-[#818cf8]"
                          : "border-white/10 bg-white/5 text-white/40",
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
                        <div className="border-t border-white/8 px-6 pb-6 pt-4 text-sm leading-relaxed text-white/50">
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
