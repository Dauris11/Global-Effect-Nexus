/**
 * Blog de la landing — lo que ya pasó.
 *
 * Va debajo de los eventos futuros y cierra la línea temporal de la página:
 * arriba lo que la Fundación anuncia (hero, configurado por administración),
 * en medio lo que viene (eventos), y aquí lo que ocurrió.
 *
 * Mezcla dos orígenes en una sola rejilla —noticias redactadas y eventos ya
 * celebrados— porque el visitante no distingue entre "una fila de `noticia`" y
 * "una fila de `evento` con fecha pasada": lee una lista de cosas que la
 * Fundación hizo. La etiqueta de cada tarjeta mantiene la diferencia visible
 * sin partir la sección en dos.
 *
 * **Ninguna tarjeta se queda sin imagen.** Los eventos no tienen foto y muchas
 * noticias tampoco la tendrán, y una rejilla donde unas piezas llevan imagen y
 * otras son un rectángulo de texto se ve rota. Cuando no hay `imagen_url` se
 * pinta un degradado de marca con el icono del tipo como marca de agua: es una
 * superficie deliberada, no un hueco.
 *
 * **El texto va sobre la imagen, no debajo.** Con un degradado oscuro de abajo
 * arriba que garantiza el contraste del blanco pase lo que pase en la foto
 * —una imagen clara subida por administración no puede romper la legibilidad—.
 *
 * La primera entrada ocupa el doble de ancho y de alto. Una rejilla de seis
 * piezas idénticas no tiene entrada de lectura, y lo más reciente merece ese
 * sitio.
 */
import Image from "next/image";
import { ArrowUpRight, CalendarCheck, Newspaper } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { EntradaBlog } from "@/server/landing/types";

/**
 * Degradados de respaldo para las entradas sin imagen.
 *
 * Solo turquesa institucional y slate: el estándar de color (docs/09 §2.5)
 * reserva esmeralda, ámbar, rosa y violeta para identificar portales, y usarlos
 * aquí haría que una noticia pareciese de un rol concreto. Cuatro
 * profundidades del mismo par bastan para que dos tarjetas contiguas se
 * distingan sin salirse de la marca.
 *
 * Se elige por posición y no al azar: así el resultado es estable entre
 * recargas y servidor y cliente pintan lo mismo.
 */
const FONDOS = [
  "bg-gradient-to-br from-[#2096BA] via-[#17789a] to-[#0a6a8a]",
  "bg-gradient-to-br from-slate-700 via-slate-800 to-[#0a6a8a]",
  "bg-gradient-to-br from-[#0a6a8a] via-[#124f66] to-slate-900",
  "bg-gradient-to-br from-slate-600 via-slate-800 to-slate-900",
] as const;

export async function Blog({ entradas }: { entradas: EntradaBlog[] }) {
  // Sin nada que contar, la sección no se pinta: una rejilla vacía en una
  // página pública se lee como abandono.
  if (entradas.length === 0) return null;

  const t = await getTranslations("landing");
  const locale = await getLocale();
  const fechaLocale = locale === "en" ? enUS : es;

  return (
    <section id="blog" className="bg-slate-50 py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="text-xs uppercase tracking-widest text-[#2096BA]">{t("blogEyebrow")}</p>
        <h2 className="font-heading mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
          {t("blogTitle")}
        </h2>
        <p className="mt-3 max-w-2xl text-slate-600">{t("blogIntro")}</p>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {entradas.map((e, i) => {
            const esNoticia = e.origen === "noticia";
            const Icono = esNoticia ? Newspaper : CalendarCheck;
            const destacada = i === 0;
            const fondo = FONDOS[i % FONDOS.length];

            return (
              <li
                key={`${e.origen}-${e.id}`}
                className={cn(destacada && "sm:col-span-2 lg:row-span-2")}
              >
                <article
                  className={cn(
                    "group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-2xl",
                    "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl",
                    destacada ? "min-h-[22rem] lg:min-h-[30rem]" : "min-h-[15rem]",
                  )}
                >
                  {/* Capa 1 · imagen o degradado de marca.
                      La foto va por `next/image` y no como `background-image`:
                      así se sirve en AVIF/WebP y redimensionada (docs/09 §7.2).
                      `sizes` distingue la destacada, que ocupa dos columnas. */}
                  {e.imagen_url ? (
                    <Image
                      src={e.imagen_url}
                      alt=""
                      aria-hidden
                      fill
                      sizes={destacada ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 100vw, 33vw"}
                      className="absolute inset-0 -z-20 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className={cn(
                        "absolute inset-0 -z-20 transition-transform duration-500 ease-out group-hover:scale-105",
                        fondo,
                      )}
                    >
                      {/* Marca de agua: da textura al degradado y refuerza de
                          qué tipo de entrada se trata. */}
                      <Icono
                        className={cn(
                          "absolute -bottom-6 -right-6 text-white/10",
                          destacada ? "h-56 w-56" : "h-36 w-36",
                        )}
                      />
                    </div>
                  )}

                  {/* Capa 2 · velo. Sube de opacidad hacia abajo, que es donde
                      vive el texto, y se intensifica al pasar el cursor. */}
                  <div
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/5 transition-opacity duration-300 group-hover:from-slate-950"
                  />

                  {/* Capa 3 · contenido. */}
                  <div className={cn("relative p-6", destacada && "lg:p-8")}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm",
                          esNoticia
                            ? "bg-[#2096BA]/90 text-white"
                            : "bg-white/20 text-white ring-1 ring-inset ring-white/30",
                        )}
                      >
                        <Icono aria-hidden className="h-3 w-3" />
                        {esNoticia ? t("blogTagNews") : t("blogTagEvent")}
                      </span>

                      <time dateTime={e.fecha} className="text-xs font-medium text-white/75">
                        {format(new Date(`${e.fecha}T00:00:00`), "d 'de' MMMM, yyyy", {
                          locale: fechaLocale,
                        })}
                      </time>
                    </div>

                    <h3
                      className={cn(
                        "font-heading mt-3 font-bold leading-tight text-white",
                        destacada ? "text-2xl lg:text-3xl" : "text-lg",
                      )}
                    >
                      {e.titulo}
                    </h3>

                    {e.resumen && (
                      <p
                        className={cn(
                          "mt-2 text-sm leading-relaxed text-white/80",
                          destacada ? "line-clamp-3 lg:max-w-xl" : "line-clamp-2",
                        )}
                      >
                        {e.resumen}
                      </p>
                    )}

                    {e.etiqueta && (
                      <p className="mt-4 flex items-center gap-1.5 text-xs capitalize text-white/60">
                        {e.etiqueta}
                        <ArrowUpRight
                          aria-hidden
                          className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </p>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
