import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Connect } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/generate': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: (proxy, options) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          proxy.on('proxyReq', (proxyReq: any, req: IncomingMessage & { body?: any }, res: ServerResponse) => {
            if (req.body) {
              const bodyData = JSON.stringify(req.body);
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
              proxyReq.write(bodyData);
            }
          });
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    {
      name: 'api-handler',
      configureServer(server: ViteDevServer) {
        server.middlewares.use('/api/generate', async (req: Connect.IncomingMessage, res: ServerResponse) => {
          if (req.method === 'POST') {
            try {
              const chunks: Buffer[] = [];
              for await (const chunk of req) {
                chunks.push(chunk);
              }
              const data = JSON.parse(Buffer.concat(chunks).toString());
              
              // Import the POST handler from your generate.ts
              const { POST } = await import('./src/api/generate');
              
              const response = await POST(new Request('http://localhost:8080/api/generate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify(data)
              }));

              // Handle streaming response
              res.setHeader('Content-Type', 'text/event-stream');
              res.setHeader('Cache-Control', 'no-cache');
              res.setHeader('Connection', 'keep-alive');

              if (response.body) {
                const reader = response.body.getReader();
                try {
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    res.write(value);
                  }
                } finally {
                  reader.releaseLock();
                }
              }
              res.end();
            } catch (error) {
              console.error('API error:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Internal server error' }));
            }
          } else {
            res.statusCode = 405;
            res.end('Method not allowed');
          }
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
