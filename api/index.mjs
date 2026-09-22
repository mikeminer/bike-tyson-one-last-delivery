import { createApi } from '../server/api.mjs';
const origin=process.env.APP_ORIGIN || 'https://bike-tyson-mikeminer.vercel.app';
const api=createApi(origin);
// Ephemeral instances fail closed on missing nonces/sessions; shared persistence is future hardening.
export default async function handler(req,res){
  res.setHeader('x-content-type-options','nosniff');
  res.setHeader('referrer-policy','strict-origin-when-cross-origin');
  if(req.query?.path)req.url='/api/'+req.query.path;
  return api(req,res);
}
