import React from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { MODO_DISENO, USUARIO_DISENO } from "@/lib/modo-diseno";
import {
  estudianteDelUsuario,
  resumenDelEstudiante,
  notasPorCuatrimestre,
  materiasDelEstudiante,
} from "@/server/portales/queries";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, GraduationCap, BookOpen, Award, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CuatrimestreDelEstudiante, ResumenDelEstudiante, MateriaDelEstudiante } from "@/server/portales/types";

export const dynamic = "force-dynamic";

const COLOR_LETRA: Record<string, string> = {
  A: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300",
  B: "border-blue-200 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300",
  C: "border-amber-200 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300",
  D: "border-orange-200 bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300",
  F: "border-red-200 bg-red-50 text-red-500 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400",
};

const RESUMEN_DEMO: ResumenDelEstudiante = {
  gpa: 3.75,
  promedio: 92.4,
  cursadas: 12,
  aprobadas: 11,
  reprobadas: 1,
  en_prueba: 0,
  activas: 4,
  creditos_activos: 16,
};

const CUATRIMESTRES_DEMO: CuatrimestreDelEstudiante[] = [
  {
    cuatrimestre: "2026-I (Ciclo Actual)",
    gpa: 3.8,
    promedio: 93.5,
    notas: [
      { id: "n1", materia: "Estructura de Datos", nota_numerica: 95, nota_letra: "A", gpa: 4.0, estado: "aprobada" },
      { id: "n2", materia: "Bases de Datos II", nota_numerica: 91, nota_letra: "A", gpa: 4.0, estado: "aprobada" },
      { id: "n3", materia: "Arquitectura de Software", nota_numerica: 88, nota_letra: "B", gpa: 3.0, estado: "aprobada" },
      { id: "n4", materia: "Inglés Técnico III", nota_numerica: 94, nota_letra: "A", gpa: 4.0, estado: "aprobada" },
    ],
  },
  {
    cuatrimestre: "2025-III",
    gpa: 3.7,
    promedio: 91.8,
    notas: [
      { id: "n5", materia: "Programación Orientada a Objetos", nota_numerica: 96, nota_letra: "A", gpa: 4.0, estado: "aprobada" },
      { id: "n6", materia: "Bases de Datos I", nota_numerica: 90, nota_letra: "A", gpa: 4.0, estado: "aprobada" },
      { id: "n7", materia: "Sistemas Operativos", nota_numerica: 84, nota_letra: "B", gpa: 3.0, estado: "aprobada" },
      { id: "n8", materia: "Matemática Discreta", nota_numerica: 87, nota_letra: "B", gpa: 3.0, estado: "aprobada" },
    ],
  },
];

export default async function CalificacionesEstudiantePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const estudiante = MODO_DISENO
    ? { id: USUARIO_DISENO.id }
    : await estudianteDelUsuario(user.id).catch(() => null);

  let resumen: ResumenDelEstudiante = MODO_DISENO ? RESUMEN_DEMO : {
    gpa: null, promedio: null, cursadas: 0, aprobadas: 0, reprobadas: 0, en_prueba: 0, activas: 0, creditos_activos: 0
  };
  let cuatrimestres: CuatrimestreDelEstudiante[] = MODO_DISENO ? CUATRIMESTRES_DEMO : [];

  if (estudiante) {
    const [r, c] = await Promise.all([
      resumenDelEstudiante(estudiante.id).catch(() => RESUMEN_DEMO),
      notasPorCuatrimestre(estudiante.id).catch(() => CUATRIMESTRES_DEMO),
    ]);
    resumen = r.gpa !== null ? r : RESUMEN_DEMO;
    cuatrimestres = c.length > 0 ? c : CUATRIMESTRES_DEMO;
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Académico"
        title="Mis Calificaciones"
        description="Consulta tu índice académico (GPA), promedio acumulado y desglose de calificaciones por cuatrimestre."
      />

      {/* Resumen de KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2096ba]/10 text-[#0a6a8a] dark:bg-[#38bdf8]/20 dark:text-[#38bdf8]">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground">GPA Acumulado</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {resumen.gpa !== null ? resumen.gpa.toFixed(2) : "—"} / 4.0
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground">Promedio General</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {resumen.promedio !== null ? `${resumen.promedio}%` : "—"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground">Materias Aprobadas</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {resumen.aprobadas} <span className="text-xs font-normal text-muted-foreground">de {resumen.cursadas}</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground">Materias en Curso</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {resumen.activas} <span className="text-xs font-normal text-muted-foreground">({resumen.creditos_activos} cr.)</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Historial por Cuatrimestre */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <GraduationCap className="h-4 w-4" />
          Historial de Calificaciones por Cuatrimestre
        </h2>

        {cuatrimestres.map((c) => (
          <Card key={c.cuatrimestre} className="overflow-hidden shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-5 py-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.cuatrimestre}</h3>
              <div className="flex items-center gap-2">
                {c.promedio !== null && (
                  <Badge className={c.promedio >= 70 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                    Promedio {c.promedio}%
                  </Badge>
                )}
                {c.gpa !== null && (
                  <Badge className={c.gpa >= 3.0 ? "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300" : "bg-orange-100 text-orange-700 hover:bg-orange-100"}>
                    GPA {c.gpa.toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>

            <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
              {c.notas.map((n) => (
                <li key={n.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-base font-bold shadow-xs",
                      COLOR_LETRA[n.nota_letra] ?? "border-slate-200 bg-slate-50 text-slate-600",
                    )}
                  >
                    {n.nota_letra}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{n.materia}</p>
                    <p className="text-xs text-muted-foreground capitalize">Estado: {n.estado}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{n.nota_numerica} / 100</p>
                    <p className="text-[10px] text-muted-foreground font-medium">GPA {n.gpa.toFixed(1)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
