"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format, subMonths, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Check, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { RegistroServicio } from "@/server/operaciones/types";
import { upsertRegistroServicio } from "@/server/operaciones/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";

interface Props {
  mesInicial: string;
  registros: RegistroServicio[];
  puedeEscribir: boolean;
}

export function ServiciosMensualesClient({ mesInicial, registros, puedeEscribir }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [isPending, startTransition] = useTransition();
  const [mesActual, setMesActual] = useState(mesInicial);

  const stats = {
    total: registros.length,
    hicieronServicio: registros.filter((r) => r.hizo_servicio).length,
    asistieronReunion: registros.filter((r) => r.asistio_reunion).length,
  };

  const handleMonthChange = (offset: number) => {
    const d = new Date(`${mesActual}-15T12:00:00`);
    const nuevo = offset > 0 ? addMonths(d, offset) : subMonths(d, Math.abs(offset));
    const param = format(nuevo, "yyyy-MM");
    
    setMesActual(param);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("mes", param);
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const toggleServicio = async (estudiante_id: string, campo: "hizo_servicio" | "asistio_reunion", valorActual: boolean) => {
    if (!puedeEscribir) return;

    const registro = registros.find((r) => r.estudiante_id === estudiante_id);
    if (!registro) return;

    startTransition(async () => {
      try {
        await upsertRegistroServicio({
          estudiante_id,
          mes: mesActual,
          hizo_servicio: campo === "hizo_servicio" ? !valorActual : registro.hizo_servicio,
          asistio_reunion: campo === "asistio_reunion" ? !valorActual : registro.asistio_reunion,
          notas: registro.notas,
        });
      } catch (e) {
        console.error("Error guardando el registro", e);
      }
    });
  };

  const mesFormateado = format(new Date(`${mesActual}-15T12:00:00`), "MMMM yyyy", { locale: es });

  return (
    <div className="space-y-6">
      {/* Navegación y Resumen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-zinc-800 rounded-lg p-1 shadow-sm w-fit">
          <Button variant="ghost" size="icon" onClick={() => handleMonthChange(-1)} disabled={isPending}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[120px] text-center text-sm font-medium capitalize">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" /> : mesFormateado}
          </span>
          <Button variant="ghost" size="icon" onClick={() => handleMonthChange(1)} disabled={isPending}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Estudiantes Activos"
          value={stats.total}
          icon="Users"
          className="bg-white dark:bg-[#18181c]"
        />
        <StatCard
          label="Hicieron Servicio"
          value={stats.hicieronServicio}
          icon="HeartHandshake"
          className="bg-white dark:bg-[#18181c]"
          hint={`${stats.total > 0 ? Math.round((stats.hicieronServicio / stats.total) * 100) : 0}% del total`}
        />
        <StatCard
          label="Asistieron a Reunión"
          value={stats.asistieronReunion}
          icon="CalendarDays"
          className="bg-white dark:bg-[#18181c]"
          hint={`${stats.total > 0 ? Math.round((stats.asistieronReunion / stats.total) * 100) : 0}% del total`}
        />
      </div>

      {/* Tabla de registros */}
      <Card className="shadow-sm border-slate-200 dark:border-zinc-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Estudiante</th>
                  <th className="px-6 py-4 font-medium text-center w-40">Servicio Comunitario</th>
                  <th className="px-6 py-4 font-medium text-center w-40">Reunión Mensual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                {registros.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                      No hay estudiantes activos para este mes.
                    </td>
                  </tr>
                ) : (
                  registros.map((r) => (
                    <tr key={r.estudiante_id} className="group hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{r.estudiante_nombre}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          {puedeEscribir ? (
                            <Checkbox
                              checked={r.hizo_servicio}
                              onCheckedChange={() => toggleServicio(r.estudiante_id, "hizo_servicio", r.hizo_servicio)}
                              disabled={isPending}
                            />
                          ) : (
                            <div className={cn("flex h-6 w-6 items-center justify-center rounded-full", r.hizo_servicio ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
                              {r.hizo_servicio ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          {puedeEscribir ? (
                            <Checkbox
                              checked={r.asistio_reunion}
                              onCheckedChange={() => toggleServicio(r.estudiante_id, "asistio_reunion", r.asistio_reunion)}
                              disabled={isPending}
                            />
                          ) : (
                            <div className={cn("flex h-6 w-6 items-center justify-center rounded-full", r.asistio_reunion ? "bg-purple-100 text-purple-600" : "bg-rose-100 text-rose-600")}>
                              {r.asistio_reunion ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
