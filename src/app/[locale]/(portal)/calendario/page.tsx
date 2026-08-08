/**
 * Calendario institucional — ClickUp S9 · #452–455.
 *
 * Una sola pieza (`GestorEventos`) con cuatro vistas —mes, semana, día y
 * lista— sobre los mismos datos: eventos de la Fundación y tareas con fecha
 * límite, mezclados. Sustituye a la rejilla y la agenda separadas: eran dos
 * componentes con dos formas de pintar lo mismo, y la vista de lista ya cubre
 * lo que hacía la agenda de 30 días (#455) sin duplicar código.
 *
 * El mes visible vive en la URL (`?mes=YYYY-MM`), así que la vista es
 * compartible y la primera carga funciona sin JavaScript. A partir de ahí, la
 * navegación es de cliente para que cambiar de semana no recargue la página.
 *
 * Este componente es el calendario de **todo el sistema**: recibe
 * `EntradaAgenda[]`, que es una forma normalizada, así que los módulos que
 * todavía no tienen pantalla —psicología (citas), académico (períodos)— se
 * conectan añadiendo su tabla a la unión de `entradasDeAgenda` en
 * `server/operaciones/queries.ts`, sin tocar la interfaz.
 */
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { calendarioDelMes, agenda30Dias } from "@/server/operaciones/queries";
import type { EntradaAgenda } from "@/server/operaciones/types";
import { PageHeader } from "@/components/ui/page-header";
import { GestorEventos } from "@/components/calendario/gestor-eventos";
import { BotonNuevoEvento } from "./dialogo-nuevo-evento";
import { esMesValido, mesActual, nombresDeDias, hoyISO } from "@/lib/fechas";

/** Carga tolerante: sin base de datos el calendario se ve vacío, no roto. */
async function cargar(mes: string, usuarioId: string, puedeLeer: boolean) {
  try {
    // El mes visible y los próximos 30 días: la vista de lista mira hacia
    // adelante y no se limita al mes que está en pantalla.
    const [delMes, proximos] = await Promise.all([
      calendarioDelMes(mes, usuarioId, puedeLeer),
      agenda30Dias(usuarioId, puedeLeer),
    ]);
    // Unión sin repetidos: los dos rangos se solapan en el mes en curso.
    const vistas = new Set<string>();
    return [...delMes, ...proximos].filter((e) => {
      const clave = `${e.origen}-${e.id}`;
      if (vistas.has(clave)) return false;
      vistas.add(clave);
      return true;
    });
  } catch {
    return [] as EntradaAgenda[];
  }
}

export default async function CalendarioPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mes?: string }>;
}) {
  const [{ locale }, { mes: mesPedido }] = await Promise.all([params, searchParams]);

  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const [puedeLeer, puedeEscribir, t] = await Promise.all([
    can(user.rol, "operaciones.leer"),
    can(user.rol, "operaciones.escribir"),
    getTranslations("calendar"),
  ]);

  const mes = esMesValido(mesPedido) ? mesPedido : mesActual();
  const entradas = await cargar(mes, user.id, puedeLeer);

  const tipoEvento = {
    academico: t("eventType.academico"),
    administrativo: t("eventType.administrativo"),
    social: t("eventType.social"),
    reunion: t("eventType.reunion"),
    otro: t("eventType.otro"),
  };

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />
      </div>

      <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out" style={{ animationDelay: "60ms" }}>
        <GestorEventos
          entradas={entradas}
          locale={locale}
          hoy={hoyISO()}
          puedeEscribir={puedeEscribir}
          acciones={
            puedeEscribir && (
              <BotonNuevoEvento
                etiqueta={t("newEvent.action")}
                fechaInicial={`${mes}-01`}
                textos={{
                  titulo: t("newEvent.title"),
                  subtitulo: t("newEvent.subtitle"),
                  campoTitulo: t("event.title"),
                  campoTituloPlaceholder: t("newEvent.titlePlaceholder"),
                  campoDescripcion: t("event.description"),
                  campoTipo: t("event.type"),
                  campoFecha: t("event.date"),
                  campoHoraInicio: t("event.start"),
                  campoHoraFin: t("event.end"),
                  campoUbicacion: t("event.place"),
                  campoResponsable: t("event.lead"),
                  ayudaHora: t("newEvent.timeHint"),
                  crear: t("newEvent.create"),
                  creando: t("newEvent.creating"),
                  cancelar: t("newEvent.cancel"),
                  cerrar: t("close"),
                  errorTitulo: t("newEvent.titleRequired"),
                  errorFecha: t("newEvent.dateRequired"),
                  errorGeneral: t("newEvent.error"),
                  tipo: tipoEvento,
                }}
              />
            )
          }
          textos={{
            vista: {
              mes: t("view.month"),
              semana: t("view.week"),
              dia: t("view.day"),
              lista: t("view.list"),
            },
            hoy: t("today"),
            manana: t("tomorrow"),
            anterior: t("previous"),
            siguiente: t("next"),
            buscar: t("search"),
            limpiar: t("clearFilters"),
            dias: nombresDeDias(locale),
            todoElDia: t("allDay"),
            vencida: t("overdue"),
            sinResultados: t("noResults"),
            sinResultadosAyuda: t("noResultsHint"),
            diaVacio: t("dayEmpty"),
            origen: { evento: t("origin.event"), tarea: t("origin.task") },
            filtrarOrigen: t("filterByOrigin"),
            prioridad: {
              baja: t("priority.baja"),
              media: t("priority.media"),
              alta: t("priority.alta"),
              urgente: t("priority.urgente"),
            },
            tipoEvento,
            masEntradas: t.raw("moreEntries") as string,
            errorMover: t("moveError"),
            movida: t("moved"),
          }}
        />
      </div>
    </div>
  );
}
