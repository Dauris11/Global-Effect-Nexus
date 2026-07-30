/**
 * Detalle del expediente — ClickUp S5 · #208 (vista con GPA y gráficos).
 *
 * La pantalla se lee como un documento, no como un panel: el GPA arriba con su
 * banda de color, la evolución al lado y debajo las secciones de la ficha en el
 * mismo orden que el formulario de alta, para que quien la llenó reconozca
 * dónde está cada cosa.
 *
 * Una sección que nadie ha llenado dice que está sin llenar, en vez de mostrar
 * una lista de guiones. Es información distinta: "no tiene alergias" y "nadie
 * preguntó por sus alergias" no son lo mismo, y en una ficha social esa
 * diferencia importa.
 *
 * Psicología NO aparece aquí, ni siquiera como resumen: sus notas son
 * confidenciales y viven detrás de su propio permiso (`psicologia.leer`).
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  Home,
  Lock,
  Stethoscope,
  Users,
} from "lucide-react";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { obtenerExpedienteCompleto } from "@/server/estudiantes/queries";
import { bandaDeGpa, paletaDe } from "@/lib/estados";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { AccionesExpediente } from "./acciones-expediente";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChipEstado } from "@/components/ui/chip-estado";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GraficoGpa } from "./grafico-gpa";
import { PanelDocumentos } from "./panel-documentos";

/** Un dato de la ficha: etiqueta arriba, valor abajo. Oculta lo que no hay. */
function Dato({
  etiqueta,
  valor,
  mono,
  ancho,
}: {
  etiqueta: string;
  valor: string | null | undefined;
  /** Cifras y fechas, para que se comparen en columna. */
  mono?: boolean;
  /** Ocupa toda la fila (textos largos). */
  ancho?: boolean;
}) {
  if (!valor) return null;
  return (
    <div className={cn(ancho && "sm:col-span-2")}>
      <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        {etiqueta}
      </dt>
      <dd
        className={cn(
          "mt-1 whitespace-pre-line text-[15px]",
          mono && "font-mono tabular-nums",
        )}
      >
        {valor}
      </dd>
    </div>
  );
}

/** Sección de la ficha. Si no tiene datos, lo dice. */
function Seccion({
  titulo,
  icono: Icono,
  vacia,
  textoVacio,
  children,
}: {
  titulo: string;
  icono: typeof Users;
  vacia: boolean;
  textoVacio: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        <Icono className="size-3.5" aria-hidden />
        {titulo}
      </h2>
      {vacia ? (
        <Card className="p-5">
          <p className="text-[13px] text-muted-foreground">{textoVacio}</p>
        </Card>
      ) : (
        children
      )}
    </section>
  );
}

/** Estado del pipeline → color (mismo criterio que el listado). */
function bandaDeEstadoEstudiante(estado: string) {
  switch (estado) {
    case "activo":
      return "tarea-progreso" as const;
    case "graduado":
      return "tarea-completada" as const;
    case "suspendido":
      return "prioridad-urgente" as const;
    case "inactivo":
      return "tarea-cancelada" as const;
    default:
      return "tarea-pendiente" as const;
  }
}

/** Edad en años a partir de la fecha de nacimiento (`YYYY-MM-DD`). */
function edadDe(nacimiento: string | null): number | null {
  if (!nacimiento) return null;
  const [a, m, d] = nacimiento.split("-").map(Number);
  if (!a || !m || !d) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - a;
  // Resta un año si todavía no ha llegado el cumpleaños de este año.
  if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) edad--;
  return edad >= 0 && edad < 130 ? edad : null;
}

export default async function ExpedientePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const [puedeLeer, puedeEscribir, puedeEliminar, t] = await Promise.all([
    can(user.rol, "expedientes.leer"),
    can(user.rol, "expedientes.escribir"),
    can(user.rol, "expedientes.eliminar"),
    getTranslations("records"),
  ]);

  if (!puedeLeer) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow={t("eyebrow")} title={t("title")} />
        <EmptyState
          icon={Lock}
          title={t("forbidden")}
          description={t("forbiddenHint")}
          action={
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard`}>
                <ArrowLeft aria-hidden />
                {t("backToDashboard")}
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const expediente = await obtenerExpedienteCompleto(id).catch(() => null);
  if (!expediente) notFound();

  const { estudiante: e, familiares, vivienda: v, salud: s, socioeconomico: so } =
    expediente;

  const bandaGpa = bandaDeGpa(expediente.gpa);
  const paletaGpa = paletaDe(bandaGpa);
  const numero = new Intl.NumberFormat(locale, { minimumFractionDigits: 2 });
  const fecha = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  /** Formatea una fecha `YYYY-MM-DD` sin pasar por la zona horaria del servidor. */
  const formatear = (f: string | null) => {
    if (!f) return null;
    const [a, m, d] = f.split("-").map(Number);
    return fecha.format(new Date(a, m - 1, d));
  };

  const edad = edadDe(e.fecha_nacimiento);

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={t("eyebrow")}
          title={e.nombre}
          description={e.programa ?? undefined}
          actions={
            <>
              <Button variant="ghost" asChild>
                <Link href={`/${locale}/expedientes`}>
                  <ArrowLeft aria-hidden />
                  {t("backToList")}
                </Link>
              </Button>
              <AccionesExpediente
                id={id}
                nombre={e.nombre}
                rutaListado={`/${locale}/expedientes`}
                puedeEditar={puedeEscribir}
                puedeEliminar={puedeEliminar}
                textos={{
                  menu: t("rowActions.menu"),
                  editar: t("rowActions.edit"),
                  eliminar: t("rowActions.delete"),
                  confirmarTitulo: t("rowActions.confirmTitle"),
                  confirmarTexto: t("rowActions.deleteHint"),
                  enUsoTitulo: t("rowActions.inUseTitle"),
                  enUsoTexto: t("rowActions.inUseHint"),
                  dependencias: t.raw("rowActions.deps"),
                  eliminando: t("rowActions.deleting"),
                  entendido: t("rowActions.understood"),
                  cancelar: t("form.cancel"),
                  cerrar: t("close"),
                  errorGeneral: t("rowActions.error"),
                }}
              />
            </>
          }
        />
      </div>

      {/* Chips de situación: van juntos y arriba porque son lo que se consulta
          de pasada ("¿este joven sigue activo? ¿es becado?"). */}
      <div className="flex flex-wrap items-center gap-2">
        <ChipEstado estado={bandaDeEstadoEstudiante(e.estado)} punto>
          {t(`status.${e.estado}` as never)}
        </ChipEstado>
        <ChipEstado estado={e.tipo === "becado" ? "confid-bajo" : "neutral"}>
          {t(`type.${e.tipo}` as never)}
        </ChipEstado>
        {e.patrocinador_nombre && (
          <ChipEstado estado="flujo-ingreso">
            {t("detail.sponsor")}: {e.patrocinador_nombre}
          </ChipEstado>
        )}
      </div>

      {/* GPA y evolución */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_1fr]">
        <Card
          className={cn("animate-fade-up border-l-[3px] p-5", paletaGpa.riel)}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("detail.gpa")}
          </p>
          {expediente.gpa != null ? (
            <>
              <p
                className={cn(
                  "mt-2 font-mono text-4xl font-semibold tabular-nums",
                  paletaGpa.texto,
                )}
              >
                {numero.format(expediente.gpa)}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {t("detail.gpaScale")}
              </p>
            </>
          ) : (
            <p className="mt-3 text-[13px] text-muted-foreground">{t("detail.noGpa")}</p>
          )}

          <dl className="mt-5 space-y-3 border-t border-border pt-4">
            <Dato
              etiqueta={t("detail.since")}
              valor={formatear(e.fecha_ingreso)}
              mono
            />
            <Dato
              etiqueta={t("detail.createdAt")}
              valor={fecha.format(new Date(e.created_at))}
              mono
            />
          </dl>
        </Card>

        <Card className="animate-fade-up p-5" style={{ animationDelay: "60ms" }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {t("detail.evolution")}
          </p>
          {expediente.evolucion.length > 0 ? (
            <div className="mt-4">
              <GraficoGpa
                datos={expediente.evolucion}
                textos={{
                  gpa: t("detail.gpa"),
                  subjects: t("detail.subjects"),
                  threshold: t("detail.threshold"),
                }}
              />
            </div>
          ) : (
            <p className="mt-3 text-[13px] text-muted-foreground">
              {t("detail.evolutionEmpty")}
            </p>
          )}
        </Card>
      </div>

      {/* 1 · Identidad */}
      <Seccion
        titulo={t("detail.identity")}
        icono={CalendarDays}
        vacia={false}
        textoVacio={t("detail.noSection")}
      >
        <Card className="p-5">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Dato etiqueta={t("field.idCard")} valor={e.cedula} mono />
            <Dato etiqueta={t("field.phone")} valor={e.telefono} mono />
            <Dato etiqueta={t("field.email")} valor={e.email} />
            <Dato
              etiqueta={t("field.birthDate")}
              valor={
                formatear(e.fecha_nacimiento) &&
                `${formatear(e.fecha_nacimiento)}${
                  edad != null ? ` · ${t("detail.age", { count: edad })}` : ""
                }`
              }
              mono
            />
            <Dato etiqueta={t("field.birthPlace")} valor={e.lugar_nacimiento} />
            <Dato etiqueta={t("field.nationality")} valor={e.nacionalidad} />
            <Dato
              etiqueta={t("field.gender")}
              valor={e.genero ? t(`gender.${e.genero}` as never) : null}
            />
            <Dato etiqueta={t("field.religion")} valor={e.religion} />
          </dl>
        </Card>
      </Seccion>

      {/* 2 · Situación académica */}
      <Seccion
        titulo={t("detail.academic")}
        icono={GraduationCap}
        vacia={false}
        textoVacio={t("detail.noSection")}
      >
        <Card className="p-5">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Dato etiqueta={t("field.program")} valor={e.programa} />
            <Dato etiqueta={t("field.whereStudies")} valor={e.donde_estudia} />
            <Dato etiqueta={t("field.university")} valor={e.universidad} />
            <Dato etiqueta={t("field.school")} valor={e.centro_educativo} />
            <Dato etiqueta={t("field.facilitator")} valor={e.facilitador_habitudes} />
            <Dato
              etiqueta={t("detail.sponsor")}
              valor={e.patrocinador_nombre ?? t("detail.noSponsor")}
            />
            <Dato
              etiqueta={t("field.habitudesStory")}
              valor={e.breve_historia_habitudes}
              ancho
            />
          </dl>
        </Card>
      </Seccion>

      {/* 3 · Familia */}
      <Seccion
        titulo={t("detail.family")}
        icono={Users}
        vacia={familiares.length === 0}
        textoVacio={t("detail.noSection")}
      >
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">{t("family.relation")}</TableHead>
                  <TableHead scope="col">{t("family.name")}</TableHead>
                  <TableHead scope="col" className="text-right">
                    {t("family.age")}
                  </TableHead>
                  <TableHead scope="col">{t("family.phone")}</TableHead>
                  <TableHead scope="col">{t("family.occupation")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {familiares.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="text-[13px]">
                      {t(`relation.${f.parentesco}` as never)}
                    </TableCell>
                    <TableCell className="font-medium">{f.nombre}</TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {f.edad ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-[13px] tabular-nums">
                      {f.telefono ?? "—"}
                    </TableCell>
                    <TableCell className="text-[13px]">{f.profesion ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </Seccion>

      {/* 4 · Vivienda */}
      <Seccion
        titulo={t("detail.housing")}
        icono={Home}
        vacia={!v}
        textoVacio={t("detail.noSection")}
      >
        <Card className="p-5">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Dato etiqueta={t("field.livesWith")} valor={v?.con_quien_vive} />
            <Dato
              etiqueta={t("field.whyLivesWith")}
              valor={v?.por_que_vive_con_esa_persona}
            />
            <Dato
              etiqueta={t("field.siblings")}
              valor={v?.hermanos_cantidad?.toString()}
              mono
            />
            <Dato etiqueta={t("field.ownHouse")} valor={v?.casa_propia} />
            <Dato etiqueta={t("field.houseType")} valor={v?.tipo_casa} />
            <Dato etiqueta={t("field.bathroom")} valor={v?.bano_dentro} />
            <Dato
              etiqueta={t("field.rooms")}
              valor={v?.habitaciones?.toString()}
              mono
            />
            <Dato etiqueta={t("field.beds")} valor={v?.camas?.toString()} mono />
            <Dato etiqueta={t("field.whoSleeps")} valor={v?.quienes_duermen_cama} ancho />
            <Dato etiqueta={t("field.address")} valor={v?.direccion} ancho />
            <Dato etiqueta={t("field.community")} valor={v?.comunidad} />
            <Dato etiqueta={t("field.city")} valor={v?.ciudad_residencia} />
          </dl>
        </Card>
      </Seccion>

      {/* 5 · Salud */}
      <Seccion
        titulo={t("detail.health")}
        icono={Stethoscope}
        vacia={!s}
        textoVacio={t("detail.noSection")}
      >
        <Card className="p-5">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Dato etiqueta={t("field.illnesses")} valor={s?.enfermedades} ancho />
            <Dato etiqueta={t("field.allergies")} valor={s?.alergias} ancho />
            <Dato
              etiqueta={t("field.emergencyName")}
              valor={s?.contacto_emergencia_nombre}
            />
            <Dato
              etiqueta={t("field.emergencyPhone")}
              valor={s?.contacto_emergencia_telefono}
              mono
            />
          </dl>
        </Card>
      </Seccion>

      {/* 6 · Situación y proyecto de vida */}
      <Seccion
        titulo={t("detail.social")}
        icono={HeartHandshake}
        vacia={!so && !e.notas_adicionales}
        textoVacio={t("detail.noSection")}
      >
        <Card className="p-5">
          <dl className="grid gap-5">
            <Dato etiqueta={t("field.lifeStory")} valor={so?.historia_de_vida} />
            <Dato
              etiqueta={t("field.familySituation")}
              valor={so?.situacion_familiar}
            />
            <Dato
              etiqueta={t("field.economicSituation")}
              valor={so?.situacion_economica}
            />
            <Dato etiqueta={t("field.scholarshipReason")} valor={so?.motivo_beca} />
            <Dato etiqueta={t("field.academicGoals")} valor={so?.metas_academicas} />
            <Dato etiqueta={t("field.notes")} valor={e.notas_adicionales} />
          </dl>
        </Card>
      </Seccion>

      {/* 7 · Documentos y OCR */}
      <PanelDocumentos
        estudianteId={e.id}
        documentos={expediente.documentos}
        puedeEscribir={puedeEscribir}
        locale={locale}
        textos={t.raw("ocr")}
      />
    </div>
  );
}
