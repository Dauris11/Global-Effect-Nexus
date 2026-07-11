/**
 * Integraciones salientes vía webhook de n8n (CRM GENIALiA, notificaciones).
 * Best-effort: nunca lanza; devuelve si el disparo tuvo éxito. Solo servidor.
 */
const webhookUrl = process.env.N8N_WEBHOOK_URL;

export async function dispararWebhook(
  evento: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  if (!webhookUrl) return false;
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evento, payload, ts: new Date().toISOString() }),
    });
    return res.ok;
  } catch (e) {
    console.error("[n8n] webhook falló:", (e as Error).message);
    return false;
  }
}
