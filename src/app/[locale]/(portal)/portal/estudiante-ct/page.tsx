/**
 * Portal Estudiante · Cursos Técnicos — vista académica compacta.
 *
 * A diferencia del portal estudiantil general, esta pantalla no lleva banner
 * de rol: quien entra ya eligió su rol en el selector, y repetirlo aquí solo
 * añadiría ruido. El encabezado es plano y el ancho baja a `max-w-4xl` porque
 * todo el contenido es una columna de lectura, no un tablero.
 *
 * La alerta de prueba académica aparece únicamente por debajo de 2.0 de GPA,
 * que es el umbral del que depende la beca. Es una advertencia, no un castigo:
 * por eso va en ámbar y no en rojo.
 */
import { redirect } from "next/navigation";
import { AlertTriangle, BookOpen, GraduationCap, Star } from "lucide-react";
import { currentUser } from "@/lib/auth";
import {
  estudianteDelUsuario,
  materiasDelEstudiante,
  notasPorCuatrimestre,
  resumenDelEstudiante,
} from "@/server/portales/queries";
import type {
  CuatrimestreDelEstudiante,
  MateriaDelEstudiante,
  ResumenDelEstudiante,
} from "@/server/portales/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EstadoVacio } from "@/components/portal/card-lista";

export const dynamic = "force-dynamic";

/** Color de la letra según la banda de la nota. Literales para Tailwind. */
const COLOR_LETRA: Record<string, string> = {
  A: "border-emerald-200 bg-emerald-50 text-emerald-600",
  B: "border-blue-200 bg-blue-50 text-blue-600",
  C: "border-amber-200 bg-amber-50 text-amber-600",
  D: "border-orange-200 bg-orange-50 text-orange-600",
  F: "border-red-200 bg-red-50 text-red-500",
};

export default async function PortalEstudianteCtPage() {
  const usuario = await currentUser();
  if (!usuario) redirect("/login");

  const estudiante = await estudianteDelUsuario(usuario.id);
  if (!estudiante) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <EstadoVacio mensaje="Tu usuario todavía no está enlazado a un expediente de estudiante. Habla con administración para que lo vinculen." />
      </div>
    );
  }

  let resumen: ResumenDelEstudiante = {
    gpa: null,
    promedio: null,
    cursadas: 0,
    aprobadas: 0,
    reprobadas: 0,
    en_prueba: 0,
    activas: 0,
    creditos_activos: 0,
  };
  let materias: MateriaDelEstudiante[] = [];
  let cuatrimestres: CuatrimestreDelEstudiante[] = [];
  try {
    [resumen, materias, cuatrimestres] = await Promise.all([
      resumenDelEstudiante(estudiante.id),
      materiasDelEstudiante(estudiante.id),
      notasPorCuatrimestre(estudiante.id),
    ]);
  } catch {
    /* Sin BD la pantalla se pinta con estados vacíos. */
  }

  const enPrueba = resumen.gpa !== null && resumen.gpa < 2.0;

  const stats = [
    {
      label: "Promedio",
      valor: resumen.promedio !== null ? `${resumen.promedio}%` : "—",
      tono:
        resumen.promedio === null
          ? "text-foreground"
          : resumen.promedio >= 70
            ? "text-emerald-600"
            : "text-red-500",
    },
    {
      label: "GPA",
      valor: resumen.gpa !== null ? resumen.gpa.toFixed(2) : "—",
      tono:
        resumen.gpa === null
          ? "text-foreground"
          : resumen.gpa >= 2.0
            ? "text-emerald-600"
            : "text-red-500",
    },
    { label: "Aprobadas", valor: String(resumen.aprobadas), tono: "text-foreground" },
    { label: "Materias activas", valor: String(resumen.activas), tono: "text-foreground" },
  ];

  return (
    <div className="portal-page mx-auto max-w-4xl space-y-6">
      <header className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <GraduationCap className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-heading text-xl font-bold">Mi Portal Académico</h1>
          <p className="text-xs text-muted-foreground">
            Cursos técnicos · {estudiante.nombre}
          </p>
        </div>
      </header>

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Card>
              <CardContent className="p-5 text-center">
                <p className={`text-3xl font-bold ${s.tono}`}>{s.valor}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      {enPrueba && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <h2 className="text-sm font-semibold text-amber-900">Prueba académica</h2>
            <p className="mt-1 text-sm text-amber-700">
              Tu GPA está por debajo de 2.0. Acércate a coordinación académica para
              revisar tu plan del próximo período.
            </p>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Star aria-hidden className="h-4 w-4" />
          Calificaciones por período
        </h2>

        {cuatrimestres.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EstadoVacio mensaje="Todavía no hay calificaciones registradas." />
            </CardContent>
          </Card>
        ) : (
          cuatrimestres.map((c) => (
            <Card key={c.cuatrimestre} className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-5 py-3">
                <h3 className="text-sm font-semibold">{c.cuatrimestre}</h3>
                <div className="flex items-center gap-2">
                  {c.promedio !== null && (
                    <Badge
                      className={
                        c.promedio >= 70
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-red-100 text-red-700 hover:bg-red-100"
                      }
                    >
                      {c.promedio}%
                    </Badge>
                  )}
                  {c.gpa !== null && (
                    <Badge
                      className={
                        c.gpa >= 2.0
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                          : "bg-orange-100 text-orange-700 hover:bg-orange-100"
                      }
                    >
                      GPA {c.gpa.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>

              <ul className="divide-y">
                {c.notas.map((n) => (
                  <li key={n.id} className="flex items-center gap-4 px-5 py-3">
                    <span
                      aria-hidden
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${
                        COLOR_LETRA[n.nota_letra] ?? "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {n.nota_letra}
                    </span>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">{n.materia}</p>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold">{n.nota_numerica}</p>
                      <p className="text-[10px] text-muted-foreground">
                        GPA {n.gpa.toFixed(1)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <BookOpen aria-hidden className="h-4 w-4" />
          Mis materias
        </h2>

        {materias.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EstadoVacio mensaje="No tienes materias inscritas en este período." />
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {materias.map((m) => (
              <li key={m.inscripcion_id}>
                <Card className="h-full transition-shadow hover:shadow-sm">
                  <CardContent className="flex items-start gap-3 p-5">
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                    >
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.nombre}</p>
                      {m.profesor_nombre && (
                        <p className="truncate text-xs text-muted-foreground">
                          {m.profesor_nombre}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {m.creditos} cr
                    </Badge>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
