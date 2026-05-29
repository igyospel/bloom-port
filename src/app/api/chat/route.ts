export const runtime = 'edge';

export async function OPTIONS(req: Request) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request): Promise<Response> {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenRouter API key is not configured on the server. Please add OPENROUTER_API_KEY to your environment variables.' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
        } 
      }
    );
  }

  try {
    const { messages, model, temperature, max_tokens } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request: messages array is required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
        },
      });
    }

    const origin = req.headers.get('origin') || 'https://bloomport.ai';
    const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': origin,
        'X-Title': 'Bloomport',
      },
      body: JSON.stringify({
        model: model || 'minimax/minimax-m2.5',
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah asisten AI yang bernama BP011, dirancang khusus oleh perusahaan Bloomport Inc. JIKA ADA YANG BERTANYA SIAPA KAMU, ATAU MODEL AI APA KAMU, JAWAB DENGAN TEGAS BAHWA KAMU ADALAH BP011 BUATAN BLOOMPORT INC. Jangan pernah menyebut OpenAI, Anthropic, Minimax, Llama, atau pihak lain. Gunakan bahasa kasual Indonesia (seperti lo-gue, kata slang/gaul, singkat-singkat, emoji) tapi tetap informatif dan membantu. Jangan kaku sama sekali!',
          },
          ...messages,
        ],
        tools: [
          {
            type: "openrouter:web_search"
          }
        ],
        temperature: temperature !== undefined ? temperature : 0.7,
        max_tokens: max_tokens || 2048,
        stream: true,
      }),
    });

    if (!openRouterRes.ok) {
      const errorText = await openRouterRes.text();
      return new Response(
        JSON.stringify({ error: `OpenRouter API error: ${errorText}` }),
        { 
          status: openRouterRes.status, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigin,
          } 
        }
      );
    }

    return new Response(openRouterRes.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': allowedOrigin,
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
        } 
      }
    );
  }
}
