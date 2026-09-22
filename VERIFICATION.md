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
