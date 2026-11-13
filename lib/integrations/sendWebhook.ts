// lib/integrations/sendWebhook.ts

export async function sendWebhook(
  url: string | undefined,
  event: string,
  data: Record<string, unknown>
) {
  // No URL set → n8n is not configured, skip silently
  if (!url) return;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data, sentAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(5000), // give up after 5 seconds
    });

    if (!res.ok) {
      console.error(`Webhook ${event} failed: HTTP ${res.status}`);
    }
  } catch (err) {
    // n8n is down, slow or unreachable: log it, never break the chat
    console.error(`Webhook ${event} failed:`, err);
  }
}