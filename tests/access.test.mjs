import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import bs58 from 'bs58';
import { parseSignInMessageText } from '@solana/wallet-standard-util';
import { Authentication, MINT, PROGRAM, TOKEN2022, readAccess, verifyMint, decodeLock } from '../server/access.mjs';
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const wallet = bs58.encode(publicKey.export({ format: 'der', type: 'spki' }).subarray(-32));
const origin = 'https://example.test';

test('Phantom SIWS parser retains the nonce, origin and expiry as structured fields', () => {
  const c = new Authentication().challenge(wallet, origin);
  const parsed = parseSignInMessageText(c.message);
  assert.ok(parsed);
  assert.equal(parsed.domain, new URL(origin).host);
  assert.equal(parsed.address, wallet);
  assert.equal(parsed.uri, origin);
  assert.equal(parsed.nonce, c.nonce);
  assert.equal(parsed.chainId, 'solana:mainnet');
  assert.equal(parsed.version, '1');
  assert.equal(parsed.expirationTime, new Date(c.expiry).toISOString());
  assert.equal(parsed.requestId, 'delivery-pass');
  assert.equal(parsed.statement.includes('\n'), false);
});
test('wallet authentication rejects replay, altered origin, expired challenge and forged signatures', () => {
  const auth = new Authentication();
  const c = auth.challenge(wallet, origin, 1000); const signature = sign(null, Buffer.from(c.message), privateKey).toString('base64');
  const token = auth.authenticate(c.nonce, wallet, signature, origin, 2000);
  assert.equal(auth.session(token, 2000).wallet, wallet); assert.equal(auth.session(token, 902000), null);
  assert.throws(() => auth.authenticate(c.nonce, wallet, signature, origin, 2000));
  const wrongOrigin = auth.challenge(wallet, origin, 1000);
  assert.throws(() => auth.authenticate(wrongOrigin.nonce, wallet, signature, 'https://evil.test', 2000));
  const expired = auth.challenge(wallet, origin, 1000);
  assert.throws(() => auth.authenticate(expired.nonce, wallet, signature, origin, 122000));
  const forged = auth.challenge(wallet, origin, 1000);
  assert.throws(() => auth.authenticate(forged.nonce, wallet, Buffer.alloc(64).toString('base64'), origin, 2000));
});
const mintAccount = { owner: TOKEN2022, data: { parsed: { type: 'mint', info: { isInitialized: true, decimals: 6, extensions: [{ extension: 'metadataPointer' }, { extension: 'tokenMetadata' }] } } } };
function lock(amount, expiry, owner = PROGRAM) {
  const data = Buffer.alloc(105); Buffer.from([8,255,36,202,210,22,57,137]).copy(data); Buffer.from(bs58.decode(wallet)).copy(data,8); Buffer.from(bs58.decode(MINT)).copy(data,40);
  data.writeBigUInt64LE(BigInt(amount),72);data.writeBigInt64LE(BigInt(expiry-10),80);data.writeBigInt64LE(BigInt(expiry),88);
  return {owner,executable:false,data:[data.toString('base64'),'base64']};
}
test('server admits exact aggregate across active sub-day locks, and excludes an expired lock', async () => {
  const now = Math.floor(Date.now()/1000);
  const call = async method => method === 'getAccountInfo' ? {value:mintAccount} : {context:{slot:123},value:[{pubkey:'a',account:lock(400000000,now+5)},{pubkey:'b',account:lock(600000000,now+9)},{pubkey:'c',account:lock(1000000000,now-1)}]};
  const access = await readAccess(wallet,call);assert.equal(access.eligible,true);assert.equal(access.totalRaw,'1000000000');assert.equal(access.nextCheckAt,now+5);
});
test('RPC failure is unavailable rather than zero holdings; unexpected program/schema/extensions reject', async () => {
  await assert.rejects(readAccess(wallet,async()=>{throw Error('429');}),/429/);
  assert.throws(()=>decodeLock('a',lock(1,Math.floor(Date.now()/1000)+5,'wrong'),wallet));
  const bad=structuredClone(mintAccount);bad.data.parsed.info.extensions.push({extension:'transferHook'});assert.throws(()=>verifyMint(bad));
  const wrongDecimals=structuredClone(mintAccount);wrongDecimals.data.parsed.info.decimals=9;assert.throws(()=>verifyMint(wrongDecimals));
});
