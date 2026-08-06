/**
 * Expediente completo del estudiante — diálogo de seis pestañas.
 *
 * Se abre desde Psicología (al elegir un estudiante en el buscador o desde el
 * formulario de cita) y muestra en un solo sitio los ~70 datos que la
 * Fundación guarda de cada joven.
 *
 * **Por qué un diálogo y no una página.** Quien lo abre está en mitad de otra
 * tarea —registrando una cita, revisando la agenda— y necesita consultar sin
 * perder el sitio. La ficha en página propia ya existe en `/expedientes/[id]`
 * para cuando el expediente *es* la tarea.
 *
 * **El esquema real está normalizado.** El estudiante vive en `estudiante` y
 * el resto en `familiar`, `perfil_vivienda`, `perfil_salud` y
 * `perfil_socioeconomico`; `obtenerExpedienteCompleto` los ensambla. Este
 * componente solo pinta lo que recibe.
 *
 * **Nada vacío ocupa sitio.** `Dato` no renderiza si no hay valor y las
 * secciones condicionales desaparecen enteras. Un expediente a medio llenar
 * —lo normal cuando el joven acaba de entrar— debe leerse como una ficha
 * corta, no como un formulario lleno de guiones.
 */
"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  DollarSign,
  FileText,
  GraduationCap,
  Heart,
  Home,
  MapPin,
  Phone,
  TrendingUp,
  User,
  UserCheck,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PanelDocumentos } from "@/app/[locale]/(portal)/expedientes/[id]/panel-documentos";
import type {
  ExpedienteCompleto,
  EstadoEstudiante,
} from "@/server/estudiantes/types";
import type { CuatrimestreDelEstudiante } from "@/server/portales/types";

/* ── Escala GPA 4.0 ──────────────────────────────────────────────────────
   Una sola fuente para letra, índice y color. El resto del sistema usa la
   misma banda (`lib/estados.ts` la aplica a los chips); aquí se repite el
   umbral porque el expediente además necesita la etiqueta y el índice. */
const BANDAS = [
  { min: 90, letra: "A", gpa: 4.0, etiqueta: "Excelente", clase: "border-emerald-200 bg-emerald-50 text-emerald-600" },
  { min: 80, letra: "B", gpa: 3.0, etiqueta: "Bueno", clase: "border-blue-200 bg-blue-50 text-blue-600" },
  { min: 70, letra: "C", gpa: 2.0, etiqueta: "Promedio", clase: "border-amber-200 bg-amber-50 text-amber-600" },
  { min: 60, letra: "D", gpa: 1.0, etiqueta: "Prueba académica", clase: "border-orange-200 bg-orange-50 text-orange-600" },
  { min: 0, letra: "F", gpa: 0.0, etiqueta: "Reprobado", clase: "border-red-200 bg-red-50 text-red-500" },
] as const;

function banda(nota: number) {
  return BANDAS.find((b) => nota >= b.min) ?? BANDAS[BANDAS.length - 1];
}

const ESTADO_BADGE: Record<EstadoEstudiante, string> = {
  activo: "bg-emerald-100 text-emerald-700",
  graduado: "bg-blue-100 text-blue-700",
  suspendido: "bg-red-100 text-red-700",
  inactivo: "bg-slate-100 text-slate-600",
  reclutado: "bg-slate-100 text-slate-600",
  postulado: "bg-slate-100 text-slate-600",
  academia_liderazgo: "bg-violet-100 text-violet-700",
  standby_tecnico: "bg-amber-100 text-amber-700",
};

/* ── Piezas de presentación ─────────────────────────────────────────────── */

/** Etiqueta + valor. No se pinta si el dato está vacío. */
function Dato({ label, valor }: { label: string; valor: string | number | null | undefined }) {
  if (valor === null || valor === undefined || valor === "") return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{valor}</p>
    </div>
  );
}

function Seccion({
  titulo,
  icono: Icono,
  children,
}: {
  titulo: string;
  icono: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icono aria-hidden className="h-3.5 w-3.5" />
        {titulo}
      </h3>
      {children}
    </section>
  );
}

/** Bloque de texto largo (historia de vida, situación familiar…). */
function Narrativo({ texto }: { texto: string | null | undefined }) {
  if (!texto) {
    return <p className="text-sm italic text-muted-foreground">No registrada.</p>;
  }
  return (
    <div className="whitespace-pre-wrap rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed">
      {texto}
    </div>
  );
}

function FilaFamiliar({
  parentesco,
  nombre,
  edad,
  telefono,
  profesion,
}: {
  parentesco: string;
  nombre: string;
  edad: number | null;
  telefono: string | null;
  profesion: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border bg-muted/20 p-3">
      <span className="w-24 shrink-0 text-xs font-semibold capitalize text-muted-foreground">
        {parentesco}
      </span>
      <span className="text-sm font-medium">{nombre}</span>
      {edad !== null && <span className="text-xs text-muted-foreground">{edad} años</span>}
      {telefono && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Phone aria-hidden className="h-3 w-3" />
          {telefono}
        </span>
      )}
      {profesion && <span className="text-xs italic text-muted-foreground">{profesion}</span>}
    </div>
  );
}

/** Estado del cuatrimestre: correo al patrocinador y reunión mensual. */
function InsigniaSeguimiento({ label, valor }: { label: string; valor: string | null }) {
  const mapa: Record<string, { icono: LucideIcon; clase: string }> = {
    si: { icono: CheckCircle2, clase: "border-emerald-200 bg-emerald-50 text-emerald-600" },
    no: { icono: XCircle, clase: "border-red-200 bg-red-50 text-red-500" },
    justificado: { icono: CheckCircle2, clase: "border-blue-200 bg-blue-50 text-blue-600" },
    pendiente: { icono: Clock, clase: "border-amber-200 bg-amber-50 text-amber-600" },
  };
  const clave = (valor ?? "pendiente").toLowerCase();
  const { icono: Icono, clase } = mapa[clave] ?? mapa.pendiente;

  return (
    <div className={cn("flex flex-col items-center gap-1 rounded-xl border p-4 text-center", clase)}>
      <Icono aria-hidden className="h-6 w-6" />
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-xs capitalize">{valor ?? "pendiente"}</p>
    </div>
  );
}

/* ── Diálogo ────────────────────────────────────────────────────────────── */

export function ExpedienteDetalle({
  expediente,
  cuatrimestres = [],
  abierto,
  onCerrar,
  puedeEscribir = false,
  locale = "es",
  textosOcr,
}: {
  expediente: ExpedienteCompleto | null;
  /** Notas por cuatrimestre, para el historial con GPA. */
  cuatrimestres?: CuatrimestreDelEstudiante[];
  abierto: boolean;
  onCerrar: () => void;
  /** Habilita subir documentos. Psicología solo lee (`expedientes.leer`). */
  puedeEscribir?: boolean;
  locale?: string;
  /** Textos del panel de documentos (namespace `expedientes.ocr`). */
  textosOcr?: Record<string, string> & { status?: Record<string, string> };
}) {
  const resumen = useMemo(() => {
    const notas = cuatrimestres.flatMap((c) => c.notas);
    if (notas.length === 0) return null;
    const promedio = notas.reduce((s, n) => s + n.nota_numerica, 0) / notas.length;
    return {
      promedio: Math.round(promedio * 10) / 10,
      evaluaciones: notas.length,
      aprobadas: notas.filter((n) => n.nota_numerica >= 70).length,
    };
  }, [cuatrimestres]);

  if (!expediente) return null;
  const { estudiante: e, familiares, vivienda, salud, socioeconomico, gpa } = expediente;

  const fecha = (v: string | null) =>
    v ? format(new Date(v), "dd/MM/yyyy", { locale: es }) : null;

  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText aria-hidden className="h-5 w-5 text-primary" />
            Expediente: {e.nombre}
          </DialogTitle>
        </DialogHeader>

        {/* Cabecera visual */}
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-start gap-4">
            {/* Foto real si el expediente la tiene; si no, la inicial. El
                enlace viene firmado y caduca, por eso no pasa por next/image:
                el optimizador cachearía una URL temporal de un dato privado. */}
            {expediente.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={expediente.fotoUrl}
                alt={`Foto de ${e.nombre}`}
                className="h-16 w-16 shrink-0 rounded-full border-2 border-border object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary"
              >
                {e.nombre.charAt(0).toUpperCase()}
              </span>
            )}

            <div className="space-y-2">
              <div>
                <p className="text-base font-bold">{e.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {[e.cedula, vivienda?.comunidad].filter(Boolean).join(" · ")}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn("text-[10px] capitalize", ESTADO_BADGE[e.estado])}>
                  {e.estado.replace(/_/g, " ")}
                </Badge>
                <Badge variant="neutral" className="text-[10px]">
                  {e.tipo === "becado" ? "Becado universitario" : "Curso técnico"}
                </Badge>
                {e.patrocinador_nombre && (
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    <UserCheck aria-hidden className="h-3 w-3" />
                    {e.patrocinador_nombre}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Promedio y GPA: lo primero que se busca al abrir un expediente. */}
          {(resumen || gpa !== null) && (
            <div className="hidden text-right sm:block">
              {resumen && (
                <>
                  <p
                    className={cn(
                      "text-3xl font-bold",
                      resumen.promedio >= 70 ? "text-emerald-600" : "text-red-500",
                    )}
                  >
                    {resumen.promedio}%
                  </p>
                  <p className="text-xs text-muted-foreground">Promedio</p>
                </>
              )}
              {gpa !== null && (
                <p
                  className={cn(
                    "mt-1 text-lg font-semibold",
                    gpa >= 2 ? "text-blue-600" : "text-orange-600",
                  )}
                >
                  GPA {gpa.toFixed(2)}
                </p>
              )}
            </div>
          )}
        </div>

        <Tabs defaultValue="personal" className="mt-2">
          <TabsList className="grid w-full grid-cols-4 text-[11px] sm:grid-cols-7">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="academico">Académico</TabsTrigger>
            <TabsTrigger value="habitudes">Habitudes</TabsTrigger>
            <TabsTrigger value="familia">Familia</TabsTrigger>
            <TabsTrigger value="historia">Historia</TabsTrigger>
            <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

          {/* 1 · PERSONAL */}
          <TabsContent value="personal" className="space-y-6 pt-4">
            <Seccion titulo="Identificación" icono={User}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Dato label="Cédula" valor={e.cedula} />
                <Dato label="Fecha de nacimiento" valor={fecha(e.fecha_nacimiento)} />
                <Dato label="Lugar de nacimiento" valor={e.lugar_nacimiento} />
                <Dato label="Género" valor={e.genero} />
                <Dato label="Sexo (documento)" valor={e.sexo_documento} />
                <Dato label="Nacionalidad" valor={e.nacionalidad} />
                <Dato label="Religión" valor={e.religion} />
                <Dato label="Comunidad" valor={vivienda?.comunidad} />
              </div>
            </Seccion>

            <Seccion titulo="Contacto" icono={Phone}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Dato label="Teléfono" valor={e.telefono} />
                <Dato label="Correo" valor={e.email} />
                <Dato label="Contacto de emergencia" valor={salud?.contacto_emergencia_nombre} />
                <Dato label="Tel. emergencia" valor={salud?.contacto_emergencia_telefono} />
              </div>
            </Seccion>

            <Seccion titulo="Residencia" icono={MapPin}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Dato label="Dirección" valor={vivienda?.direccion} />
                <Dato label="Ciudad" valor={vivienda?.ciudad_residencia} />
              </div>
            </Seccion>
          </TabsContent>

          {/* 2 · ACADÉMICO */}
          <TabsContent value="academico" className="space-y-6 pt-4">
            <Seccion titulo="Información académica" icono={GraduationCap}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Dato
                  label="Tipo"
                  valor={e.tipo === "becado" ? "Becado universitario" : "Curso técnico"}
                />
                <Dato label="Estado" valor={e.estado.replace(/_/g, " ")} />
                <Dato label="Qué estudia" valor={e.programa} />
                <Dato label="Dónde estudia" valor={e.donde_estudia} />
                {e.tipo === "becado" && <Dato label="Universidad" valor={e.universidad} />}
                <Dato label="Fecha de ingreso" valor={fecha(e.fecha_ingreso)} />
              </div>

              {socioeconomico?.motivo_beca && (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Motivo de la beca</p>
                  <Narrativo texto={socioeconomico.motivo_beca} />
                </div>
              )}
              {socioeconomico?.metas_academicas && (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Metas académicas</p>
                  <Narrativo texto={socioeconomico.metas_academicas} />
                </div>
              )}
            </Seccion>

            {e.patrocinador_nombre && (
              <Seccion titulo="Patrocinador vinculado" icono={UserCheck}>
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <UserCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">
                      {e.patrocinador_nombre}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-emerald-700">
                      <DollarSign aria-hidden className="h-3 w-3" />
                      Beca activa
                    </p>
                  </div>
                </div>
              </Seccion>
            )}

            {cuatrimestres.length > 0 && (
              <Seccion titulo="Historial académico — escala 4.0" icono={Award}>
                {resumen && (
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <div className="rounded-xl border bg-card p-4 text-center">
                      <p
                        className={cn(
                          "text-2xl font-bold",
                          resumen.promedio >= 70 ? "text-emerald-600" : "text-red-500",
                        )}
                      >
                        {resumen.promedio}%
                      </p>
                      <p className="text-xs text-muted-foreground">Promedio</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                      <p
                        className={cn(
                          "text-2xl font-bold",
                          (gpa ?? 0) >= 2 ? "text-blue-600" : "text-orange-600",
                        )}
                      >
                        {gpa !== null ? gpa.toFixed(2) : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">GPA (máx. 4.0)</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                      <p className="text-2xl font-bold">{resumen.evaluaciones}</p>
                      <p className="text-xs text-muted-foreground">Evaluaciones</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{resumen.aprobadas}</p>
                      <p className="text-xs text-muted-foreground">Aprobadas</p>
                    </div>
                  </div>
                )}

                {/* Leyenda de la escala: sin ella, una "C" no dice nada a quien
                    no lleva académico todos los días —y aquí entra psicología. */}
                <ul className="flex flex-wrap gap-2">
                  {BANDAS.map((b) => (
                    <li
                      key={b.letra}
                      className={cn("rounded-full border px-2.5 py-1 text-[10px]", b.clase)}
                    >
                      {b.letra} ({b.min}
                      {b.letra === "A" ? "-100" : b.letra === "F" ? "-59" : `-${b.min + 9}`}) ={" "}
                      {b.gpa.toFixed(1)}
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  {cuatrimestres.map((c) => (
                    <div key={c.cuatrimestre} className="overflow-hidden rounded-xl border">
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/40 px-4 py-2.5">
                        <p className="text-sm font-semibold">{c.cuatrimestre}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {c.promedio !== null && (
                            <Badge
                              className={cn(
                                "text-[10px]",
                                c.promedio >= 70
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700",
                              )}
                            >
                              {c.promedio}%
                            </Badge>
                          )}
                          {c.gpa !== null && (
                            <Badge
                              className={cn(
                                "text-[10px]",
                                c.gpa >= 2
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-orange-100 text-orange-700",
                              )}
                            >
                              GPA {c.gpa.toFixed(2)}
                            </Badge>
                          )}
                          {c.gpa !== null && c.gpa < 2 && (
                            <Badge className="bg-orange-100 text-[10px] text-orange-700">
                              Prueba académica
                            </Badge>
                          )}
                        </div>
                      </div>

                      <ul className="divide-y">
                        {c.notas.map((n) => {
                          const b = banda(n.nota_numerica);
                          return (
                            <li key={n.id} className="flex items-center gap-3 px-4 py-2.5">
                              <span
                                aria-hidden
                                className={cn(
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold",
                                  b.clase,
                                )}
                              >
                                {b.letra}
                              </span>
                              <p className="min-w-0 flex-1 truncate text-sm">{n.materia}</p>
                              <div className="shrink-0 text-right">
                                <p className="text-base font-bold">{n.nota_numerica}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  GPA {n.gpa.toFixed(1)}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </Seccion>
            )}
          </TabsContent>

          {/* 3 · HABITUDES */}
          <TabsContent value="habitudes" className="space-y-6 pt-4">
            <Seccion titulo="Información de Habitudes" icono={Zap}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Dato label="Facilitador" valor={e.facilitador_habitudes} />
                <Dato label="Centro educativo" valor={e.centro_educativo} />
                <Dato label="Director del centro" valor={e.director_centro} />
              </div>

              {expediente.imagenHabitudesUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={expediente.imagenHabitudesUrl}
                  alt="Imagen de Habitudes"
                  className="max-h-48 w-full rounded-xl border object-contain"
                />
              )}
              {e.breve_historia_habitudes ? (
                <Narrativo texto={e.breve_historia_habitudes} />
              ) : (
                <p className="text-sm italic text-muted-foreground">Sin historia registrada.</p>
              )}
            </Seccion>
          </TabsContent>

          {/* 4 · FAMILIA */}
          <TabsContent value="familia" className="space-y-6 pt-4">
            <Seccion titulo="Familia" icono={User}>
              {familiares.length === 0 ? (
                <p className="text-sm italic text-muted-foreground">Sin familiares registrados.</p>
              ) : (
                <div className="space-y-2">
                  {familiares.map((f) => (
                    <FilaFamiliar
                      key={f.id}
                      parentesco={f.parentesco}
                      nombre={f.nombre}
                      edad={f.edad}
                      telefono={f.telefono}
                      profesion={f.profesion}
                    />
                  ))}
                </div>
              )}
            </Seccion>

            {vivienda && (
              <>
                <Seccion titulo="Convivencia" icono={Home}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Dato label="Vive con" valor={vivienda.con_quien_vive} />
                    <Dato label="Por qué vive con esa persona" valor={vivienda.por_que_vive_con_esa_persona} />
                    <Dato label="Hermanos" valor={vivienda.hermanos_cantidad} />
                  </div>
                </Seccion>

                <Seccion titulo="Vivienda" icono={Home}>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Dato label="Casa propia" valor={vivienda.casa_propia} />
                    <Dato label="Tipo de casa" valor={vivienda.tipo_casa} />
                    <Dato label="Baño" valor={vivienda.bano_dentro} />
                    <Dato label="Habitaciones" valor={vivienda.habitaciones} />
                    <Dato label="Camas" valor={vivienda.camas} />
                    <Dato label="Quiénes duermen en cada cama" valor={vivienda.quienes_duermen_cama} />
                  </div>
                </Seccion>
              </>
            )}
          </TabsContent>

          {/* 5 · HISTORIA */}
          <TabsContent value="historia" className="space-y-6 pt-4">
            <Seccion titulo="Historia de vida" icono={Heart}>
              <Narrativo texto={socioeconomico?.historia_de_vida} />
            </Seccion>
            <Seccion titulo="Situación familiar" icono={User}>
              <Narrativo texto={socioeconomico?.situacion_familiar} />
            </Seccion>
            <Seccion titulo="Situación económica" icono={TrendingUp}>
              <Narrativo texto={socioeconomico?.situacion_economica} />
            </Seccion>
          </TabsContent>

          {/* 6 · SEGUIMIENTO */}
          <TabsContent value="seguimiento" className="space-y-6 pt-4">
            <Seccion titulo="Estado del cuatrimestre" icono={CheckCircle2}>
              <div className="grid grid-cols-2 gap-3">
                <InsigniaSeguimiento
                  label="Correo al patrocinador"
                  valor={expediente.estudiante.envio_correo_patrocinador ?? null}
                />
                <InsigniaSeguimiento
                  label="Reunión mensual"
                  valor={expediente.estudiante.asistio_reunion_mensual ?? null}
                />
              </div>
            </Seccion>

            {(salud?.enfermedades || salud?.alergias) && (
              <Seccion titulo="Salud" icono={Heart}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {salud.enfermedades && (
                    <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                      <p className="text-xs font-semibold text-rose-700">Enfermedades</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-rose-900">
                        {salud.enfermedades}
                      </p>
                    </div>
                  )}
                  {salud.alergias && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                      <p className="text-xs font-semibold text-amber-700">Alergias</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-amber-900">
                        {salud.alergias}
                      </p>
                    </div>
                  )}
                </div>
              </Seccion>
            )}

            {e.amonestaciones && (
              <Seccion titulo="Amonestaciones del cuatrimestre" icono={AlertTriangle}>
                <div className="whitespace-pre-wrap rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
                  {e.amonestaciones}
                </div>
              </Seccion>
            )}

            {e.solicitudes_pendientes && (
              <Seccion titulo="Solicitudes pendientes" icono={Clock}>
                <Narrativo texto={e.solicitudes_pendientes} />
              </Seccion>
            )}

            {e.notas_adicionales && (
              <Seccion titulo="Notas administrativas" icono={FileText}>
                <Narrativo texto={e.notas_adicionales} />
              </Seccion>
            )}
          </TabsContent>

          {/* 7 · DOCUMENTOS Y OCR
              Es la razón de ser del expediente digital: la ficha en papel
              llega escaneada y la IA propone los campos. `PanelDocumentos`
              es el mismo componente que usa `/expedientes/[id]`, no una
              copia: el OCR tiene que comportarse igual desde donde se abra. */}
          <TabsContent value="documentos" className="pt-4">
            {textosOcr ? (
              <PanelDocumentos
                estudianteId={e.id}
                documentos={expediente.documentos}
                puedeEscribir={puedeEscribir}
                locale={locale}
                textos={textosOcr}
              />
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {expediente.documentos.length} documento(s) adjunto(s). Ábrelo
                en la ficha completa para gestionarlos.
              </p>
            )}

            {expediente.expedienteUrl && (
              <a
                href={expediente.expedienteUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <ExternalLink aria-hidden className="h-4 w-4" />
                Ver el expediente escaneado
              </a>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
