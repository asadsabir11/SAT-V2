export async function sendToN8n(webhookUrl: string | undefined, payload: unknown) {
  if (!webhookUrl) {
    console.log("n8n webhook not configured. Mock payload:", payload);
    return { ok: true, mocked: true };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const secret = process.env.N8N_WEBHOOK_SECRET;
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "X-Webhook-Secret": secret } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`n8n webhook failed: ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}
