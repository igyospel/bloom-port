export const runtime = 'edge';

export async function OPTIONS(req: Request) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(req: Request): Promise<Response> {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing query parameter q' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
      },
    });
  }

  try {
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Search request failed: ${res.statusText}` }), {
        status: res.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
        },
      });
    }

    const html = await res.text();
    const results: Array<{ url: string; title: string; snippet: string }> = [];
    const resultBlocks = html.split(/class="[^"]*result__body[^"]*"/);

    for (let i = 1; i < resultBlocks.length; i++) {
      const block = resultBlocks[i];
      const aTagMatch = block.match(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
      const snippetMatch = block.match(/class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/);

      if (aTagMatch) {
        const rawUrl = aTagMatch[1];
        let targetUrl = rawUrl;
        if (rawUrl.includes('uddg=')) {
          const parts = rawUrl.split('uddg=');
          if (parts[1]) {
            targetUrl = decodeURIComponent(parts[1].split('&')[0]);
          }
        }

        const title = aTagMatch[2].replace(/<[^>]*>/g, '').trim();
        const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, '').trim() : '';

        // Skip ads
        if (rawUrl.includes('ad_provider') || rawUrl.includes('duckduckgo.com/y.js')) {
          continue;
        }

        results.push({ url: targetUrl, title, snippet });
      }
    }

    return new Response(JSON.stringify({ results: results.slice(0, 10) }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        'Access-Control-Allow-Origin': allowedOrigin,
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
      },
    });
  }
}
