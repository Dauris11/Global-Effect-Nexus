/**
 * Formulario de alta de expediente — ClickUp S5 · #207 (6 secciones).
 *
 * Seis pestañas que replican la ficha social en papel que la fundación ya usa:
 * identidad, situación académica, familia, vivienda, salud y situación de vida.
 * El orden es el de la entrevista, no el de las tablas de la base de datos.
 *
 * Tres decisiones que explican la forma de este archivo:
 *
 * • **Solo el nombre es obligatorio.** Un expediente se abre el día que el joven
 *   llega y se completa durante semanas. Si el formulario exigiera la ficha
 *   entera para guardar, el personal inventaría datos para poder salir de la
 *   pantalla — y un dato inventado en una ficha social es peor que un hueco.
 *
 * • **Un solo objeto de estado, no treinta `useState`.** Con el número de campos
 *   de una ficha social, un estado por campo son treinta declaraciones y
 *   treinta manejadores que dicen todos lo mismo.
 *
 * • **Las pestañas no son pasos.** Radix desmonta el contenido inactivo, pero el
 *   valor vive en el estado del formulario y no en el DOM, así que cambiar de
 *   pestaña no pierde nada y se puede rellenar en cualquier orden. Al fallar la
 *   validación, la pestaña culpable se abre sola: un error en una sección
 *   cerrada es un error invisible.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Users } from "lucide-react";
import { actualizarExpediente, crearExpediente } from "@/server/estudiantes/actions";
import type { ExpedienteCompleto } from "@/server/estudiantes/types";
import {
  ESTADOS_ESTUDIANTE,
  GENEROS,
  PARENTESCOS,
  TIPOS_ESTUDIANTE,
} from "@/server/estudiantes/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Diccionarios que llegan resueltos desde el servidor (`t.raw`). */
export interface TextosExpediente {
  form: Record<string, string>;
  tab: Record<string, string>;
  field: Record<string, string>;
  family: Record<string, string>;
  gender: Record<string, string>;
  relation: Record<string, string>;
  type: Record<string, string>;
  status: Record<string, string>;
  /** Estados del seguimiento del cuatrimestre (`records.followUp`). */
  followUp: Record<string, string>;
}

interface FamiliarForm {
  parentesco: string;
  nombre: string;
  edad: string;
  telefono: string;
  profesion: string;
}

/** Todos los campos de texto de la ficha, planos, tal como se teclean. */
const CAMPOS_INICIALES = {
  // Identidad
  nombre: "",
  cedula: "",
  email: "",
  telefono: "",
  fecha_nacimiento: "",
  lugar_nacimiento: "",
  nacionalidad: "",
  genero: "",
  sexo_documento: "",
  religion: "",
  // Académico
  tipo: "regular",
  estado: "activo",
  programa: "",
  donde_estudia: "",
  universidad: "",
  fecha_ingreso: "",
  centro_educativo: "",
  director_centro: "",
  facilitador_habitudes: "",
  breve_historia_habitudes: "",
  // Vivienda
  con_quien_vive: "",
  por_que_vive_con_esa_persona: "",
  hermanos_cantidad: "",
  casa_propia: "",
  tipo_casa: "",
  bano_dentro: "",
  habitaciones: "",
  camas: "",
  quienes_duermen_cama: "",
  direccion: "",
  comunidad: "",
  ciudad_residencia: "",
  // Salud
  enfermedades: "",
  alergias: "",
  contacto_emergencia_nombre: "",
  contacto_emergencia_telefono: "",
  // Situación
  historia_de_vida: "",
  situacion_familiar: "",
  situacion_economica: "",
  motivo_beca: "",
  metas_academicas: "",
  notas_adicionales: "",
  // Seguimiento del cuatrimestre
  amonestaciones: "",
  solicitudes_pendientes: "",
  envio_correo_patrocinador: "",
  asistio_reunion_mensual: "",
};

/* Estados del compromiso del joven con la Fundación. La reunión admite
   además `justificado`: faltar con aviso no es lo mismo que no aparecer. */
const SEGUIMIENTO = ["pendiente", "si", "no"] as const;
const SEGUIMIENTO_REUNION = [...SEGUIMIENTO, "justificado"] as const;

type Campos = typeof CAMPOS_INICIALES;
type Campo = keyof Campos;

const FAMILIAR_VACIO: FamiliarForm = {
  parentesco: "madre",
  nombre: "",
  edad: "",
  telefono: "",
  profesion: "",
};

/** Máximo de familiares que acepta el esquema del servidor. */
const MAX_FAMILIARES = 12;

/**
 * Los tres campos de abajo se definen FUERA del componente a propósito.
 *
 * Declarados dentro del cuerpo serían un tipo de componente nuevo en cada
 * render: React desmontaría el `<input>` y montaría otro en su lugar con cada
 * tecla, y el cursor saltaría fuera del campo a la primera letra. Es el fallo
 * clásico de los formularios largos y no se ve hasta que alguien escribe.
 */

/** Campo de texto de una línea, el caso más repetido de la ficha. */
function CampoTexto({
  etiqueta,
  valor,
  onCambio,
  tipo = "text",
  ayuda,
  ...extra
}: {
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  tipo?: string;
  ayuda?: string;
} & Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type">) {
  return (
    <Field label={etiqueta} ayuda={ayuda}>
      {(p) => (
        <Input
          {...p}
          {...extra}
          type={tipo}
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
        />
      )}
    </Field>
  );
}

/** Campo largo (historia de vida, situación económica…). */
function CampoLargo({
  etiqueta,
  valor,
  onCambio,
  filas = 4,
}: {
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  filas?: number;
}) {
  return (
    <Field label={etiqueta}>
      {(p) => (
        <Textarea
          {...p}
          rows={filas}
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
        />
      )}
    </Field>
  );
}

/**
 * Desplegable de enum con las etiquetas ya traducidas.
 *
 * Radix Select no admite `value=""` para "sin elegir" (esa cadena está
 * reservada para limpiar la selección), así que la opción vacía viaja con el
 * centinela `SIN_VALOR` y se traduce a cadena vacía al salir.
 */
const SIN_VALOR = "__sin_valor__";

function CampoSelect({
  etiqueta,
  valor,
  onCambio,
  opciones,
  diccionario,
  vacio,
}: {
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  opciones: readonly string[];
  diccionario: Record<string, string>;
  /** Etiqueta de la opción "sin especificar"; si falta, el campo es cerrado. */
  vacio?: string;
}) {
  return (
    <Field label={etiqueta}>
      {(p) => (
        <Select
          value={valor || (vacio ? SIN_VALOR : "")}
          onValueChange={(v) => onCambio(v === SIN_VALOR ? "" : v)}
        >
          <SelectTrigger id={p.id}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {vacio && <SelectItem value={SIN_VALOR}>{vacio}</SelectItem>}
            {opciones.map((v) => (
              <SelectItem key={v} value={v}>
                {diccionario[v] ?? v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Field>
  );
}

/**
 * Vuelca un expediente de la base de datos en el estado plano del formulario.
 *
 * Todo se convierte a cadena porque los `<input>` no aceptan `null` sin
 * volverse no controlados —React avisa en consola y el campo deja de responder
 * al estado—, y los números tampoco: se teclean como texto y el servidor los
 * vuelve a convertir con Zod al guardar.
 */
function desdeExpediente(x: ExpedienteCompleto): {
  campos: Campos;
  familiares: FamiliarForm[];
} {
  const txt = (v: unknown) => (v === null || v === undefined ? "" : String(v));
  const e = x.estudiante;
  const v = x.vivienda;
  const s = x.salud;
  const so = x.socioeconomico;

  return {
    campos: {
      ...CAMPOS_INICIALES,
      nombre: txt(e.nombre),
      cedula: txt(e.cedula),
      email: txt(e.email),
      telefono: txt(e.telefono),
      fecha_nacimiento: txt(e.fecha_nacimiento),
      lugar_nacimiento: txt(e.lugar_nacimiento),
      nacionalidad: txt(e.nacionalidad),
      genero: txt(e.genero),
      religion: txt(e.religion),
      tipo: txt(e.tipo) || "regular",
      estado: txt(e.estado) || "activo",
      programa: txt(e.programa),
      donde_estudia: txt(e.donde_estudia),
      universidad: txt(e.universidad),
      fecha_ingreso: txt(e.fecha_ingreso),
      centro_educativo: txt(e.centro_educativo),
      facilitador_habitudes: txt(e.facilitador_habitudes),
      breve_historia_habitudes: txt(e.breve_historia_habitudes),
      notas_adicionales: txt(e.notas_adicionales),
      sexo_documento: txt(e.sexo_documento),
      director_centro: txt(e.director_centro),
      amonestaciones: txt(e.amonestaciones),
      solicitudes_pendientes: txt(e.solicitudes_pendientes),
      envio_correo_patrocinador: txt(e.envio_correo_patrocinador),
      asistio_reunion_mensual: txt(e.asistio_reunion_mensual),
      con_quien_vive: txt(v?.con_quien_vive),
      por_que_vive_con_esa_persona: txt(v?.por_que_vive_con_esa_persona),
      hermanos_cantidad: txt(v?.hermanos_cantidad),
      casa_propia: txt(v?.casa_propia),
      tipo_casa: txt(v?.tipo_casa),
      bano_dentro: txt(v?.bano_dentro),
      habitaciones: txt(v?.habitaciones),
      camas: txt(v?.camas),
      quienes_duermen_cama: txt(v?.quienes_duermen_cama),
      direccion: txt(v?.direccion),
      comunidad: txt(v?.comunidad),
      ciudad_residencia: txt(v?.ciudad_residencia),
      enfermedades: txt(s?.enfermedades),
      alergias: txt(s?.alergias),
      contacto_emergencia_nombre: txt(s?.contacto_emergencia_nombre),
      contacto_emergencia_telefono: txt(s?.contacto_emergencia_telefono),
      historia_de_vida: txt(so?.historia_de_vida),
      situacion_familiar: txt(so?.situacion_familiar),
      situacion_economica: txt(so?.situacion_economica),
      motivo_beca: txt(so?.motivo_beca),
      metas_academicas: txt(so?.metas_academicas),
    },
    familiares: x.familiares.map((f) => ({
      parentesco: f.parentesco,
      nombre: f.nombre,
      edad: txt(f.edad),
      telefono: txt(f.telefono),
      profesion: txt(f.profesion),
    })),
  };
}

export function FormularioExpediente({
  textos,
  rutaListado,
  registro,
}: {
  textos: TextosExpediente;
  rutaListado: string;
  /** Presente ⇒ edición. Ausente ⇒ alta. */
  registro?: ExpedienteCompleto;
}) {
  const router = useRouter();
  const edicion = registro !== undefined;
  const iniciales = React.useMemo(
    () =>
      registro
        ? desdeExpediente(registro)
        : { campos: CAMPOS_INICIALES, familiares: [] as FamiliarForm[] },
    [registro],
  );

  const [campos, setCampos] = React.useState<Campos>(iniciales.campos);
  const [familiares, setFamiliares] = React.useState<FamiliarForm[]>(iniciales.familiares);
  const [pestana, setPestana] = React.useState("identity");
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorNombre, setErrorNombre] = React.useState<string | null>(null);

  const set = (campo: Campo) => (valor: string) =>
    setCampos((prev) => ({ ...prev, [campo]: valor }));

  const cambiar =
    (campo: Campo) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(campo)(e.target.value);

  function añadirFamiliar() {
    setFamiliares((prev) =>
      prev.length >= MAX_FAMILIARES ? prev : [...prev, { ...FAMILIAR_VACIO }],
    );
  }

  function quitarFamiliar(indice: number) {
    setFamiliares((prev) => prev.filter((_, i) => i !== indice));
  }

  function cambiarFamiliar(indice: number, campo: keyof FamiliarForm, valor: string) {
    setFamiliares((prev) =>
      prev.map((f, i) => (i === indice ? { ...f, [campo]: valor } : f)),
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorNombre(null);

    if (!campos.nombre.trim()) {
      setErrorNombre(textos.form.nameRequired);
      // La pestaña con el error se abre sola; si no, el aviso quedaría oculto.
      setPestana("identity");
      return;
    }

    setEnviando(true);
    try {
      const datos = {
        ...campos,
        // Los familiares sin nombre son filas que el usuario abrió y no llenó:
        // se descartan en silencio en vez de bloquear el guardado.
        familiares: familiares
          .filter((f) => f.nombre.trim())
          .map((f) => ({
            parentesco: f.parentesco,
            nombre: f.nombre.trim(),
            edad: f.edad,
            telefono: f.telefono,
            profesion: f.profesion,
          })),
        vivienda: {
          con_quien_vive: campos.con_quien_vive,
          por_que_vive_con_esa_persona: campos.por_que_vive_con_esa_persona,
          hermanos_cantidad: campos.hermanos_cantidad,
          casa_propia: campos.casa_propia,
          tipo_casa: campos.tipo_casa,
          bano_dentro: campos.bano_dentro,
          habitaciones: campos.habitaciones,
          camas: campos.camas,
          quienes_duermen_cama: campos.quienes_duermen_cama,
          direccion: campos.direccion,
          comunidad: campos.comunidad,
          ciudad_residencia: campos.ciudad_residencia,
        },
        salud: {
          enfermedades: campos.enfermedades,
          alergias: campos.alergias,
          contacto_emergencia_nombre: campos.contacto_emergencia_nombre,
          contacto_emergencia_telefono: campos.contacto_emergencia_telefono,
        },
        socioeconomico: {
          historia_de_vida: campos.historia_de_vida,
          situacion_familiar: campos.situacion_familiar,
          situacion_economica: campos.situacion_economica,
          motivo_beca: campos.motivo_beca,
          metas_academicas: campos.metas_academicas,
        },
      };

      // En los dos casos se termina en la ficha: tras crearla, porque lo
      // siguiente que se hace es revisarla; tras editarla, porque es de donde
      // se venía y hay que ver el cambio aplicado.
      const id = registro
        ? (await actualizarExpediente({ ...datos, id: registro.estudiante.id }),
          registro.estudiante.id)
        : await crearExpediente(datos);
      router.push(`${rutaListado}/${id}`);
      router.refresh();
    } catch {
      setError(textos.form.error);
      setEnviando(false);
    }
  }

  const SECCIONES = [
    { valor: "identity", etiqueta: textos.tab.identity },
    { valor: "academic", etiqueta: textos.tab.academic },
    { valor: "family", etiqueta: textos.tab.family },
    { valor: "housing", etiqueta: textos.tab.housing },
    { valor: "health", etiqueta: textos.tab.health },
    { valor: "social", etiqueta: textos.tab.social },
  ];

  return (
    <form onSubmit={enviar} className="space-y-6">
      <Tabs value={pestana} onValueChange={setPestana}>
        <TabsList>
          {SECCIONES.map((s) => (
            <TabsTrigger key={s.valor} value={s.valor}>
              {s.etiqueta}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* 1 · Identidad */}
        <TabsContent value="identity">
          <Card className="grid gap-4 p-5 sm:grid-cols-2">
            <Field
              label={textos.field.name}
              error={errorNombre ?? undefined}
              requerido
              className="sm:col-span-2"
            >
              {(p) => (
                <Input
                  {...p}
                  value={campos.nombre}
                  onChange={cambiar("nombre")}
                  autoFocus
                />
              )}
            </Field>

            <CampoTexto valor={campos.cedula} onCambio={set("cedula")} etiqueta={textos.field.idCard} />
            <CampoTexto valor={campos.telefono} onCambio={set("telefono")} etiqueta={textos.field.phone} tipo="tel" />
            <CampoTexto valor={campos.email} onCambio={set("email")} etiqueta={textos.field.email} tipo="email" />
            <CampoTexto
              valor={campos.fecha_nacimiento} onCambio={set("fecha_nacimiento")}
              etiqueta={textos.field.birthDate}
              tipo="date"
            />
            <CampoTexto valor={campos.lugar_nacimiento} onCambio={set("lugar_nacimiento")} etiqueta={textos.field.birthPlace} />
            <CampoTexto valor={campos.nacionalidad} onCambio={set("nacionalidad")} etiqueta={textos.field.nationality} />
            <CampoSelect
              valor={campos.genero} onCambio={set("genero")}
              etiqueta={textos.field.gender}
              opciones={GENEROS}
              diccionario={textos.gender}
              vacio={textos.field.optional}
            />
            <CampoTexto valor={campos.sexo_documento} onCambio={set("sexo_documento")} etiqueta={textos.field.sexDocument} />
            <CampoTexto valor={campos.religion} onCambio={set("religion")} etiqueta={textos.field.religion} />
          </Card>
        </TabsContent>

        {/* 2 · Situación académica e institucional */}
        <TabsContent value="academic">
          <Card className="grid gap-4 p-5 sm:grid-cols-2">
            <CampoSelect
              valor={campos.tipo} onCambio={set("tipo")}
              etiqueta={textos.field.type}
              opciones={TIPOS_ESTUDIANTE}
              diccionario={textos.type}
            />
            <CampoSelect
              valor={campos.estado} onCambio={set("estado")}
              etiqueta={textos.field.status}
              opciones={ESTADOS_ESTUDIANTE}
              diccionario={textos.status}
            />
            <CampoTexto valor={campos.programa} onCambio={set("programa")} etiqueta={textos.field.program} />
            <CampoTexto valor={campos.donde_estudia} onCambio={set("donde_estudia")} etiqueta={textos.field.whereStudies} />
            <CampoTexto valor={campos.universidad} onCambio={set("universidad")} etiqueta={textos.field.university} />
            <CampoTexto
              valor={campos.fecha_ingreso} onCambio={set("fecha_ingreso")}
              etiqueta={textos.field.entryDate}
              tipo="date"
            />
            <CampoTexto valor={campos.centro_educativo} onCambio={set("centro_educativo")} etiqueta={textos.field.school} />
            <CampoTexto valor={campos.director_centro} onCambio={set("director_centro")} etiqueta={textos.field.schoolDirector} />
            <CampoTexto
              valor={campos.facilitador_habitudes} onCambio={set("facilitador_habitudes")}
              etiqueta={textos.field.facilitator}
            />
            <div className="sm:col-span-2">
              <CampoLargo
                valor={campos.breve_historia_habitudes} onCambio={set("breve_historia_habitudes")}
                etiqueta={textos.field.habitudesStory}
                filas={3}
              />
            </div>
          </Card>
        </TabsContent>

        {/* 3 · Familia (1:N) */}
        <TabsContent value="family">
          <div className="space-y-4">
            {familiares.length === 0 ? (
              <EmptyState
                icon={Users}
                title={textos.family.empty}
                description={textos.family.emptyHint}
                action={
                  <Button type="button" variant="outline" onClick={añadirFamiliar}>
                    <Plus aria-hidden />
                    {textos.family.add}
                  </Button>
                }
              />
            ) : (
              <>
                {familiares.map((f, i) => (
                  <Card key={i} className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="tabular-nums text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        {textos.family.member.replace("{n}", String(i + 1))}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => quitarFamiliar(i)}
                      >
                        <Trash2 aria-hidden />
                        {textos.family.remove}
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={textos.family.relation}>
                        {(p) => (
                          <Select
                            value={f.parentesco}
                            onValueChange={(v) => cambiarFamiliar(i, "parentesco", v)}
                          >
                            <SelectTrigger id={p.id}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PARENTESCOS.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {textos.relation[v] ?? v}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </Field>

                      <Field label={textos.family.name}>
                        {(p) => (
                          <Input
                            {...p}
                            value={f.nombre}
                            onChange={(e) => cambiarFamiliar(i, "nombre", e.target.value)}
                          />
                        )}
                      </Field>

                      <Field label={textos.family.age}>
                        {(p) => (
                          <Input
                            {...p}
                            type="number"
                            min={0}
                            max={120}
                            value={f.edad}
                            onChange={(e) => cambiarFamiliar(i, "edad", e.target.value)}
                          />
                        )}
                      </Field>

                      <Field label={textos.family.phone}>
                        {(p) => (
                          <Input
                            {...p}
                            type="tel"
                            value={f.telefono}
                            onChange={(e) =>
                              cambiarFamiliar(i, "telefono", e.target.value)
                            }
                          />
                        )}
                      </Field>

                      <div className="sm:col-span-2">
                        <Field label={textos.family.occupation}>
                          {(p) => (
                            <Input
                              {...p}
                              value={f.profesion}
                              onChange={(e) =>
                                cambiarFamiliar(i, "profesion", e.target.value)
                              }
                            />
                          )}
                        </Field>
                      </div>
                    </div>
                  </Card>
                ))}

                {familiares.length < MAX_FAMILIARES && (
                  <Button type="button" variant="outline" onClick={añadirFamiliar}>
                    <Plus aria-hidden />
                    {textos.family.add}
                  </Button>
                )}
              </>
            )}
          </div>
        </TabsContent>

        {/* 4 · Vivienda */}
        <TabsContent value="housing">
          <Card className="grid gap-4 p-5 sm:grid-cols-2">
            <CampoTexto valor={campos.con_quien_vive} onCambio={set("con_quien_vive")} etiqueta={textos.field.livesWith} />
            <CampoTexto
              valor={campos.por_que_vive_con_esa_persona} onCambio={set("por_que_vive_con_esa_persona")}
              etiqueta={textos.field.whyLivesWith}
            />
            <CampoTexto
              valor={campos.hermanos_cantidad} onCambio={set("hermanos_cantidad")}
              etiqueta={textos.field.siblings}
              tipo="number"
            />
            <CampoTexto valor={campos.casa_propia} onCambio={set("casa_propia")} etiqueta={textos.field.ownHouse} />
            <CampoTexto valor={campos.tipo_casa} onCambio={set("tipo_casa")} etiqueta={textos.field.houseType} />
            <CampoTexto valor={campos.bano_dentro} onCambio={set("bano_dentro")} etiqueta={textos.field.bathroom} />
            <CampoTexto
              valor={campos.habitaciones} onCambio={set("habitaciones")}
              etiqueta={textos.field.rooms}
              tipo="number"
            />
            <CampoTexto valor={campos.camas} onCambio={set("camas")} etiqueta={textos.field.beds} tipo="number" />
            <div className="sm:col-span-2">
              <CampoTexto
                valor={campos.quienes_duermen_cama} onCambio={set("quienes_duermen_cama")}
                etiqueta={textos.field.whoSleeps}
              />
            </div>
            <div className="sm:col-span-2">
              <CampoTexto valor={campos.direccion} onCambio={set("direccion")} etiqueta={textos.field.address} />
            </div>
            <CampoTexto valor={campos.comunidad} onCambio={set("comunidad")} etiqueta={textos.field.community} />
            <CampoTexto valor={campos.ciudad_residencia} onCambio={set("ciudad_residencia")} etiqueta={textos.field.city} />
          </Card>
        </TabsContent>

        {/* 5 · Salud */}
        <TabsContent value="health">
          <Card className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <CampoLargo
                valor={campos.enfermedades} onCambio={set("enfermedades")}
                etiqueta={textos.field.illnesses}
                filas={3}
              />
            </div>
            <div className="sm:col-span-2">
              <CampoLargo
                valor={campos.alergias} onCambio={set("alergias")}
                etiqueta={textos.field.allergies}
                filas={2}
              />
            </div>
            <CampoTexto
              valor={campos.contacto_emergencia_nombre} onCambio={set("contacto_emergencia_nombre")}
              etiqueta={textos.field.emergencyName}
            />
            <CampoTexto
              valor={campos.contacto_emergencia_telefono} onCambio={set("contacto_emergencia_telefono")}
              etiqueta={textos.field.emergencyPhone}
              tipo="tel"
            />
          </Card>
        </TabsContent>

        {/* 6 · Situación y proyecto de vida */}
        <TabsContent value="social">
          <Card className="space-y-4 p-5">
            <CampoLargo valor={campos.historia_de_vida} onCambio={set("historia_de_vida")} etiqueta={textos.field.lifeStory} />
            <CampoLargo
              valor={campos.situacion_familiar} onCambio={set("situacion_familiar")}
              etiqueta={textos.field.familySituation}
              filas={3}
            />
            <CampoLargo
              valor={campos.situacion_economica} onCambio={set("situacion_economica")}
              etiqueta={textos.field.economicSituation}
              filas={3}
            />
            <CampoLargo
              valor={campos.motivo_beca} onCambio={set("motivo_beca")}
              etiqueta={textos.field.scholarshipReason}
              filas={3}
            />
            <CampoLargo
              valor={campos.metas_academicas} onCambio={set("metas_academicas")}
              etiqueta={textos.field.academicGoals}
              filas={3}
            />
            <CampoLargo
              valor={campos.notas_adicionales} onCambio={set("notas_adicionales")}
              etiqueta={textos.field.notes}
              filas={2}
            />

            {/* Seguimiento del cuatrimestre. Va aquí y no en una pestaña
                propia porque son cuatro campos que se revisan a la vez que
                las notas administrativas, en la misma conversación. */}
            <CampoSelect
              valor={campos.envio_correo_patrocinador}
              onCambio={set("envio_correo_patrocinador")}
              etiqueta={textos.field.sponsorEmail}
              opciones={SEGUIMIENTO}
              diccionario={textos.followUp}
              vacio={textos.followUp.unset}
            />
            <CampoSelect
              valor={campos.asistio_reunion_mensual}
              onCambio={set("asistio_reunion_mensual")}
              etiqueta={textos.field.monthlyMeeting}
              opciones={SEGUIMIENTO_REUNION}
              diccionario={textos.followUp}
              vacio={textos.followUp.unset}
            />
            <CampoLargo
              valor={campos.amonestaciones} onCambio={set("amonestaciones")}
              etiqueta={textos.field.warnings}
              filas={2}
            />
            <CampoLargo
              valor={campos.solicitudes_pendientes} onCambio={set("solicitudes_pendientes")}
              etiqueta={textos.field.pendingRequests}
              filas={2}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <p role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      )}
      {errorNombre && pestana !== "identity" && (
        <p role="alert" className="text-[13px] text-destructive">
          {textos.form.requiredHint}
        </p>
      )}

      {/* Guardar está siempre visible: la ficha se guarda desde cualquier
          sección, no solo al llegar a la última. */}
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={enviando}>
          {enviando
            ? textos.form.saving
            : edicion
              ? textos.form.saveEdit
              : textos.form.save}
        </Button>
        {/* Cancelar devuelve a donde se venía: al listado si se está creando,
            a la ficha si se está editando. */}
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            router.push(
              registro ? `${rutaListado}/${registro.estudiante.id}` : rutaListado,
            )
          }
        >
          {textos.form.cancel}
        </Button>
      </div>
    </form>
  );
}
