/**
 * Buscador de estudiantes con filtrado en vivo.
 *
 * Sustituye al `<select>` de la lista completa. Con doscientos jóvenes, un
 * desplegable obliga a recorrer la lista con la vista o a acertar la primera
 * letra; aquí se escribe parte del nombre y quedan tres.
 *
 * Filtra en cliente sobre la lista ya cargada, no contra el servidor: son
 * cientos de nombres, no miles, y `estudiantesParaSelector` ya los trae para
 * pintar el desplegable. Una búsqueda remota añadiría latencia por pulsación
 * para recortar una lista que cabe en memoria. Si algún día pasan de ~500 (el
 * `LIMIT` de esa consulta), hay que mover el filtrado al servidor y apoyarse en
 * el índice trigram `idx_estudiante_nombre_trgm`, que existe para eso.
 *
 * Accesibilidad: es el patrón combobox de ARIA. El input anuncia cuántos
 * resultados quedan, las flechas recorren la lista, Enter elige y Escape
 * cierra — se puede usar entero sin ratón.
 */
"use client";

import * as React from "react";
import { Search, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EstudianteBuscable {
  id: string;
  nombre: string;
}

/**
 * Normaliza para comparar: sin tildes y en minúsculas.
 *
 * Sin esto, "Fermin" no encuentra a "Fermín" — y quien teclea rápido casi nunca
 * pone la tilde. `NFD` separa la letra de su acento y el rango Unicode borra el
 * acento suelto.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function BuscadorEstudiantes({
  estudiantes,
  onElegir,
  seleccionado,
  deshabilitado = false,
  id = "buscador-estudiantes",
  placeholder = "Escribe un nombre…",
  etiquetaLimpiar = "Limpiar selección",
  sinResultados = "Ningún estudiante coincide.",
  maximo = 8,
}: {
  estudiantes: EstudianteBuscable[];
  onElegir: (estudiante: EstudianteBuscable) => void;
  /** Elegido actual, para mostrarlo en vez del campo de búsqueda. */
  seleccionado?: EstudianteBuscable | null;
  deshabilitado?: boolean;
  id?: string;
  placeholder?: string;
  etiquetaLimpiar?: string;
  sinResultados?: string;
  /** Resultados visibles. Una lista larga vuelve a ser el problema original. */
  maximo?: number;
}) {
  const [consulta, setConsulta] = React.useState("");
  const [abierto, setAbierto] = React.useState(false);
  const [activo, setActivo] = React.useState(0);
  const contenedor = React.useRef<HTMLDivElement>(null);

  const resultados = React.useMemo(() => {
    const q = normalizar(consulta.trim());
    if (q === "") return estudiantes.slice(0, maximo);
    return estudiantes.filter((e) => normalizar(e.nombre).includes(q)).slice(0, maximo);
  }, [estudiantes, consulta, maximo]);

  // Cerrar al pulsar fuera. Sin esto la lista queda flotando sobre el resto
  // del formulario después de tocar en cualquier otro sitio.
  React.useEffect(() => {
    if (!abierto) return;
    function alPulsarFuera(ev: MouseEvent) {
      if (!contenedor.current?.contains(ev.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", alPulsarFuera);
    return () => document.removeEventListener("mousedown", alPulsarFuera);
  }, [abierto]);

  function elegir(e: EstudianteBuscable) {
    onElegir(e);
    setConsulta("");
    setAbierto(false);
  }

  function alTeclear(ev: React.KeyboardEvent<HTMLInputElement>) {
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      setAbierto(true);
      setActivo((i) => Math.min(i + 1, resultados.length - 1));
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      setActivo((i) => Math.max(i - 1, 0));
    } else if (ev.key === "Enter") {
      // `preventDefault` siempre que la lista esté abierta: dentro de un
      // formulario, Enter lo enviaría antes de registrar la elección.
      if (abierto && resultados[activo]) {
        ev.preventDefault();
        elegir(resultados[activo]);
      }
    } else if (ev.key === "Escape") {
      setAbierto(false);
    }
  }

  if (seleccionado) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2">
        <UserRound aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {seleccionado.nombre}
        </span>
        <button
          type="button"
          onClick={() => onElegir({ id: "", nombre: "" })}
          disabled={deshabilitado}
          aria-label={etiquetaLimpiar}
          className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={contenedor} className="relative">
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={abierto}
        aria-controls={`${id}-lista`}
        aria-autocomplete="list"
        aria-activedescendant={
          abierto && resultados[activo] ? `${id}-opcion-${resultados[activo].id}` : undefined
        }
        autoComplete="off"
        value={consulta}
        placeholder={placeholder}
        disabled={deshabilitado}
        onChange={(ev) => {
          setConsulta(ev.target.value);
          setAbierto(true);
          // El resaltado vuelve arriba al reescribir: dejarlo en la posición 5
          // sobre una lista que ahora tiene 2 apuntaría a otra persona. Va aquí
          // y no en un efecto sobre `consulta` — es consecuencia directa de
          // teclear, no una sincronización con estado externo.
          setActivo(0);
        }}
        onFocus={() => setAbierto(true)}
        onKeyDown={alTeclear}
        className={cn(
          "h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm",
          "transition-[border-color,box-shadow] duration-150 ease-out",
          "placeholder:text-muted-foreground",
          "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />

      {/* Anuncio para lectores de pantalla: sin esto, quien no ve la lista no
          sabe si escribir una letra más acota o deja la búsqueda en nada. */}
      <span aria-live="polite" className="sr-only">
        {abierto ? `${resultados.length} resultados` : ""}
      </span>

      {abierto && (
        <ul
          id={`${id}-lista`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-surface-raised p-1 shadow-lg"
        >
          {resultados.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">{sinResultados}</li>
          ) : (
            resultados.map((e, i) => (
              <li key={e.id} id={`${id}-opcion-${e.id}`} role="option" aria-selected={i === activo}>
                <button
                  type="button"
                  // `onMouseDown` y no `onClick`: el blur del input cerraría la
                  // lista antes de que el clic llegue a registrarse.
                  onMouseDown={(ev) => {
                    ev.preventDefault();
                    elegir(e);
                  }}
                  onMouseEnter={() => setActivo(i)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm",
                    i === activo && "bg-accent text-accent-foreground",
                  )}
                >
                  <UserRound aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{e.nombre}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
