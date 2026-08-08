"use client";

import * as React from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  startOfDay,
} from "date-fns";
import { es, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { aFecha } from "@/lib/fechas";

interface MiniCalendarProps {
  /** Lista de fechas (strings o objetos Date) que tienen eventos programados */
  fechasConEventos: (string | Date)[];
  /**
   * Si se pasa, el calendario deja de ser solo lectura: cada día se vuelve un
   * botón. Se usa para pedir cita de psicología; en el portal se omite y el
   * calendario sigue siendo un panel informativo.
   */
  onSeleccionar?: (fecha: Date) => void;
  /** Día marcado como elegido (solo con `onSeleccionar`). */
  seleccionada?: Date | null;
  /** Día más antiguo elegible; los anteriores salen deshabilitados. */
  minima?: Date;
}

export function MiniCalendar({
  fechasConEventos,
  onSeleccionar,
  seleccionada,
  minima,
}: MiniCalendarProps) {
  const localeStr = useLocale();
  const dateLocale = localeStr === "en" ? enUS : es;
  const [currentDate, setCurrentDate] = React.useState(new Date());

  // Funciones de navegación
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Cálculo de la cuadrícula
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: dateLocale });
  const endDate = endOfWeek(monthEnd, { locale: dateLocale });

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Nombres de los días (Lun, Mar, Mié...)
  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date(), { locale: dateLocale }),
    end: endOfWeek(new Date(), { locale: dateLocale }),
  }).map((day) => format(day, "EE", { locale: dateLocale }));

  // Las fechas llegan como "YYYY-MM-DD": hay que leerlas en horario local o el
  // punto del evento aparece un día antes (ver `aFecha`).
  const eventDates = fechasConEventos.map(aFecha);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm text-card-foreground">
      {/* Header del Calendario */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold capitalize">
          {format(currentDate, "MMMM yyyy", { locale: dateLocale })}
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Cuadrícula de fechas */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isSelectedMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);
          const hasEvent = eventDates.some((eventDate) => isSameDay(eventDate, day));
          const esElegida = seleccionada != null && isSameDay(seleccionada, day);
          // `startOfDay` en ambos lados: comparar un Date con hora contra la
          // medianoche de hoy dejaría el propio día de hoy fuera.
          const bloqueada = minima != null && startOfDay(day) < startOfDay(minima);

          const contenido = (
            <>
              <span className={cn("z-10", hasEvent && !isDayToday && "mb-1")}>
                {format(day, dateFormat)}
              </span>
              {hasEvent && (
                <span
                  className={cn(
                    "absolute bottom-1 h-1 w-1 rounded-full",
                    isDayToday || esElegida ? "bg-primary-foreground" : "bg-primary",
                  )}
                />
              )}
            </>
          );

          const clases = cn(
            "relative flex h-8 w-full items-center justify-center rounded-full text-[13px] font-medium transition-colors",
            !isSelectedMonth && "text-muted-foreground/30",
            isSelectedMonth && !isDayToday && !esElegida && "hover:bg-muted",
            isDayToday && !esElegida && "bg-primary text-primary-foreground shadow-sm",
            esElegida && "bg-[#0a6a8a] text-white shadow-sm ring-2 ring-[#0a6a8a]/30",
            bloqueada && "cursor-not-allowed opacity-40 hover:bg-transparent",
          );

          if (!onSeleccionar) {
            return (
              <div key={idx} className={clases}>
                {contenido}
              </div>
            );
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={bloqueada}
              onClick={() => onSeleccionar(day)}
              aria-pressed={esElegida}
              aria-label={format(day, "EEEE d 'de' MMMM yyyy", { locale: dateLocale })}
              className={clases}
            >
              {contenido}
            </button>
          );
        })}
      </div>
    </div>
  );
}
