/**
 * Barra de cifras institucionales, justo debajo del hero.
 *
 * Las cifras salen de la base de datos, no están escritas a mano: si una
 * métrica viene en cero, la columna no se pinta en lugar de mostrar un dato
 * vacío que restaría credibilidad al resto.
 */
import { BookOpen, HeartHandshake, Users, type LucideIcon } from "lucide-react";

export interface CifraLanding {
  clave: string;
  valor: string;
  label: string;
  icono: LucideIcon;
}

const ICONOS: Record<string, LucideIcon> = {
  estudiantes: Users,
  materias: BookOpen,
  patrocinadores: HeartHandshake,
};

export function StatsBar({ cifras }: { cifras: Omit<CifraLanding, "icono">[] }) {
  const visibles = cifras.filter((c) => c.valor !== "0");
  if (visibles.length === 0) return null;

  /* Literales: Tailwind no compila clases construidas por concatenación. La
     rejilla se ajusta al número de cifras con dato para no dejar columnas
     vacías cortadas por los divisores. */
  const columnas =
    { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3" }[visibles.length] ??
    "md:grid-cols-4";

  return (
    <section className="border-b border-slate-200 bg-white">
      <div
        className={`mx-auto grid max-w-6xl grid-cols-2 divide-x divide-slate-200 px-4 md:px-6 ${columnas}`}
      >
        {visibles.map((c) => {
          const Icono = ICONOS[c.clave] ?? Users;
          return (
            <div key={c.clave} className="flex flex-col items-center gap-1 px-4 py-6">
              <Icono aria-hidden className="h-5 w-5 text-[#2096BA]" />
              <p className="text-2xl font-bold text-slate-900">{c.valor}</p>
              <p className="text-center text-xs text-slate-500">{c.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
