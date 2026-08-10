/**
 * Tira de acceso a los portales — va pegada bajo el hero.
 *
 * Ocupa el sitio donde antes estaban las cifras institucionales. El cambio es
 * de propósito: una landing cuya primera fila son estadísticas se lee como un
 * folleto; una cuya primera fila son las puertas de entrada se lee como la
 * portada de un sistema, que es lo que esto es.
 *
 * Son los seis portales del catálogo (03-modulos-funcionales.md § Portales por
 * rol), cada uno con el color que se encontrará en el banner al entrar, para
 * que el icono de aquí y la cabecera de allá sean reconociblemente lo mismo.
 *
 * **Un solo color, un solo tono de fondo.** Los seis azulejos comparten el
 * mismo neutro y los seis glifos el turquesa institucional. Seis colores
 * distintos, uno al lado del otro, se pelean entre sí y ninguno gana: la fila
 * deja de leerse como un grupo y pasa a leerse como seis cosas sueltas. Lo que
 * distingue a cada portal aquí es el icono y el nombre, no el color; el color
 * de rol aparece dentro, en el banner de cada portal, donde ya no compite con
 * nada.
 *
 * El azulejo es lo interactivo: al enfocarlo o pasar el cursor se eleva, se
 * tiñe de turquesa y el glifo crece. Todo en 200ms y con `ease-out`, y todo
 * anulado por `prefers-reduced-motion` desde `globals.css`.
 *
 * Las clases van literales y completas: Tailwind no genera las que se
 * construyen por concatenación.
 */
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PORTALES } from "@/lib/portales";
import { MODO_DISENO } from "@/lib/modo-diseno";
import { cambiarRolDiseno } from "@/server/auth/actions";


export function Portales() {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <section
      id="portales"
      aria-labelledby="portales-titulo"
      className="border-b border-slate-200 bg-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        {/* El titular existe para los lectores de pantalla y para dar contexto
            sin robarle protagonismo a la fila de iconos. */}
        <h2
          id="portales-titulo"
          className="text-center text-xs uppercase tracking-widest text-[#2096BA]"
        >
          {t("accessEyebrow")}
        </h2>

        <ul className="mt-7 grid grid-cols-3 gap-x-3 gap-y-7 sm:gap-x-6 md:grid-cols-6">
          {PORTALES.map((p) => {
            const Icono = p.icono;

            const Contenido = (
              <>
                <span
                  aria-hidden
                  className="
                    flex h-16 w-16 items-center justify-center rounded-2xl
                    border border-slate-200 bg-slate-100 text-[#2096BA]
                    transition-all duration-200 ease-out
                    group-hover:-translate-y-1.5 group-hover:border-[#2096BA]/40
                    group-hover:bg-[#2096BA]/10 group-hover:shadow-lg
                    group-hover:shadow-[#2096BA]/20
                    group-focus-visible:-translate-y-1.5
                    group-focus-visible:border-[#2096BA]/40
                    group-focus-visible:bg-[#2096BA]/10
                  "
                >
                  <Icono className="h-7 w-7 transition-transform duration-200 ease-out group-hover:scale-110 group-focus-visible:scale-110" />
                </span>
                <span className="mt-3 flex min-h-[2.25rem] items-start justify-center text-xs font-semibold leading-tight text-slate-700 transition-colors duration-200 group-hover:text-[#2096BA] sm:text-sm">
                  {t(p.nombreKey as "portal_estudiante")}
                </span>
              </>
            );

            const className = "group flex h-full w-full flex-col items-center rounded-xl p-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2096BA] focus-visible:ring-offset-2";

            return (
              <li key={p.clave}>
                {MODO_DISENO ? (
                  <form action={cambiarRolDiseno.bind(null, p.clave, locale)} className="h-full">
                    <button type="submit" className={className}>
                      {Contenido}
                    </button>
                  </form>
                ) : (
                  <Link href={`/login/${p.clave}`} className={className}>
                    {Contenido}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-8 text-center text-xs text-slate-500">{t("portalsRoleNote")}</p>
      </div>
    </section>
  );
}
