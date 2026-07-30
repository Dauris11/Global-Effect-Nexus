/**
 * Esquemas de validación (Zod) del dominio Estudiantes. Se validan en la
 * frontera (Server Actions) antes de tocar la BD.
 */
import { z } from "zod";

/** Enums que replican los tipos de la migración 0005. */
export const TIPOS_ESTUDIANTE = ["becado", "regular"] as const;
export const ESTADOS_ESTUDIANTE = [
  "reclutado",
  "postulado",
  "academia_liderazgo",
  "standby_tecnico",
  "activo",
  "inactivo",
  "graduado",
  "suspendido",
] as const;
export const GENEROS = ["masculino", "femenino", "otro"] as const;
export const PARENTESCOS = [
  "padre",
  "madre",
  "tutor",
  "madrastra",
  "padrastro",
  "hermano",
  "hermana",
  "otro",
] as const;

export const CrearEstudiante = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  cedula: z.string().trim().optional(),
  email: z.string().email().optional().or(z.literal("")),
  telefono: z.string().trim().optional(),
  tipo: z.enum(TIPOS_ESTUDIANTE).default("regular"),
  programa: z.string().trim().optional(),
});

export type CrearEstudianteInput = z.infer<typeof CrearEstudiante>;

/**
 * Texto opcional de formulario. Un `<input>` vacío llega como `""`, no como
 * `undefined`: se normaliza aquí a `null` para que la BD guarde ausencia de
 * dato y no una cadena vacía (que luego se renderiza como un hueco raro).
 */
const texto = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

/** Entero opcional que puede llegar como cadena desde el formulario. */
const entero = z
  .union([z.number(), z.string()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === "") return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : null;
  });

/** Fecha ISO opcional (`YYYY-MM-DD`) tal como la entrega `<input type="date">`. */
const fecha = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : null));

/** Un familiar del expediente (tabla `familiar`, 1:N). */
export const FamiliarInput = z.object({
  parentesco: z.enum(PARENTESCOS),
  nombre: z.string().trim().min(1, "El nombre del familiar es obligatorio"),
  edad: entero,
  telefono: texto,
  profesion: texto,
});

/**
 * Expediente completo: las seis pestañas del formulario de S5.
 *
 * Solo `nombre` es obligatorio, a propósito. Un expediente se abre cuando el
 * joven llega a la fundación y se completa a lo largo de semanas —a veces meses,
 * cuando falta un documento de la familia—. Exigir la ficha entera de golpe
 * obligaría al personal a inventar datos para poder guardar.
 */
export const CrearExpediente = z.object({
  // 1 · Identidad
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  cedula: texto,
  email: z.union([z.string().trim().email("Correo inválido"), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  telefono: texto,
  fecha_nacimiento: fecha,
  lugar_nacimiento: texto,
  nacionalidad: texto,
  genero: z.enum(GENEROS).optional().or(z.literal("")).transform((v) => (v ? v : null)),
  religion: texto,

  // 2 · Situación académica e institucional
  tipo: z.enum(TIPOS_ESTUDIANTE).default("regular"),
  estado: z.enum(ESTADOS_ESTUDIANTE).default("activo"),
  programa: texto,
  donde_estudia: texto,
  universidad: texto,
  fecha_ingreso: fecha,
  centro_educativo: texto,
  facilitador_habitudes: texto,
  breve_historia_habitudes: texto,

  // 3 · Familia (1:N)
  familiares: z.array(FamiliarInput).max(12).default([]),

  // 4 · Vivienda
  vivienda: z
    .object({
      con_quien_vive: texto,
      por_que_vive_con_esa_persona: texto,
      hermanos_cantidad: entero,
      casa_propia: texto,
      tipo_casa: texto,
      bano_dentro: texto,
      habitaciones: entero,
      camas: entero,
      quienes_duermen_cama: texto,
      direccion: texto,
      comunidad: texto,
      ciudad_residencia: texto,
    })
    .optional(),

  // 5 · Salud
  salud: z
    .object({
      enfermedades: texto,
      alergias: texto,
      contacto_emergencia_nombre: texto,
      contacto_emergencia_telefono: texto,
    })
    .optional(),

  // 6 · Socioeconómico y proyecto de vida
  socioeconomico: z
    .object({
      historia_de_vida: texto,
      situacion_familiar: texto,
      situacion_economica: texto,
      motivo_beca: texto,
      metas_academicas: texto,
    })
    .optional(),

  notas_adicionales: texto,
});

/**
 * Actualización del expediente: los mismos campos más el `id`.
 *
 * Derivado del alta y no escrito aparte, para que un campo nuevo en la ficha no
 * pueda quedarse fuera de la edición sin que nadie lo note.
 */
export const ActualizarExpediente = CrearExpediente.extend({
  id: z.string().uuid(),
});

/** Borrado de expediente: solo el id. */
export const EliminarExpediente = z.object({ id: z.string().uuid() });

export type CrearExpedienteInput = z.infer<typeof CrearExpediente>;
export type ActualizarExpedienteInput = z.infer<typeof ActualizarExpediente>;
