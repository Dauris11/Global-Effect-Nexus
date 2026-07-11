/**
 * Envío de correos con Resend. Best-effort: si falta la API key o falla el
 * envío, se registra y se continúa (no debe romper la acción de negocio).
 * Solo servidor.
 */
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM ?? "Global Effect <noreply@globaleffect.org>";

const resend = apiKey ? new Resend(apiKey) : null;

export async function enviarCorreo(opts: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY ausente; correo omitido:", opts.subject);
    return false;
  }
  try {
    await resend.emails.send({ from, to: opts.to, subject: opts.subject, html: opts.html });
    return true;
  } catch (e) {
    console.error("[email] error al enviar:", (e as Error).message);
    return false;
  }
}
