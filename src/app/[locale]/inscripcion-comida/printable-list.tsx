/**
 * Lista imprimible de inscritos a la comida de un día (administración).
 * Los controles de navegación e impresión se ocultan al imprimir
 * (`print:hidden`); solo se imprime la tabla de nombres.
 */
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Printer, ChevronLeft, ChevronRight, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InscritoComida } from "@/server/comida";

export function PrintableList({
  fechaLabel,
  inscritos,
  cerrado,
  prevHref,
  nextHref,
}: {
  fechaLabel: string;
  inscritos: InscritoComida[];
  cerrado: boolean;
  prevHref: string;
  nextHref: string;
}) {
  const t = useTranslations("comida");

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Controles (no se imprimen) */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-1">
          <Link
            href={prevHref}
            className="flex size-9 items-center justify-center rounded-md border border-input hover:bg-muted"
            aria-label={t("prevDay")}
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link
            href={nextHref}
            className="flex size-9 items-center justify-center rounded-md border border-input hover:bg-muted"
            aria-label={t("nextDay")}
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
        <Button onClick={() => window.print()} size="sm">
          <Printer className="size-4" />
          {t("print")}
        </Button>
      </div>

      {/* Encabezado imprimible */}
      <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-gold/15 text-gold print:bg-transparent">
          <Utensils className="size-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("adminTitle")}</h1>
          <p className="text-sm capitalize text-muted-foreground">{fechaLabel}</p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-medium print:hidden ${
            cerrado ? "bg-primary/10 text-primary" : "bg-gold/15 text-gold"
          }`}
        >
          {cerrado ? t("closed") : t("open")}
        </span>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        {t("total")}: <span className="font-semibold text-foreground">{inscritos.length}</span>
      </p>

      {inscritos.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {t("nobody")}
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="w-10 py-2">#</th>
              <th className="py-2">{t("namePlaceholder")}</th>
              <th className="w-24 py-2 text-right">Hora</th>
            </tr>
          </thead>
          <tbody>
            {inscritos.map((i, n) => (
              <tr key={i.id} className="border-b border-border/60">
                <td className="py-2 text-muted-foreground">{n + 1}</td>
                <td className="py-2 font-medium">{i.nombre}</td>
                <td className="py-2 text-right text-muted-foreground">
                  {i.hora_inscripcion?.slice(0, 5)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
