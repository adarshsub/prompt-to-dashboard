const N8N_WEBHOOK_URL = "https://adarshsub.app.n8n.cloud/webhook/471937b8-6427-48cc-a322-f6e0aff58d8a";

export async function sendToN8N(question: string) {
  try {
    console.log("Sending question to n8n webhook:", question);
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    console.log("n8n response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("n8n error:", errorText);
      throw new Error(`n8n webhook failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("n8n response data:", data);

    return data;
  } catch (error) {
    console.error("Error calling n8n webhook:", error);
    throw error;
  }
}

export async function postInsightsToN8N(insights: any[]) {
  try {
    console.log("Posting insights to n8n webhook");
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ insights }),
    });

    if (!response.ok) {
      console.warn("Insights post failed:", response.status);
    }

    return await response.json();
  } catch (error) {
    console.error("Error posting insights:", error);
    return { success: false };
  }
}
