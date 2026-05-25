export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  const configured = !!(process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY);

  return new Response(JSON.stringify({ configured }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
      'Access-Control-Allow-Origin': allowedOrigin,
    },
  });
}
