import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const N8N_WEBHOOK_URL = "https://adarshsub.app.n8n.cloud/webhook/471937b8-6427-48cc-a322-f6e0aff58d8a";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, insights } = await req.json();
    console.log("n8n-proxy received:", { question, insights });

    // If posting insights back to n8n
    if (insights) {
      console.log("Posting insights to n8n");
      try {
        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ insights }),
        });

        if (!n8nResponse.ok) {
          console.warn("n8n insights post failed:", n8nResponse.status);
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error posting insights to n8n:", error);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to post insights" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // If sending question to n8n
    if (question) {
      console.log("Sending question to n8n:", question);
      
      try {
        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });

        console.log("n8n response status:", n8nResponse.status);

        if (!n8nResponse.ok) {
          const errorText = await n8nResponse.text();
          console.error("n8n returned error:", errorText);
          throw new Error(`n8n webhook failed with status ${n8nResponse.status}`);
        }

        const data = await n8nResponse.json();
        console.log("n8n returned raw data:", JSON.stringify(data, null, 2));

        // Return the raw data from n8n - let the frontend extract charts and insights
        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error calling n8n:", error);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ error: "Missing question or insights parameter" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in n8n-proxy:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
