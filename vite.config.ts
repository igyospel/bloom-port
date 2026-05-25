import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import dotenv from 'dotenv';

// Load local environment variables from .env
dotenv.config();

const localApiPlugin = () => ({
  name: 'local-api-plugin',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      // 1. Handle config check API locally
      if (req.url?.startsWith('/api/config')) {
        const configured = !!(process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ configured }));
        return;
      }
      
      // 2. Handle chat streaming API locally
      if (req.url?.startsWith('/api/chat')) {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'OpenRouter API key is not configured locally. Please add OPENROUTER_API_KEY to your .env file.' }));
          return;
        }

        // Buffer the POST request body
        let body = '';
        req.on('data', (chunk: string) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const { messages } = JSON.parse(body);

            // Fetch stream from OpenRouter using global fetch
            const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Bloomport Local',
              },
              body: JSON.stringify({
                model: 'minimax/minimax-m2.5',
                messages: [
                  {
                    role: 'system',
                    content: 'Kamu adalah asisten AI dari Bloomport yang super gaul, santai, dan asik. Gunakan bahasa kasual Indonesia (seperti lo-gue, kata slang/gaul, singkat-singkat, emoji) tapi tetap informatif dan membantu. Jangan kaku sama sekali!',
                  },
                  ...messages,
                ],
                max_tokens: 2048,
                stream: true,
              }),
            });

            if (!openRouterRes.ok) {
              const errorText = await openRouterRes.text();
              res.statusCode = openRouterRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `OpenRouter API error: ${errorText}` }));
              return;
            }

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // Pipe the ReadableStream to res
            if (openRouterRes.body) {
              const reader = (openRouterRes.body as any).getReader 
                ? (openRouterRes.body as any).getReader() 
                : null;

              if (reader) {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  res.write(value);
                }
              } else {
                for await (const chunk of openRouterRes.body as any) {
                  res.write(chunk);
                }
              }
            }
            res.end();
          } catch (error: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'Internal server error during local API emulation' }));
          }
        });
        return;
      }

      next();
    });
  }
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
