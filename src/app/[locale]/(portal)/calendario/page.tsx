/**
 * Calendario institucional — ClickUp S9 · #452–455.
 *
 * Dos vistas de los mismos datos, una al lado de la otra: la rejilla del mes
 * (#453–454) responde "cómo viene el mes" y la agenda de 30 días (#455)
 * responde "qué me viene encima". Ninguna sustituye a la otra, así que no se
 * esconde una detrás de una pestaña.
 *
 * La navegación entre meses son enlaces con `?mes=YYYY-MM`, no estado de
 * cliente: así el mes es compartible por URL y la vista funciona sin JavaScript.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { calendarioDelMes, agenda30Dias } from "@/server/operaciones/queries";
import type { EntradaAgenda } from "@/server/operaciones/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { RejillaMes } from "./rejilla-mes";
import { Agenda } from "./agenda";
import { BotonNuevoEvento } from "./dialogo-nuevo-evento";
import {
  desplazarMes,
  esMesValido,
  mesActual,
  nombresDeDias,
  aFecha,
} from "./fechas";

/** Carga tolerante: sin base de datos el calendario se ve vacío, no roto. */
async function cargar(mes: string, usuarioId: string, puedeLeer: boolean) {
  try {
    const [delMes, agenda] = await Promise.all([
      calendarioDelMes(mes, usuarioId, puedeLeer),
      agenda30Dias(usuarioId, puedeLeer),
    ]);
    return { delMes, agenda };
  } catch {
    return { delMes: [] as EntradaAgenda[], agenda: [] as EntradaAgenda[] };
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

  // Un `?mes=` inválido cae al mes actual en vez de romper la página.
  const mes = esMesValido(mesPedido) ? mesPedido : mesActual();
  const { delMes, agenda } = await cargar(mes, user.id, puedeLeer);

  const anterior = desplazarMes(mes, -1);
  const siguiente = desplazarMes(mes, 1);
  const nombreDelMes = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(aFecha(`${mes}-01`));

  // Textos compartidos por la rejilla, el panel del día y la agenda.
  const textosEntrada = {
    todoElDia: t("allDay"),
    origenEvento: t("origin.event"),
    origenTarea: t("origin.task"),
    vencida: t("overdue"),
    prioridad: {
      baja: t("priority.baja"),
      media: t("priority.media"),
      alta: t("priority.alta"),
      urgente: t("priority.urgente"),
    },
    tipoEvento: {
      academico: t("eventType.academico"),
      administrativo: t("eventType.administrativo"),
      social: t("eventType.social"),
      reunion: t("eventType.reunion"),
      otro: t("eventType.otro"),
    },
  };

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          actions={
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
                  tipo: textosEntrada.tipoEvento,
                }}
              />
            )
          }
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Mes — #453 */}
        <section className="animate-fade-up space-y-3" style={{ animationDelay: "60ms" }}>
          <header className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold capitalize">
              {nombreDelMes}
            </h2>

            <nav className="flex items-center gap-1" aria-label={t("monthNav")}>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href={`/${locale}/calendario?mes=${anterior}`}
                  aria-label={t("previousMonth")}
                >
                  <ChevronLeft aria-hidden />
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${locale}/calendario`}>{t("today")}</Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href={`/${locale}/calendario?mes=${siguiente}`}
                  aria-label={t("nextMonth")}
                >
                  <ChevronRight aria-hidden />
                </Link>
              </Button>
            </nav>
          </header>

          <RejillaMes
            mes={mes}
            entradas={delMes}
            locale={locale}
            textos={{
              ...textosEntrada,
              dias: nombresDeDias(locale),
              hoy: t("today"),
              // `t.raw` y no `t`: estas dos llevan los marcadores `{fecha}` y
              // `{n}`, que se rellenan en el cliente con el día de cada celda.
              // `t()` intentaría formatearlos aquí y fallaría sin valores.
              etiquetaDia: t.raw("dayLabel") as string,
              resumenDia: t.raw("daySummary") as string,
              diaVacio: t("dayEmpty"),
              cerrar: t("close"),
            }}
          />

          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            {t("gridHint")}
          </p>
        </section>

        {/* Agenda de 30 días — #455 */}
        <section className="animate-fade-up space-y-3" style={{ animationDelay: "120ms" }}>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("agenda")}
          </h2>
          <Agenda
            entradas={agenda}
            locale={locale}
            textos={{
              ...textosEntrada,
              hoy: t("today"),
              manana: t("tomorrow"),
              vacio: t("agendaEmpty"),
              vacioAyuda: t("agendaEmptyHint"),
            }}
          />
        </section>
      </div>
    </div>
  );
}
