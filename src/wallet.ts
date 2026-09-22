import { signatureErrorMessage } from './wallet-errors.mjs';
export const MINT = 'CbyTNf7UPzvewHh4Zp6umogM2RWahhmGRJWLJnPwpump';
type Provider = { isPhantom?: boolean; publicKey?: { toString(): string }; connect(): Promise<{ publicKey: { toString(): string } }>; disconnect(): Promise<void>; signMessage(bytes: Uint8Array, encoding: string): Promise<{ signature: Uint8Array }>; on(event: string, handler: (...args: any[]) => void): void };
declare global { interface Window { phantom?: { solana?: Provider } } }
export type Access = { eligible: boolean; totalRaw: string; nextCheckAt: number; checkedAt: number; wallet: string; source: string; slot: number };
export class DeliveryPass {
  wallet = ''; authenticated = false; access: Access | null = null; busy = false; message = 'Connect Phantom to check your Delivery Pass.';
  private generation = 0; private provider?: Provider; private timer = 0; private backoffUntil = 0; private pendingLogout: Promise<unknown> = Promise.resolve(); private authDone: Promise<void> = Promise.resolve();
  constructor(private changed: () => void) { document.addEventListener('visibilitychange', () => { if (!document.hidden && this.authenticated) { this.access = null; this.changed(); void this.check(); } }); }
  get eligible() { return !!this.access?.eligible && Date.now() / 1000 < this.access.nextCheckAt; }
  private async api(path: string, body?: object) {
    const response = await fetch(path, { method: body ? 'POST' : 'GET', credentials: 'same-origin', headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(18000) }).catch(()=>{throw Error('Connection unavailable. Please try again.');});
    const data = await response.json(); if (!response.ok) { if (response.status === 401) this.authenticated = false; throw Error(data.error || 'Verification unavailable.'); } return data;
  }
  async connect() {
    if (this.busy) return;
    const provider = window.phantom?.solana;
    if (!provider?.isPhantom) { this.message = 'Phantom not detected. On mobile, open the game in the Phantom browser; practice is available right away.'; this.changed(); return; }
    this.busy = true; this.message = 'Confirm the connection in Phantom…'; this.changed();
    if (this.provider !== provider) { provider.on('accountChanged', () => this.clear()); provider.on('disconnect', () => this.clear()); this.provider = provider; }
    try { const connected = await provider.connect(); this.wallet = connected.publicKey.toString(); this.message = 'Wallet connected. Sign in with a message to prove ownership.'; }
    catch { this.message = 'Connection canceled. You can continue in practice.'; }
    finally { this.busy = false; this.changed(); }
  }
  clear() {
    this.generation++; this.wallet = ''; this.authenticated = false; this.access = null; this.busy = false; clearTimeout(this.timer);
    this.message = 'Wallet disconnected or changed. Reconnect to verify again.';
    this.pendingLogout = Promise.all([this.pendingLogout,this.authDone]).then(()=>this.api('/api/auth/logout', {})).catch(() => {}); this.changed();
  }
  async disconnect() { this.clear(); try { await this.provider?.disconnect(); } catch { /* Local access is already cleared. */ } }
  async authenticate() {
    if (!this.wallet || !this.provider || this.busy) return;
    const generation = this.generation, wallet = this.wallet;
    let resolveAuth!:()=>void;this.authDone=new Promise<void>(resolve=>resolveAuth=resolve);
    this.busy = true; this.access = null; this.message = 'Sign the sign-in message only. No transaction.'; this.changed();
    try {
      await this.pendingLogout;
      const challenge = await this.api('/api/auth/challenge', { wallet });
      if (generation !== this.generation) return;
      const { signature } = await this.provider.signMessage(new TextEncoder().encode(challenge.message), 'utf8').catch(error=>{throw Error(signatureErrorMessage(error));});
      if (generation !== this.generation) return;
      await this.api('/api/auth/verify', { wallet, nonce: challenge.nonce, signature: btoa(String.fromCharCode(...signature)) });
      if (generation !== this.generation) return;
      this.authenticated = true; this.message = 'Identity verified. Reading DevFridge locks…';
    } catch (error) { if (generation === this.generation) this.message = error instanceof Error ? error.message : 'Signature canceled.'; }
    finally { resolveAuth();if (generation === this.generation) { this.busy = false; this.changed(); if (this.authenticated) void this.check(); } }
  }
  async check() {
    if (this.busy || !this.authenticated || Date.now() < this.backoffUntil) return;
    const generation = this.generation; this.busy = true; this.access = null; clearTimeout(this.timer);
    this.message = 'Checking locks on the DevFridge program…'; this.changed();
    try {
      const data: Access = await this.api('/api/access');
      if (generation !== this.generation || data.wallet !== this.wallet) return;
      if (data.nextCheckAt <= Date.now() / 1000 || data.checkedAt > Date.now() / 1000 + 5) throw Error('Data expired. Please try again.');
      this.access = data;
      this.message = data.eligible ? 'Delivery Pass active. Special challenge unlocked.' : 'Insufficient active locks: at least 1,000 BIKE TYSON are required in total.';
      this.timer = window.setTimeout(() => { this.access = null; this.changed(); void this.check(); }, Math.max(1000, (data.nextCheckAt * 1000 - Date.now())));
    } catch (error) {
      if (generation !== this.generation) return;
      this.access = null; this.backoffUntil = Date.now() + 30000; this.message = error instanceof Error ? error.message : 'Verification unavailable. Please try again.';
      this.timer = window.setTimeout(() => { this.changed(); void this.check(); }, 31000);
    } finally { if (generation === this.generation) { this.busy = false; this.changed(); } }
  }
}
