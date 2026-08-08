/**
 * Server Actions del dominio Psicología. Citas y notas exigen
 * `psicologia.escribir`. La solicitud de cita por el estudiante crea un
 * registro `programada` sin exponer datos confidenciales.
 */
"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { enviarCorreo } from "@/lib/email";
import {
  AsignarPsicologo,
  CambiarEstadoCita,
  CrearCita,
  CrearNota,
  SolicitarCita,
} from "./schema";

export async function crearCita(input: unknown): Promise<string> {
  const user = await requirePermission("psicologia.escribir");
  const d = CrearCita.parse(input);
  const { rows } = await query(
    `INSERT INTO cita_psicologia (estudiante_id, psicologo_id, tipo_registro, fecha,
                                  hora, nivel_confidencialidad, riesgos)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      d.estudiante_id,
      user.id,
      d.tipo_registro,
      d.fecha,
      d.hora || null,
      d.nivel_confidencialidad,
      d.riesgos || null,
    ],
  );
  revalidatePath("/psicologia");
  return rows[0].id as string;
}

export async function crearNota(input: unknown): Promise<string> {
  const user = await requirePermission("psicologia.escribir");
  const d = CrearNota.parse(input);
  const { rows } = await query(
    `INSERT INTO nota_psicologica (cita_id, estudiante_id, contenido, creado_por_id)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [d.cita_id || null, d.estudiante_id, d.contenido, user.id],
  );
  revalidatePath("/psicologia");
  return rows[0].id as string;
}

/**
 * Agenda una cita solicitada por el propio estudiante (solo sesión).
 *
 * El expediente sale de la sesión, nunca del formulario: antes llegaba como
 * `estudiante_id` y cualquiera con sesión podía agendar a nombre de otro joven.
 *
 * La cita se asigna al psicólogo de cabecera (migración 0021) y se le avisa por
 * correo y por notificación interna. Si el joven aún no tiene psicólogo, la
 * cita se crea igual sin asignar —perderla sería peor— y el aviso va a todo el
 * equipo de psicología para que alguien la tome.
 */
export async function solicitarCita(input: unknown): Promise<string> {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");
  const d = SolicitarCita.parse(input);

  const { rows: expediente } = await query(
    `SELECT id, nombre, psicologo_id FROM estudiante WHERE usuario_id = $1 LIMIT 1`,
    [user.id],
  );
  const estudiante = expediente[0] as
    | { id: string; nombre: string; psicologo_id: string | null }
    | undefined;
  if (!estudiante) throw new Error("Tu usuario no está enlazado a un expediente");

  const { rows } = await query(
    `INSERT INTO cita_psicologia
       (estudiante_id, psicologo_id, tipo_registro, fecha, hora, estado,
        solicitada_por_estudiante, motivo_estudiante)
     VALUES ($1, $2, 'cita', $3, $4, 'programada', TRUE, $5)
     RETURNING id`,
    [estudiante.id, estudiante.psicologo_id, d.fecha, d.hora || null, d.motivo || null],
  );
  const citaId = rows[0].id as string;

  // El aviso no puede tumbar la solicitud: la cita ya está guardada y es lo que
  // importa. Un fallo de Resend o de la BD de notificaciones se registra y ya.
  await avisarSolicitud({
    citaId,
    psicologoId: estudiante.psicologo_id,
    estudianteNombre: estudiante.nombre,
    fecha: d.fecha,
    hora: d.hora || null,
    motivo: d.motivo || null,
  }).catch((e) => {
    console.error("[psicologia] no se pudo avisar de la cita:", (e as Error).message);
  });

  revalidatePath("/cita-psicologia");
  revalidatePath("/psicologia");
  return citaId;
}

/**
 * Avisa de una cita solicitada: correo + notificación interna.
 *
 * Destinatarios: el psicólogo de cabecera si lo hay; si no, todo el equipo de
 * psicología, porque una solicitud sin dueño que nadie ve es una solicitud
 * perdida.
 *
 * El correo NO lleva el motivo que escribió el joven. Lo que cuenta al pedir
 * una cita de psicología es material sensible y el correo sale de nuestra
 * infraestructura hacia una bandeja que no controlamos; el aviso dice que hay
 * una cita y dónde verla, y el motivo se lee dentro de la plataforma.
 */
async function avisarSolicitud(datos: {
  citaId: string;
  psicologoId: string | null;
  estudianteNombre: string;
  fecha: string;
  hora: string | null;
  motivo: string | null;
}): Promise<void> {
  const { rows } = datos.psicologoId
    ? await query(`SELECT id, nombre, email FROM usuario WHERE id = $1 AND activo = TRUE`, [
        datos.psicologoId,
      ])
    : await query(
        `SELECT u.id, u.nombre, u.email
           FROM usuario u JOIN rol r ON r.id = u.rol_id
          WHERE r.nombre = 'psicologo' AND u.activo = TRUE`,
      );

  const destinatarios = rows as { id: string; nombre: string; email: string }[];
  if (destinatarios.length === 0) return;

  const cuando = datos.hora ? `${datos.fecha} a las ${datos.hora}` : datos.fecha;
  const sinAsignar = datos.psicologoId === null;

  const titulo = sinAsignar
    ? "Cita de psicología sin asignar"
    : "Nueva cita de psicología";
  const mensaje = sinAsignar
    ? `${datos.estudianteNombre} pidió una cita para el ${cuando} y no tiene psicólogo asignado.`
    : `${datos.estudianteNombre} pidió una cita para el ${cuando}.`;

  await Promise.all([
    query(
      `INSERT INTO notificacion (usuario_id, titulo, mensaje, tipo, enlace)
       SELECT id, $2, $3, $4, $5 FROM unnest($1::uuid[]) AS id`,
      [
        destinatarios.map((d) => d.id),
        titulo,
        mensaje,
        sinAsignar ? "alerta" : "info",
        "/psicologia",
      ],
    ),
    enviarCorreo({
      to: destinatarios.map((d) => d.email),
      subject: titulo,
      html: `<p>${mensaje}</p>
             <p>Entra a la plataforma para confirmarla y ver el detalle:
                <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/es/psicologia">Módulo de Psicología</a>.</p>
             <p style="color:#64748b;font-size:12px">Este aviso no incluye información confidencial del estudiante.</p>`,
    }),
  ]);
}

/**
 * Cierra o cancela una cita — ClickUp: botones "Completar" / "Cancelar".
 *
 * Solo se mueve desde `programada`: el `WHERE estado = 'programada'` evita que
 * dos personas mirando la misma rejilla cierren la cita dos veces, o que una
 * cancele lo que la otra acaba de completar. Si no cambió ninguna fila es que
 * alguien llegó antes, y eso se dice en vez de fingir que salió bien.
 *
 * Al cancelar se avisa al estudiante por notificación interna. Es la única
 * transición que le afecta sin que él la haya pedido: enterarse el día de la
 * cita de que no había cita es exactamente el fallo que esto evita.
 */
export async function cambiarEstadoCita(input: unknown): Promise<void> {
  await requirePermission("psicologia.escribir");
  const d = CambiarEstadoCita.parse(input);

  const { rows } = await query(
    `UPDATE cita_psicologia
        SET estado = $2
      WHERE id = $1 AND estado = 'programada'
      RETURNING estudiante_id, to_char(fecha, 'YYYY-MM-DD') AS fecha, hora`,
    [d.id, d.estado],
  );

  if (rows.length === 0) {
    throw new Error("Esa cita ya no estaba programada. Recarga para ver su estado.");
  }

  if (d.estado === "cancelada") {
    const cita = rows[0] as { estudiante_id: string; fecha: string; hora: string | null };
    // Best-effort, como el aviso al psicólogo: la cancelación ya está guardada
    // y es lo que importa. El aviso que falla se registra y no revienta nada.
    await query(
      `INSERT INTO notificacion (usuario_id, titulo, mensaje, tipo, enlace)
       SELECT usuario_id, $2, $3, 'alerta', $4
         FROM estudiante WHERE id = $1 AND usuario_id IS NOT NULL`,
      [
        cita.estudiante_id,
        "Tu cita de psicología se canceló",
        `La cita del ${cita.fecha}${cita.hora ? ` a las ${cita.hora}` : ""} quedó cancelada. Puedes pedir otra desde tu portal.`,
        "/cita-psicologia",
      ],
    ).catch((e) => {
      console.error("[psicologia] no se pudo avisar al estudiante:", (e as Error).message);
    });
  }

  revalidatePath("/psicologia");
  revalidatePath("/portal/psicologia");
  revalidatePath("/cita-psicologia");
}

/** Asigna (o desasigna con `null`) el psicólogo de cabecera de un estudiante. */
export async function asignarPsicologo(input: unknown): Promise<void> {
  await requirePermission("psicologia.escribir");
  const d = AsignarPsicologo.parse(input);
  await query(`UPDATE estudiante SET psicologo_id = $2 WHERE id = $1`, [
    d.estudiante_id,
    d.psicologo_id,
  ]);
  revalidatePath(`/expedientes/${d.estudiante_id}`);
  revalidatePath("/psicologia");
}
