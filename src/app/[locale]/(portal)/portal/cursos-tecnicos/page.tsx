/**
 * Selector de Cursos Técnicos — bifurcación entre el portal del estudiante y
 * el del profesor del programa técnico.
 *
 * Es la única pantalla del portal sin banner de rol ni accesos rápidos: hasta
 * que la persona elija, no sabemos en qué rol está, así que no hay nada que
 * personalizar. Por eso va centrada y sin sidebar visual propio.
 */
import { ArrowRight, BookMarked, GraduationCap, Wrench } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface SubPortal {
  href: string;
  icono: typeof GraduationCap;
  titulo: string;
  descripcion: string;
  /** Literales: Tailwind no compila clases concatenadas. */
  barra: string;
  azulejo: string;
  acento: string;
  punto: string;
  features: string[];
}

const SUBPORTALES: SubPortal[] = [
  {
    href: "/portal/estudiante-ct",
    icono: GraduationCap,
    titulo: "Soy Estudiante",
    descripcion: "Consulta tus materias, calificaciones y GPA del programa técnico.",
    barra: "bg-gradient-to-r from-[#2096BA] to-[#187a99]",
    azulejo: "bg-gradient-to-br from-[#2096BA] to-[#187a99]",
    acento: "text-[#2096BA]",
    punto: "bg-[#2096BA]",
    features: ["Mis calificaciones por período", "Promedio y GPA", "Materias inscritas"],
  },
  {
    href: "/portal/profesor",
    icono: Wrench,
    titulo: "Soy Profesor",
    descripcion: "Gestiona tus cursos y registra las calificaciones de tus estudiantes.",
    barra: "bg-gradient-to-r from-[#d97706] to-[#b45309]",
    azulejo: "bg-gradient-to-br from-[#d97706] to-[#b45309]",
    acento: "text-[#d97706]",
    punto: "bg-[#d97706]",
    features: ["Mis cursos activos", "Registro de notas", "Estudiantes inscritos"],
  },
];

export default function SelectorCursosTecnicos() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col items-center text-center">
          <span
            aria-hidden
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <BookMarked className="h-8 w-8" />
          </span>
          <h1 className="font-heading mt-5 text-3xl font-bold text-slate-900">
            Cursos Técnicos
          </h1>
          <p className="mt-2 max-w-md text-slate-500">
            Elige cómo entras al programa técnico para ver la información que te
            corresponde.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {SUBPORTALES.map((p) => {
            const Icono = p.icono;
            return (
              <Link
                key={p.href}
                href={p.href}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <span aria-hidden className={`h-1.5 w-full ${p.barra}`} />

                <div className="flex flex-1 flex-col p-6">
                  <span
                    aria-hidden
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-110 ${p.azulejo}`}
                  >
                    <Icono className="h-6 w-6" />
                  </span>

                  <h2 className="font-heading mt-5 text-lg font-bold text-slate-900">
                    {p.titulo}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">{p.descripcion}</p>

                  <ul className="mt-4 flex flex-1 flex-col gap-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                        <span
                          aria-hidden
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${p.punto}`}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <span
                    className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold ${p.acento}`}
                  >
                    Acceder
                    <ArrowRight
                      aria-hidden
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mt-8 text-center">
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-600">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  );
}
