const N8N_PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/n8n-proxy`;

export async function sendToN8N(question: string) {
  try {
    console.log("Sending question via edge function proxy:", question);
    
    const response = await fetch(N8N_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    console.log("Proxy response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Proxy error:", errorText);
      throw new Error(`Edge function failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Proxy response data:", data);

    return data;
  } catch (error) {
    console.error("Error calling edge function proxy:", error);
    throw error;
  }
}

export async function postInsightsToN8N(insights: any[]) {
  try {
    console.log("Posting insights via edge function proxy");
    
    const response = await fetch(N8N_PROXY_URL, {
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
    // Don't throw - insights posting is non-critical
    return { success: false };
  }
}
