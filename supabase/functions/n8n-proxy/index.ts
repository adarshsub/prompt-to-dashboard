import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// NOTE: Keep this configurable at the top for quick edits
const N8N_WEBHOOK_URL = "https://adarshsub.app.n8n.cloud/webhook/471937b8-6427-48cc-a322-f6e0aff58d8a";

type AnyJson = Record<string, unknown> | unknown[] | string | number | boolean | null;

function isNonEmpty(data: AnyJson): boolean {
  if (data === null || data === undefined) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data === 'object') return Object.keys(data as Record<string, unknown>).length > 0;
  if (typeof data === 'string') return data.trim().length > 0;
  return true;
}

async function parseResponse(res: Response): Promise<AnyJson> {
  const contentType = res.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { text };
    }
  } catch (e) {
    console.error('Failed to parse n8n response:', e);
    return null;
  }
}

async function tryN8n(question: string): Promise<{ data: AnyJson; attempted: string[] }> {
  const attempted: string[] = [];

  // 1) POST JSON
  try {
    attempted.push('POST json');
    const r1 = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    console.log('n8n POST json status:', r1.status);
    if (r1.ok) {
      const d1 = await parseResponse(r1);
      console.log('n8n POST json parsed:', JSON.stringify(d1)?.slice(0, 500));
      if (isNonEmpty(d1)) return { data: d1, attempted };
    }
  } catch (e) {
    console.warn('n8n POST json failed:', e);
  }

  // 2) POST form-urlencoded
  try {
    attempted.push('POST form');
    const r2 = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ question }).toString(),
    });
    console.log('n8n POST form status:', r2.status);
    if (r2.ok) {
      const d2 = await parseResponse(r2);
      console.log('n8n POST form parsed:', JSON.stringify(d2)?.slice(0, 500));
      if (isNonEmpty(d2)) return { data: d2, attempted };
    }
  } catch (e) {
    console.warn('n8n POST form failed:', e);
  }

  // 3) GET with query param
  try {
    attempted.push('GET query');
    const url = `${N8N_WEBHOOK_URL}?${new URLSearchParams({ question }).toString()}`;
    const r3 = await fetch(url, { method: 'GET' });
    console.log('n8n GET status:', r3.status);
    if (r3.ok) {
      const d3 = await parseResponse(r3);
      console.log('n8n GET parsed:', JSON.stringify(d3)?.slice(0, 500));
      if (isNonEmpty(d3)) return { data: d3, attempted };
    }
  } catch (e) {
    console.warn('n8n GET failed:', e);
  }

  return { data: [], attempted };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, insights } = await req.json();
    console.log("n8n-proxy received:", { question, insights });

    // Post insights back to n8n
    if (insights) {
      console.log('Posting insights to n8n');
      try {
        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ insights }),
        });
        if (!n8nResponse.ok) {
          console.warn('n8n insights post failed:', n8nResponse.status);
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error posting insights to n8n:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to post insights' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Send question to n8n using robust fallbacks
    if (question) {
      const { data, attempted } = await tryN8n(question);
      console.log('n8n attempted methods:', attempted.join(' -> '));

      // Always return whatever we got (even empty) - frontend will parse flexibly
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Missing question or insights parameter' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error in n8n-proxy:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

