# BIKE TYSON â€” One Last Delivery

Ride. Punch. Crash. Deliver.

A playable Three.js arcade delivery game with an English interface. Its muscle bicycle is modeled after the visual reference supplied by the user: a human torso forms the frame, arms meet the front axle, feet pedal, handlebars emerge beside the head, and the saddle sits above the back. The updated character uses continuous anatomical geometry, skeletal deformation, a sculpted head and textured PBR materials. It remains a reference-based procedural game model rather than a 3D scan. Face and skin textures were generated with the built-in image generator; see ASSETS.md. Environment geometry was created for this project. Gemini composed two music loops and eight layered comic effects, rendered locally with Web Audio; Lyria recording attempts failed. Music and effects are included in replay exports. No voice cloning is used.

Public game: https://bike-tyson-mikeminer.vercel.app/ · Demo: https://bike-tyson-mikeminer.vercel.app/demo/ · Author/contact: https://github.com/mikeminer

## Play

Reach the delivery arch within 45 seconds before dignity reaches zero. The bicycle accelerates automatically. Use arrows/A/D to steer, Space/Up to jump, X to punch. On phones use the visible touch buttons. Escape/P pauses. Smash absurd obstacles, jump ramps and earn a laugh multiplier from near misses. The best recorded incident becomes an automatic eight-second slow-motion replay.

The free practice mode needs no wallet. Midnight Dispatch is a denser, daily-seeded night route with a headlight, unlocked by the Delivery Pass. Both modes have local, unverified scores and no rewards. A browser game cannot prevent someone modifying downloaded code to bypass a local scene gate.

## Run locally

Requirements: Node 22.12+ (tested on Node 24.18), npm and a browser with WebGL 2.

```sh
npm ci
npm run dev
```

Open http://localhost:4173 . The same Node server provides Vite development and the authentication/access API.

```sh
npm test
npm run build
npm start
```

`npm start` serves the built frontend and API. Set environment variables as described in `.env.example`; that file is a template, not automatically loaded. For public hosting set `APP_ORIGIN` to the exact HTTPS origin and `SOLANA_RPC_URL` to a trusted mainnet RPC supporting filtered `getProgramAccounts`. Avoid placing RPC credentials in the client bundle. HTTPS is necessary for dependable mobile wallet and sharing capabilities. The server defaults to loopback; set `HOST=0.0.0.0` only when you need local device testing; wallet authentication accepts only the configured origin.

## Delivery Pass

- Exact mainnet mint: `CbyTNf7UPzvewHh4Zp6umogM2RWahhmGRJWLJnPwpump`.
- Minimum: 1,000 BIKE TYSON = 1,000,000,000 raw units at six decimals.
- Add active locks of this mint belonging to the authenticated wallet. No minimum original duration or remaining duration beyond being unexpired.
- Expired locks stop counting. The client clears stale access and rechecks at the earliest expiry/freshness boundary, account changes and foreground return.
- If eligibility is lost during a special run, it continues as practice. Local personal bests are preserved.
- Wallet connection is separate from nonce-based sign-in. Signatures are verified server-side. Eligibility is checked against fresh program accounts, separate from scores.
- Reuses DevFridge program `9RY54dNPYTzDyh3TfFqDdt2b2KMM56KW1tw9erRTGQo6`. No new contract or score registration transaction is deployed.

The Delivery Pass offers **Lock on DevFridge** before wallet connection or eligibility: it opens `https://devfridge.cool/?mint=CbyTNf7UPzvewHh4Zp6umogM2RWahhmGRJWLJnPwpump#fridge` with the exact mint preselected. Buy/Copy CA and an explicit Phantom mobile deep link are also available. The player chooses the amount and unlock date and confirms the transaction on DevFridge, then returns to sign in or recheck locks with the same wallet. Foreground return refreshes authenticated access; opening the link alone never grants access.

Before the link, the game discloses no early withdrawal, the 2% redemption fee for PASTA buy-and-burn, network costs and the need for a Jupiter redemption route. This game's link does not certify present or future route availability. The game does not charge a duplicate protocol fee or construct/sign lock transactions.

The official SDK API implementation can turn a failed depositor lookup into an empty array. To avoid interpreting an RPC failure as zero holdings, authoritative access here uses direct, filtered RPC reads against the documented DevFridge account schema. The bundled official BigInt evaluator computes policy boundaries. See `server/access.mjs`, `src/timelock-gate.mjs`, and `VERIFICATION.md`.

## Funny Finish

The simulation stores sampled transforms from the actual run. The replay selects a scored incident, interpolates four recorded seconds over eight seconds, moves the camera and renders a 360Ã—640 canvas with subtitles. It does not generate a new run and call it a replay.

MediaRecorder captures that canvas with synthesized sound effects. Downloaded format is WebM or MP4 depending on browser support. Native file sharing is offered where supported; otherwise download and attach the file manually. Device speech synthesis provides optional local narration and is **not included in the exported recording**. No voice-cloning service is used. If recording is unavailable, a still-image fallback remains. A physical iPhone/Android export and upload must still be checked before promising social-platform compatibility.

## Verification

`npm test` runs meaningful simulation, exact-gate and authentication tests. Browser verification:

```sh
npx playwright install chromium
node tests/browser.mjs
```

Set `CHROMIUM_PATH` only to reuse a locally installed Chromium. Browser tests require the running dev server. They exercise a complete run, replay download, touch controls, phone layouts, and synthetic Phantom/access fixtures. Generated fixture keys are ephemeral test identities, never user wallets. All screenshots, JSON results and a real recorded demonstration clip are in `evidence/`. A browser test is not physical-device evidence.

## Project layout

- `src/simulation.mjs`: bounded fixed-step arcade simulation and replay history.
- `src/scene.ts`: original detailed bicycle, city, PBR surfaces, lighting and camera.
- `src/main.ts`, `style.css`: input, HUD, dialogs, replay/export and presentation.
- `src/audio.ts`: synthesized effects and optional device narration.
- `src/wallet.ts`: Phantom lifecycle, sign-in, stale checks and UI eligibility.
- `server/access.mjs`: nonce signatures, mint validation and program account reads.
- `server/index.mjs`: same-origin HTTP API and frontend server.
- `BUILD_LOG.md`, `SUBMISSION.md`, `VERIFICATION.md`, `ASSETS.md`: review evidence and honest limitations.

## Scope and publication

The current playable scope is One Last Delivery plus the pass-gated Midnight Dispatch variation. Ghost races/Bike Royale, community content submission, weekly moderation, prizes, server-authoritative ranked scores and opt-in on-chain records are future work, not implemented claims. The game is deployed separately on Vercel and the source is published under mikeminer/bike-tyson-one-last-delivery. Gallery review is a separate metadata-only PR; this does not imply gallery publication. On a submission request the agent prepares current registry metadata, validates it and handles the fork, branch and PR to `mikeminer/devfridge:master`. Owner review, merge and successful deployment publish the gallery entry. Dates, prizes and final competition eligibility remain to be announced.

Production review must address the single-process in-memory nonce/session store, reverse-proxy rate limiting, persistent sessions if scaling, RPC availability, current program schema/upgrade evidence, real wallet/device coverage and asset/branding approval. No independent security audit is claimed.

## Vercel hosting

`api/index.mjs` adapts the shared `server/api.mjs` handler. Set APP_ORIGIN to the canonical public HTTPS origin when changing domains. Nonces/sessions/rate limits are per-instance and fail closed when lost; persistent shared storage is required for reliable scaled authentication. Free practice remains available during wallet/RPC failures. Vercel deployment metadata and local environment files are excluded from source.
