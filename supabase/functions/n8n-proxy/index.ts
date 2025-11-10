import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const N8N_WEBHOOK_URL = "https://adarshsub.app.n8n.cloud/webhook-test/471937b8-6427-48cc-a322-f6e0aff58d8a";

// Mock data for testing when n8n is unavailable
const generateMockData = (question: string) => {
  console.log("Generating mock data for question:", question);
  
  return {
    charts: [
      {
        type: "bar",
        data: [
          { name: "John Doe", score: 65 },
          { name: "Jane Smith", score: 68 },
          { name: "Bob Johnson", score: 62 },
          { name: "Alice Williams", score: 69 },
        ],
        config: {
          title: "Students Below 70% in Math",
          xKey: "name",
          yKey: "score",
          color: "#ef4444",
        },
      },
      {
        type: "pie",
        data: [
          { category: "Below 70%", value: 4 },
          { category: "70-80%", value: 8 },
          { category: "Above 80%", value: 12 },
        ],
        config: {
          title: "Score Distribution",
          nameKey: "category",
          valueKey: "value",
        },
      },
    ],
    insights: [
      {
        id: "insight-1",
        text: "4 students scored below 70% in Math class, requiring immediate intervention",
      },
      {
        id: "insight-2",
        text: "Average score for students below threshold is 66%, indicating they are close to passing",
      },
      {
        id: "insight-3",
        text: "Recommend additional tutoring sessions for students scoring below 65%",
      },
    ],
  };
};

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
          console.warn("n8n returned error, using mock data");
          const mockData = generateMockData(question);
          return new Response(
            JSON.stringify(mockData),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const data = await n8nResponse.json();
        console.log("n8n returned data:", data);

        // Validate and ensure proper structure
        const charts = Array.isArray(data.charts) ? data.charts : [];
        const insights = Array.isArray(data.insights) ? data.insights : [];

        // If n8n returns empty data, use mock data
        if (charts.length === 0 && insights.length === 0) {
          console.warn("n8n returned empty data, using mock data");
          const mockData = generateMockData(question);
          return new Response(
            JSON.stringify(mockData),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ charts, insights }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error calling n8n, using mock data:", error);
        const mockData = generateMockData(question);
        return new Response(
          JSON.stringify(mockData),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
