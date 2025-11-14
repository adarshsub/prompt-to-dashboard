import { supabase } from "@/integrations/supabase/client";

export async function sendToN8N(question: string) {
  try {
    console.log("Sending question to backend proxy:", question);
    const { data, error } = await supabase.functions.invoke('n8n-proxy', {
      body: { question },
    });

    if (error) {
      console.error("n8n-proxy error:", error);
      throw new Error(`n8n-proxy failed: ${error.message}`);
    }

    console.log("n8n-proxy response data:", data);
    return data as any;
  } catch (error) {
    console.error("Error calling n8n-proxy:", error);
    throw error;
  }
}

export async function postInsightsToN8N(insights: any[]) {
  try {
    console.log("Posting insights to backend proxy");
    const { data, error } = await supabase.functions.invoke('n8n-proxy', {
      body: { insights },
    });

    if (error) {
      console.warn("Insights post to proxy failed:", error);
      return { success: false } as any;
    }

    return data as any;
  } catch (error) {
    console.error("Error posting insights via proxy:", error);
    return { success: false } as any;
  }
}
