import { randomBytes, createPublicKey, verify } from 'node:crypto';
import bs58 from 'bs58';
import { evaluateTimelocks } from '../src/timelock-gate.mjs';
export const MINT = 'CbyTNf7UPzvewHh4Zp6umogM2RWahhmGRJWLJnPwpump';
export const PROGRAM = '9RY54dNPYTzDyh3TfFqDdt2b2KMM56KW1tw9erRTGQo6';
export const TOKEN2022 = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
export const MINIMUM_RAW = 1000000000n;
export const POLICY = { mint: MINT, minimumRaw: MINIMUM_RAW, minOriginalSeconds: 0, minRemainingSeconds: 0, aggregation: 'sum', maxAgeSeconds: 30 };
export function validWallet(value) { try { return typeof value === 'string' && value.length <= 44 && bs58.decode(value).length === 32; } catch { return false; } }
export class Authentication {
  nonces = new Map(); sessions = new Map();
  clean(now = Date.now()) {
    for (const [key, value] of this.nonces) if (value.expiry <= now) this.nonces.delete(key);
    for (const [key, value] of this.sessions) if (value.expiry <= now) this.sessions.delete(key);
  }
  challenge(wallet, origin, now = Date.now()) {
    this.clean(now); if (!validWallet(wallet)) throw Error('Invalid wallet.');
    if (this.nonces.size >= 1000) throw Error('Too many requests. Try again later.');
    const nonce = randomBytes(24).toString('hex'), expiry = now + 120000;
    const message = `${new URL(origin).host} wants you to sign in with your Solana account:\n${wallet}\n\nSign in to BIKE TYSON to check delivery-pass access. No transaction or token approval.\n\nURI: ${origin}\nVersion: 1\nChain ID: solana:mainnet\nNonce: ${nonce}\nIssued At: ${new Date(now).toISOString()}\nExpiration Time: ${new Date(expiry).toISOString()}\nAction: delivery-pass`;
    this.nonces.set(nonce, { wallet, origin, message, expiry }); return { nonce, message, expiry };
  }
  authenticate(nonce, wallet, signature, origin, now = Date.now()) {
    const challenge = this.nonces.get(nonce); this.nonces.delete(nonce);
    if (!challenge || challenge.expiry <= now || challenge.wallet !== wallet || challenge.origin !== origin) throw Error('Sign-in request expired or invalid.');
    const bytes = Buffer.from(signature, 'base64');
    if (bytes.length !== 64) throw Error('Invalid signature.');
    const key = createPublicKey({ key: Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), Buffer.from(bs58.decode(wallet))]), format: 'der', type: 'spki' });
    if (!verify(null, Buffer.from(challenge.message), key, bytes)) throw Error('Invalid signature.');
    this.clean(now); if (this.sessions.size >= 1000) throw Error('Too many sessions.');
    const token = randomBytes(32).toString('hex'); this.sessions.set(token, { wallet, expiry: now + 15 * 60000 });
    return token;
  }
  session(token, now = Date.now()) { const value = this.sessions.get(token); if (!value || value.expiry <= now) { this.sessions.delete(token); return null; } return value; }
}
export function decodeLock(address, account, wallet) {
  if (account.owner !== PROGRAM || account.executable || account.data?.[1] !== 'base64') throw Error('Invalid DevFridge account owner.');
  const bytes = Buffer.from(account.data[0], 'base64');
  if (bytes.length !== 105 || !bytes.subarray(0, 8).equals(Buffer.from([8, 255, 36, 202, 210, 22, 57, 137]))) throw Error('Unrecognized lock schema.');
  const depositor = bs58.encode(bytes.subarray(8, 40)), mint = bs58.encode(bytes.subarray(40, 72));
  if (depositor !== wallet || mint !== MINT) throw Error('Mint or depositor mismatch.');
  return { address, depositor, mint, amount: bytes.readBigUInt64LE(72).toString(), createdAt: Number(bytes.readBigInt64LE(80)), unlockAt: Number(bytes.readBigInt64LE(88)), lockId: bytes.readBigUInt64LE(97).toString() };
}
export async function rpc(method, params) {
  const response = await fetch(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw Error(response.status === 429 ? 'RPC busy (429): try again in 30 seconds.' : 'RPC unavailable. Please try again.');
  const payload = await response.json(); if (payload.error || !payload.result) throw Error('The RPC service did not return verifiable data.'); return payload.result;
}
export function verifyMint(account) {
  const info = account?.data?.parsed?.info;
  if (account?.owner !== TOKEN2022 || account?.data?.parsed?.type !== 'mint' || !info?.isInitialized || info.decimals !== 6) throw Error('Mint compatibility not verified.');
  if ((info.extensions || []).some(e => !['metadataPointer', 'tokenMetadata'].includes(e.extension))) throw Error('Token extensions require review before access.');
  return info;
}
export async function readAccess(wallet, rpcCall = rpc) {
  if (!validWallet(wallet)) throw Error('Invalid wallet.');
  const [mint, accounts] = await Promise.all([
    rpcCall('getAccountInfo', [MINT, { encoding: 'jsonParsed', commitment: 'confirmed' }]),
    rpcCall('getProgramAccounts', [PROGRAM, { withContext: true, encoding: 'base64', commitment: 'confirmed', filters: [{ dataSize: 105 }, { memcmp: { offset: 8, bytes: wallet } }, { memcmp: { offset: 40, bytes: MINT } }] }]),
  ]);
  verifyMint(mint.value);
  if (!Array.isArray(accounts.value) || !Number.isSafeInteger(accounts.context?.slot)) throw Error('Incomplete RPC response.');
  const now = Math.floor(Date.now() / 1000);
  const locks = accounts.value.map(row => decodeLock(row.pubkey, row.account, wallet));
  const evidence = { wallet, mint: MINT, ts: now, activeLocks: locks.filter(l => l.unlockAt > now) };
  const result = evaluateTimelocks(evidence, { ...POLICY, wallet }, now);
  return { eligible: result.eligible, totalRaw: result.totalRaw.toString(), nextCheckAt: result.nextCheckAt, checkedAt: now, wallet, mint: MINT, source: 'Solana RPC · DevFridge program accounts', slot: accounts.context.slot };
}
