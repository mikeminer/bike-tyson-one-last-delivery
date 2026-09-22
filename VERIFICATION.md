# Verification record — 2026-09-22

## Automated results

| Check | Result | Evidence / scope |
|---|---|---|
| TypeScript + Vite production build | Passed | `npm run build`; pinned dependencies |
| Unit tests | 11 passed | `npm test` |
| Browser flow | 19 passed, no uncaught JS errors | `evidence/browser-verification.json` |
| Desktop | Checked at 1440×1000 | Initial screen, steering, punch, pause, complete delivery, replay and restart |
| Phone portrait | Emulated 390×844 | No horizontal overflow, touch jump and pointer controls |
| Phone landscape | Emulated 844×390 | Layout and control positioning after resize |
| WebGL loss/restoration | Passed in Chromium | Pauses, disables resume until restored, explicit resume works |
| Background return | Passed with simulated visibility transition | Remains paused until deliberate resume |
| Phantom recovery | Synthetic provider tests | No provider, rejected message, generated-key signature, account change |
| Access errors | Synthetic RPC/UI fixtures | Unavailable/429 never grants the pass |
| Mainnet mint | Read at finalized slot 449431015 | `evidence/mint-mainnet-2026-09-22.json` |
| Live program RPC | Available; generated test wallet had no locks | `evidence/live-rpc-probe.json`; no real qualifying-lock claim |
| Dependency advisories | Zero known findings | `evidence/dependency-audit.json`; not an independent audit |
| Production smoke test | Passed | `evidence/production-smoke.json`; production page renders, no external requests, no uncaught errors |
| Replay file playback | Passed in Chromium | 360×640, 7.898714 seconds, decoded frames advance during playback |
| Repeated-run resource cleanup | Passed | Four start/home cycles are checked for bounded resident textures; see latest production-smoke.json |

Unit coverage includes exact raw conversion, aggregate threshold, partial expiry, sub-day active locks, single-lock policy, duplicate/foreign/malformed/stale/future evidence, next-check boundaries, authenticated nonce replay, expiry, wrong origin, forged signatures, unknown mint extensions, RPC failures, completion and replay provenance.

The initial browser run found rapid taps could be lost before the next physics tick. Action queuing corrected this; the repeated browser test passed. Rendering was also adjusted to keep the replay camera inside the road and to make the original face readable. Fonts are self-hosted. Obstacle resources are disposed on a new run.

## Recorded game evidence

`evidence/funny-finish-demo.webm` is an actual automatic replay of an automated practice run. The test observed a complete run and exported a vertical 360×640 recording; its delivery outcome is recorded in browser-verification.json. The replay presentation lasts eight seconds; container timing can differ slightly due to MediaRecorder startup/frame cadence. Captions and synthesized effects are included; device speech narration is not captured. This is not a human-play, prize-eligibility or real-Phantom recording.

Desktop and phone screenshots are in `evidence/`. `midnight-fixture.png` is prominently labelled synthetic test pass; it demonstrates the night route with a fixture and makes no claim about a real wallet deposit. The browser is Chromium 153.0.8010.12 on this Windows host, with phone emulation, not physical Android/iOS devices.

An observed replay frame rendered approximately 261,000 triangles and 155 draw calls in the revised idle scene; exact counts vary with camera/visible obstacles. Pixel ratio is capped at 1.5, with a lightweight option at 1 and shadows disabled. No physical-phone FPS or thermal measurements are claimed. The minified JavaScript bundle is approximately 606 kB / 159 kB gzip; Vite emits its standard 500 kB chunk advisory. Fonts add approximately 782 kB across all packaged weights/licences.

## Live integration observations

The exact mint is Token-2022 with six decimals, metadataPointer and tokenMetadata extensions. The backend rechecks owner, initialized mint, decimals and allowed extensions before access. It reads lock accounts from the existing DevFridge program, verifies ownership/discriminator/schema/depositor/mint and computes the policy with BigInt. Network errors remain errors and are not converted into empty holdings.

No user wallet was connected, no real transaction signed, no tokens bought/moved, and no new vault or score contract deployed. The live backend probe used an ephemeral test public key and confirmed an empty, ineligible result. Qualifying-lock behaviour is covered by clearly synthetic fixtures, not a real deposit.

## Remaining release checks

- Real Phantom extension and Phantom mobile browser: connect, message rejection, reconnect, account switching, foreground and session expiry.
- Physical iPhone/Android playthrough, touch ergonomics, audio recovery, performance and actual file-sharing/upload support.
- Redemption route for the exact mint, current DevFridge fees/schema/program evidence and token compatibility rechecked at release. New lock creation remains unavailable until routing is verified.
- Public HTTPS deployment, configured RPC, persistent/rate-limit infrastructure review if scaled beyond one Node process, source repository and immutable review commit.
- Asset/brand review by the user and distribution terms of the supplied skill helper before public source publication.
- Any future ranked/valuable score path needs separate server authority and anti-abuse design. Current local scores, signatures and replays do not establish human play or entitlement to rewards.

The showcase metadata file and PR must use the then-current upstream schema, validator and template. No public submission, owner approval, gallery publication or competition eligibility is asserted by these local tests.


## Gemini audio revision

Two Gemini-composed loops and eight layered effects are rendered from the retained JSON. Lyria file generation failed twice; there are no Lyria recordings in this build. Audio verification passed nine checks covering real Web Audio output, keyboard triggers, mute, pause/resume, toggling sound while paused, cleanup and 10 WAV exports with finite samples, nonzero energy and bounded peaks. See evidence/audio-verification.json. All 19 browser checks passed. Production smoke decoded the exported audio: RMS 0.03328, peak 0.39359, two channels. Its actual container duration was 9.071864 seconds under browser automation; the simulation replay timeline remains eight seconds. No physical-phone or subjective listening review is claimed.

## Anatomical character and texture revision

Build and all 11 unit checks passed. All 19 browser checks passed with zero uncaught errors, including a complete play/replay/export cycle, phone portrait/landscape, touch input and access fixtures. Desktop and portrait reduced-motion previews were visually inspected, as were playing and landscape screenshots and the refreshed in-app preview. The final shader correction uses defined smoothstep bounds; the final production build and visual preview passed afterward.

The continuous body has 22,514 vertices and 45,028 triangles and is baked offline. Idle rendering reports 87 draw calls, 302,946 rendered triangles and 16 textures. Four production start/quit cycles held 17 textures each, with no growth. The exported 360×640 video decoded successfully, with audible audio (RMS 0.04297, peak 0.40712), no external page requests and no browser errors. Physical-phone performance remains untested. Evidence is in reference-preview.png, reference-mobile-preview.png, browser-verification.json and production-smoke.json.

## Surface detail and contact-shadow verification

Production build and shader-aware desktop/portrait preview passed with no console errors. All 19 full browser checks passed, including play/replay/export, touch/landscape, WebGL loss/restoration and synthetic night-access fixtures. Desktop, phone portrait and the night scene were visually inspected. Idle rendering reports 91 draw calls, 321,670 triangles including shadow passes and 18 textures. Four production start/quit cycles held 19 textures each, without resource growth. The 360×640 replay decoded with audible audio (RMS 0.03657, peak 0.38188), no browser errors and no external page requests. No physical-phone benchmark is claimed.

## Public HTTPS submission verification

On 2026-09-22, all 19 browser checks passed against https://bike-tyson-mikeminer.vercel.app (see evidence/browser-verification.json, baseURL field). This includes free practice, a complete run and export, touch/landscape, cancellation recovery, genuine Ed25519 verification of an ephemeral synthetic key, labelled qualifying-lock fixtures and RPC-failure denial. No real Phantom extension/mobile wallet, human mainnet signature, deposit or token transaction was used. The updated shared API also retains all 11 passing unit checks.

Public recordings are served at /demo/: desktop.webm (complete automated run), mobile.webm (phone emulation and orientation), gate-fixture.webm (explicit synthetic label) and funny-finish.webm (actual exported replay with audio). The full-screen test recordings are visual recordings; the Funny Finish has the captured game audio. Signed-in browser data and personal credentials are not part of the test profiles. Physical-phone performance, durable multi-instance sessions, independent asset rights and a security audit remain unverified.

## Delivery Pass sign-in correction — 2026-09-22

The old message ended with `Action: delivery-pass`, which is not a Sign In With Solana field. The Wallet Standard parser then treated the advanced fields as part of the statement: URI, nonce and expiration were undefined. The message now uses `Request ID: delivery-pass`; a regression test checks that those security fields remain structured. The server still verifies the exact signed bytes, one-use nonce, wallet, origin and expiration.

Phantom rejection (4001), unauthorized account (4100), disconnection (4900), pending request (-32002), invalid input (-32000) and unsupported signing (-32601) now have distinct recovery messages. Other wallet errors retain their bounded explanation, rendered as text. An error never authenticates the wallet or grants eligibility.

Validation: all 13 unit tests, production build and all 19 browser checks pass; the new run is recorded in `evidence/delivery-pass-signing-verification.json`. The authentication browser checks use a synthetic provider and generated test key, not a real Phantom wallet. The real-wallet report is not yet an end-to-end pass; the original client discarded the provider error. The separate per-instance nonce/session limitation on serverless hosting remains as documented above.
