/**
 * "Qué hacemos" — los cuatro programas de la Fundación.
 *
 * Fichas con el **riel de 3px** que es la firma del sistema
 * — el mismo que dentro del portal marca
 * una nota o una tarea urgente. Usarlo aquí une la cara pública con el
 * producto en vez de inventar un adorno solo para la landing.
 *
 * Sin numerar. Los cuatro programas no son una secuencia —ocurren a la vez, y
 * eso es justo lo que la sección afirma—, así que en lugar del orden va una
 * etiqueta con la categoría, que sí dice algo del contenido.
 *
 * **Sin estado de selección.** Una versión anterior guardaba cuál ficha estaba
 * "activa" y le pintaba un anillo, con un `onClick` sobre el `<article>`. Eso
 * fallaba dos reglas a la vez: el manejador no era alcanzable con el teclado
 * (no es un control, no recibe foco) y el clic no cambiaba ningún contenido,
 * solo el borde. Una interacción que promete algo y no lo entrega cuesta
 * accesibilidad y no da nada a cambio. El realce quedó en CSS puro, y con eso
 * el componente vuelve a ser de servidor: cero JavaScript en el cliente.
 *
 * Ese criterio se mantiene. Lo que sí se añadió es respuesta al puntero que no
 * promete nada que no cumpla —la ficha se levanta, el riel engorda de 3px a 5px y
 * los tres hechos se separan— y la entrada en cascada de `Revelar` al aparecer en
 * pantalla. El contenido sigue renderizándose en el servidor: `Revelar` es un
 * envoltorio, no un dueño del contenido.
 */
import { getTranslations } from "next-intl/server";
import { GraduationCap, Wrench, Brain, Utensils, Check, type LucideIcon } from "lucide-react";
import { SeccionEncabezado } from "./seccion";
import { Revelar } from "./revelar";

const PROGRAMAS: { clave: string; icono: LucideIcon }[] = [
  { clave: "scholarships", icono: GraduationCap },
  { clave: "training", icono: Wrench },
  { clave: "wellbeing", icono: Brain },
  { clave: "meals", icono: Utensils },
];

/** Cada programa lleva tres hechos verificables, no adjetivos. */
const PUNTOS = ["p1", "p2", "p3"] as const;

export async function Labor() {
  const t = await getTranslations("landing");

  return (
    <section id="labor" aria-labelledby="labor-title" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Revelar>
          <SeccionEncabezado
            idTitulo="labor-title"
            eyebrow={t("workEyebrow")}
            titulo={t("workTitle")}
            intro={t("workIntro")}
          />
        </Revelar>

        <ul className="mt-14 grid gap-5 md:grid-cols-2">
          {PROGRAMAS.map(({ clave, icono: Icono }, i) => (
            <Revelar key={clave} como="li" retardo={0.06 * i}>
              <article
                className={[
                  "group flex h-full flex-col rounded-xl border border-border bg-card p-7",
                  "border-l-[3px] border-l-primary",
                  "transition-all duration-200 ease-out",
                  "hover:-translate-y-0.5 hover:border-l-[5px] hover:bg-accent/40 hover:shadow-flotante",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 ease-out group-hover:scale-105">
                    <Icono className="size-6" strokeWidth={1.7} aria-hidden />
                  </span>
                  <span className="rounded-full border border-border bg-muted px-3.5 py-1 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    {t(`work_${clave}_tag` as never)}
                  </span>
                </div>

                <h3 className="mt-6 font-display text-3xl font-semibold leading-tight text-foreground">
                  {t(`work_${clave}_title` as never)}
                </h3>

                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {t(`work_${clave}_desc` as never)}
                </p>

                <ul className="mt-6 space-y-2 border-t border-border/60 pt-5">
                  {PUNTOS.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-sm font-medium text-foreground/80"
                    >
                      <Check
                        className="mt-0.5 size-3.5 shrink-0 text-primary"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      <span>{t(`work_${clave}_${p}` as never)}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Revelar>
          ))}
        </ul>
      </div>
    </section>
  );
}
