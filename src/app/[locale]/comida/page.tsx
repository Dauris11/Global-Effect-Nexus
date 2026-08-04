/**
 * Página pública de inscripción de comida (Módulo 25). No requiere login.
 * Permite inscribirse para VARIOS días de la semana de una vez (pre-registro).
 * Muestra el conteo de inscritos de hoy. Los días futuros van apareciendo al
 * administrador cada día automáticamente (una fila por fecha).
 */
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, Utensils } from "lucide-react";
import { MealForm, type DiaOpcion } from "./meal-form";
import { contarInscritosHoy } from "@/server/comida";

export const dynamic = "force-dynamic";

const HORA_LIMITE_MIN = 8 * 60 + 30;
const pad = (n: number) => String(n).padStart(2, "0");

/** Próximos N días hábiles (lun–vie) desde hoy, con etiqueta y estado. */
function proximosDiasHabiles(n: number, locale: string): DiaOpcion[] {
  const ahora = new Date();
  const cerradoHoy = ahora.getHours() * 60 + ahora.getMinutes() > HORA_LIMITE_MIN;
  const hoyISO = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}`;
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "long", day: "2-digit", month: "short" });

  const dias: DiaOpcion[] = [];
  const cursor = new Date(ahora);
  while (dias.length < n) {
    const g = cursor.getDay();
    if (g !== 0 && g !== 6) {
      const value = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`;
      dias.push({ value, label: fmt.format(cursor), disabled: value === hoyISO && cerradoHoy });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dias;
}

export default async function ComidaPage() {
  const t = await getTranslations("comida");
  const locale = await getLocale();

  let inscritos = 0;
  try {
    inscritos = await contarInscritosHoy();
  } catch {
    /* BD no disponible */
  }
  const dias = proximosDiasHabiles(5, locale);

  return (
    // Respeta el tema global (oscuro por defecto, con toggle) igual que la landing.
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Global Effect
        </Link>

        <div className="flex size-12 items-center justify-center rounded-lg bg-brand-gold/15 text-brand-gold">
          <Utensils className="size-7" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("multiSubtitle")}</p>
        </div>

        <div className="rounded-lg bg-muted px-4 py-3 text-center">
          <div className="text-3xl font-bold text-brand-teal">{inscritos}</div>
          <div className="text-xs text-muted-foreground">{t("enrolledToday")}</div>
        </div>

        <MealForm dias={dias} />
      </div>
    </main>
  );
}
