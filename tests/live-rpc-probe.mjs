// Read-only infrastructure probe. This generates a disposable public identity, never a user wallet transaction.
import { generateKeyPairSync } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import bs58 from 'bs58';
import { readAccess } from '../server/access.mjs';
const {publicKey}=generateKeyPairSync('ed25519');const wallet=bs58.encode(publicKey.export({format:'der',type:'spki'}).subarray(-32));
const result={date:new Date().toISOString(),purpose:'Read-only RPC availability probe using a generated test public key; not user wallet or qualifying-lock evidence'};
try{result.access=await readAccess(wallet);result.status='available';}catch(error){result.status='unavailable';result.error=error.message;}
await writeFile('evidence/live-rpc-probe.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
