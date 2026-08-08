/**
 * Documentos del expediente y OCR — ClickUp S5 · #209.
 *
 * Un botón de subida y la lista de extracciones. La regla que gobierna toda
 * esta pantalla es **la IA propone, la persona confirma**: los campos que salen
 * del documento se muestran para revisarlos, y no se escriben en el expediente.
 * Un dato mal leído de una cédula borrosa que entra solo al expediente es peor
 * que no haber pasado el OCR.
 *
 * Cada extracción muestra su estado y su confianza; una extracción fallida se
 * queda a la vista con su motivo, porque un fallo silencioso haría creer que el
 * documento nunca se subió.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Upload } from "lucide-react";
import { procesarOcr } from "@/server/ia/actions";
import type { DocumentoExpediente } from "@/server/estudiantes/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChipEstado } from "@/components/ui/chip-estado";
import { EmptyState } from "@/components/ui/empty-state";

/** Estado de la extracción → color del sistema. */
function bandaDeOcr(estado: DocumentoExpediente["ocr_estado"]) {
  switch (estado) {
    case "completado":
      return "tarea-completada" as const;
    case "procesando":
      return "tarea-progreso" as const;
    case "error":
      return "prioridad-urgente" as const;
    default:
      return "tarea-pendiente" as const;
  }
}

/** Etiqueta legible de una clave de `datos_extraidos`. */
/**
 * Etiquetas de los campos que devuelve el OCR. Sigue el orden del expediente
 * en papel para que revisar la extracción sea recorrer la ficha de arriba
 * abajo. Una clave sin etiqueta se pinta con su nombre crudo: el dato se ve
 * igual, solo pierde el nombre bonito.
 */
const ETIQUETAS: Record<string, string> = {
  // Identificación
  nombre: "Nombre",
  cedula: "Cédula",
  fecha_nacimiento: "Fecha de nacimiento",
  lugar_nacimiento: "Lugar de nacimiento",
  nacionalidad: "Nacionalidad",
  genero: "Género",
  sexo_documento: "Sexo (documento)",
  religion: "Religión",
  telefono: "Teléfono",
  email: "Correo",
  // Residencia
  direccion: "Dirección",
  comunidad: "Comunidad",
  ciudad_residencia: "Ciudad",
  pais_residencia: "País",
  // Académico
  programa: "¿Qué estudia?",
  donde_estudia: "¿Dónde estudia?",
  universidad: "Universidad",
  fecha_ingreso: "Fecha de ingreso",
  // Habitudes
  facilitador_habitudes: "Facilitador de Habitudes",
  centro_educativo: "Centro educativo",
  director_centro: "Director del centro",
  breve_historia_habitudes: "Breve historia de Habitudes",
  // Familia
  padre_nombre: "Padre",
  padre_edad: "Edad del padre",
  padre_telefono: "Teléfono del padre",
  padre_profesion: "Profesión del padre",
  madre_nombre: "Madre",
  madre_edad: "Edad de la madre",
  madre_telefono: "Teléfono de la madre",
  madre_profesion: "Profesión de la madre",
  tutor_nombre: "Tutor",
  tutor_edad: "Edad del tutor",
  tutor_telefono: "Teléfono del tutor",
  tutor_profesion: "Profesión del tutor",
  // Convivencia y vivienda
  con_quien_vive: "Vive con",
  por_que_vive_con_esa_persona: "¿Por qué vive con esa persona?",
  hermanos_cantidad: "Hermanos menores",
  hermanos_edades: "Hermanos (nombres y edades)",
  hermanas_edades: "Hermanas (nombres y edades)",
  casa_propia: "Casa propia",
  tipo_casa: "Tipo de casa",
  bano_dentro: "Baño",
  habitaciones: "Habitaciones",
  camas: "Camas",
  quienes_duermen_cama: "¿Quiénes duermen en cada cama?",
  // Salud y emergencia
  enfermedades: "Enfermedades",
  alergias: "Alergias",
  contacto_emergencia_nombre: "Contacto de emergencia",
  contacto_emergencia_telefono: "Teléfono de emergencia",
  // Narrativos
  historia_de_vida: "Historia de vida",
  situacion_familiar: "Situación familiar",
  situacion_economica: "Situación económica",
  motivo_beca: "Motivo de la beca",
  metas_academicas: "Metas académicas",
  observaciones: "Observaciones",
};

/**
 * Campos que ocupan las dos columnas: son párrafos, no datos de una línea, y
 * partidos por la mitad quedan ilegibles.
 */
const CAMPOS_ANCHOS = new Set([
  "observaciones",
  "historia_de_vida",
  "situacion_familiar",
  "situacion_economica",
  "motivo_beca",
  "metas_academicas",
  "breve_historia_habitudes",
  "por_que_vive_con_esa_persona",
  "quienes_duermen_cama",
]);

const MAX_BYTES = 10 * 1024 * 1024;
const ACEPTADOS = "image/jpeg,image/png,image/webp,image/gif,application/pdf";

export function PanelDocumentos({
  estudianteId,
  documentos,
  puedeEscribir,
  locale,
  textos,
}: {
  estudianteId: string;
  documentos: DocumentoExpediente[];
  puedeEscribir: boolean;
  locale: string;
  textos: Record<string, string> & { status?: Record<string, string> };
}) {
  const router = useRouter();
  const input = React.useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fecha = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function subir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    // Se limpia el input aquí para que volver a elegir el MISMO archivo tras un
    // error dispare otro `change`; si no, el segundo intento no haría nada.
    e.target.value = "";
    if (!archivo) return;

    setError(null);
    if (archivo.size > MAX_BYTES) {
      setError(textos.fileTooLarge);
      return;
    }
    if (!ACEPTADOS.split(",").includes(archivo.type)) {
      setError(textos.unsupported);
      return;
    }

    setSubiendo(true);
    const datos = new FormData();
    datos.set("archivo", archivo);
    datos.set("estudiante_id", estudianteId);

    try {
      await procesarOcr(datos);
      router.refresh();
    } catch (err) {
      // El mensaje viene de la acción y ya dice qué pasó (formato, tamaño,
      // rechazo del modelo); mostrarlo es más útil que un texto genérico.
      setError((err as Error).message || textos.error);
    } finally {
      setSubiendo(false);
    }
  }

  const boton = puedeEscribir && (
    <>
      <input
        ref={input}
        type="file"
        accept={ACEPTADOS}
        onChange={subir}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => input.current?.click()}
        disabled={subiendo}
      >
        {subiendo ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          <Upload aria-hidden />
        )}
        {subiendo ? textos.processing : textos.upload}
      </Button>
    </>
  );

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 tabular-nums text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <FileText className="size-3.5" aria-hidden />
            {textos.title}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">{textos.subtitle}</p>
        </div>
        {boton}
      </div>

      {error && (
        <p role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      )}

      {documentos.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={textos.empty}
          description={puedeEscribir ? textos.emptyHint : undefined}
        />
      ) : (
        <div className="space-y-3">
          {documentos.map((d) => {
            const banda = bandaDeOcr(d.ocr_estado);
            /* Solo se pintan los campos que el OCR encontró. En una ficha real
               la mayoría vienen null —el modelo tiene prohibido rellenar por
               parecido—, y listarlos vacíos escondería los que sí se leyeron.
               Los números entran aquí igual que los textos: `hermanos_cantidad`
               llega como 3, no como "3". */
            const campos = Object.entries(d.datos_extraidos ?? {})
              .filter(([clave, v]) => {
                if (clave === "confianza") return false;
                if (typeof v === "number") return true;
                return typeof v === "string" && v.trim() !== "";
              })
              .map(([clave, v]) => [clave, String(v)]) as [string, string][];

            return (
              <Card key={d.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {d.nombre ?? textos.title}
                    </p>
                    <p className="mt-0.5 tabular-nums text-[13px] tabular-nums text-muted-foreground">
                      {fecha.format(new Date(d.created_at))}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {d.ocr_confianza != null && (
                      <span className="tabular-nums text-[13px] tabular-nums text-muted-foreground">
                        {textos.confidence}: {d.ocr_confianza}%
                      </span>
                    )}
                    <ChipEstado estado={banda} punto>
                      {textos.status?.[d.ocr_estado] ?? d.ocr_estado}
                    </ChipEstado>
                  </div>
                </div>

                {d.ocr_estado === "error" && d.mensaje_error && (
                  <p className="mt-3 text-[13px] text-destructive">{d.mensaje_error}</p>
                )}

                {campos.length > 0 && (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="tabular-nums text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {textos.extracted}
                    </p>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                      {campos.map(([clave, valor]) => (
                        <div key={clave} className={cn(CAMPOS_ANCHOS.has(clave) && "sm:col-span-2")}>
                          <dt className="text-[13px] text-muted-foreground">
                            {ETIQUETAS[clave] ?? clave}
                          </dt>
                          <dd className="whitespace-pre-wrap text-[15px]">{valor}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-4 text-[13px] text-muted-foreground">
                      {textos.reviewHint}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
