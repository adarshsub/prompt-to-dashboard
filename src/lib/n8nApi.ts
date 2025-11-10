const N8N_WEBHOOK_URL = "https://adarshsub.app.n8n.cloud/webhook-test/471937b8-6427-48cc-a322-f6e0aff58d8a";

export async function sendToN8N(question: string) {
  try {
    console.log("Sending question to n8n:", question);
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    console.log("n8n response status:", response.status);

    if (!response.ok) {
      throw new Error(`N8N webhook failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("n8n response data:", data);

    // Validate response structure
    if (!data) {
      console.warn("n8n returned empty response");
      return { charts: [], insights: [] };
    }

    // Ensure charts and insights arrays exist
    const charts = Array.isArray(data.charts) ? data.charts : [];
    const insights = Array.isArray(data.insights) ? data.insights : [];

    console.log("Parsed charts:", charts.length, "insights:", insights.length);

    return { charts, insights };
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
