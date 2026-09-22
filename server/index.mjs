import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Authentication, MINT, PROGRAM, readAccess } from './access.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const production = process.argv.includes('--production'), port = Number(process.env.PORT || 4173);
const origin = process.env.APP_ORIGIN || `http://localhost:${port}`;
const auth = new Authentication(), rate = new Map();
const vite = production ? null : await (await import('vite')).createServer({ root, server: { middlewareMode: true }, appType: 'spa' });
function send(res, status, value) { res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(value)); }
async function body(req) {
  let data = ''; for await (const part of req) { data += part; if (data.length > 8192) throw Error('Request too large.'); } return JSON.parse(data || '{}');
}
function cookie(req) { return /(?:^|;\s*)bt_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1]; }
function sessionCookie(token, age = 900) { return `bt_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${origin.startsWith('https:') ? '; Secure' : ''}`; }
http.createServer(async (req, res) => {
  res.setHeader('x-content-type-options', 'nosniff'); res.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
  const url = new URL(req.url || '/', origin);
  if (url.pathname.startsWith('/api/')) {
    const now = Date.now(), key = req.socket.remoteAddress;
    for (const [ip, value] of rate) if (value.until < now) rate.delete(ip);
    const budget = rate.get(key) || { count: 0, until: now + 60000 }; budget.count++; rate.set(key, budget);
    if (budget.count > 90) { res.setHeader('retry-after', '60'); return send(res, 429, { error: 'Too many requests. Wait one minute.' }); }
    if (req.headers.origin && req.headers.origin !== origin) return send(res, 403, { error: 'Origin not allowed.' });
    if (req.method === 'POST' && (req.headers.origin !== origin || !req.headers['content-type']?.startsWith('application/json'))) return send(res, 403, { error: 'Request not allowed.' });
    try {
      if (url.pathname === '/api/config' && req.method === 'GET') return send(res, 200, { mint: MINT, program: PROGRAM, minimumTokens: '1000', minimumRaw: '1000000000', decimals: 6, aggregation: 'sum', minOriginalSeconds: 0, minRemainingSeconds: 0, routeVerified: false, network: 'mainnet-beta' });
      if (url.pathname === '/api/auth/challenge' && req.method === 'POST') { const data = await body(req); return send(res, 200, auth.challenge(data.wallet, origin)); }
      if (url.pathname === '/api/auth/verify' && req.method === 'POST') { const data = await body(req); const token = auth.authenticate(data.nonce, data.wallet, data.signature, origin); res.setHeader('set-cookie', sessionCookie(token)); return send(res, 200, { authenticated: true, wallet: data.wallet }); }
      if (url.pathname === '/api/auth/logout' && req.method === 'POST') { auth.sessions.delete(cookie(req)); res.setHeader('set-cookie', sessionCookie('', 0)); return send(res, 200, { authenticated: false }); }
      if (url.pathname === '/api/access' && req.method === 'GET') {
        const session = auth.session(cookie(req)); if (!session) return send(res, 401, { error: 'Sign in with your wallet to check locks.' });
        try { return send(res, 200, await readAccess(session.wallet)); } catch (error) { return send(res, 503, { error: error.message, eligible: false, status: 'unavailable' }); }
      }
      return send(res, 404, { error: 'Endpoint unavailable.' });
    } catch (error) { return send(res, 400, { error: error.message || 'Invalid request.' }); }
  }
  if (vite) return vite.middlewares(req, res);
  try {
    const requested = path.resolve(root, 'dist', '.' + decodeURIComponent(url.pathname));
    const base = path.join(root, 'dist'); if (requested !== base && !requested.startsWith(base + path.sep)) { res.writeHead(403); return res.end(); }
    let target = requested; try { if (!(await stat(target)).isFile()) target = path.join(base, 'index.html'); } catch { target = path.join(base, 'index.html'); }
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
    res.setHeader('content-type', types[path.extname(target)] || 'application/octet-stream'); res.end(await readFile(target));
  } catch { res.writeHead(500); res.end('Build unavailable. Run npm run build.'); }
}).listen(port, '0.0.0.0', () => console.log(`BIKE TYSON ready at ${origin}`));
