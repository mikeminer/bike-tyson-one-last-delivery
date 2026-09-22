import { Authentication, MINT, PROGRAM, readAccess } from './access.mjs';
export function createApi(origin) {
const auth = new Authentication(), rate = new Map();
function send(res, status, value) { res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(value)); }
async function body(req) {
  if(req.body!==undefined){const value=typeof req.body==='string'?req.body:JSON.stringify(req.body);if(Buffer.byteLength(value)>8192)throw Error('Request too large.');return JSON.parse(value);}
  let data = ''; for await (const part of req) { data += part; if (data.length > 8192) throw Error('Request too large.'); } return JSON.parse(data || '{}');
}
function cookie(req) { return /(?:^|;\s*)bt_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1]; }
function sessionCookie(token, age = 900) { return `bt_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${origin.startsWith('https:') ? '; Secure' : ''}`; }
return async (req,res)=>{
const url=new URL(req.url||'/',origin);
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
};
}
