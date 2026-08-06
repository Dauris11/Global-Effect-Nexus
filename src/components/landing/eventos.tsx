/**
 * Bloque "Eventos" — próximas actividades institucionales.
 *
 * La sección entera desaparece cuando no hay eventos publicados: es mejor no
 * mostrarla que dejar un hueco con un mensaje de vacío en una página pública.
 */
import { CalendarDays, MapPin } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { EventoPublico } from "@/server/landing/types";

export async function Eventos({ eventos }: { eventos: EventoPublico[] }) {
  if (eventos.length === 0) return null;

  const t = await getTranslations("landing");
  const locale = await getLocale();
  const fechaLocale = locale === "en" ? enUS : es;

  return (
    <section id="eventos" className="border-y border-slate-200 bg-white py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="text-xs uppercase tracking-widest text-[#2096BA]">
          {t("eyebrowCalendar")}
        </p>
        <h2 className="font-heading mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
          {t("eventsTitle")}
        </h2>

        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {eventos.map((e) => (
            <li
              key={e.id}
              className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-[#2096BA]/40 hover:bg-[#2096BA]/5"
            >
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2096BA]/10 text-[#2096BA]"
              >
                <CalendarDays className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900">{e.titulo}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {format(new Date(e.fecha), "dd 'de' MMMM, yyyy", { locale: fechaLocale })}
                </p>
                {e.ubicacion && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{e.ubicacion}</span>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
