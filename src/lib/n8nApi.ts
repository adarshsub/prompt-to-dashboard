const N8N_WEBHOOK_URL = "https://adarshsub.app.n8n.cloud/webhook-test/471937b8-6427-48cc-a322-f6e0aff58d8a";

export async function sendToN8N(question: string) {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`N8N webhook failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling n8n webhook:", error);
    throw error;
  }
}

export async function postInsightsToN8N(insights: any[]) {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ insights }),
    });

    if (!response.ok) {
      throw new Error(`N8N webhook failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error posting insights to n8n:", error);
    throw error;
  }
}
