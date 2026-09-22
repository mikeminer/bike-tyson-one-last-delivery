import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApi } from './api.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const production = process.argv.includes('--production'), port = Number(process.env.PORT || 4173);
const origin = process.env.APP_ORIGIN || `http://localhost:${port}`;
const api = createApi(origin);
const vite = production ? null : await (await import('vite')).createServer({ root, server: { middlewareMode: true }, appType: 'spa' });
http.createServer(async (req, res) => {
  res.setHeader('x-content-type-options', 'nosniff'); res.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
  const url = new URL(req.url || '/', origin);
  if (url.pathname.startsWith('/api/')) return api(req,res);
  if (vite) return vite.middlewares(req, res);
  try {
    const requested = path.resolve(root, 'dist', '.' + decodeURIComponent(url.pathname));
    const base = path.join(root, 'dist'); if (requested !== base && !requested.startsWith(base + path.sep)) { res.writeHead(403); return res.end(); }
    let target = requested; try { if (!(await stat(target)).isFile()) target = path.join(base, 'index.html'); } catch { target = path.join(base, 'index.html'); }
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png':'image/png', '.webm':'video/webm', '.ttf':'font/ttf', '.wav':'audio/wav' };
    res.setHeader('content-type', types[path.extname(target)] || 'application/octet-stream'); res.end(await readFile(target));
  } catch { res.writeHead(500); res.end('Build unavailable. Run npm run build.'); }
}).listen(port, '0.0.0.0', () => console.log(`BIKE TYSON ready at ${origin}`));
