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

