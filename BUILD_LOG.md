# AI build log

## Preparation — 2026-09-22

- Goal: build a playable Three.js community game for desktop and mobile with Phantom and DevFridge access, then prepare truthful showcase evidence. Submit only when the user asks.
- Agent/tools: Codex; PowerShell, HTTPS downloads, SHA-256 verification, local file inspection.
- User request: read the official handbook first; verify and install the official skill; guide three initial decisions; handle implementation and the eventual GitHub submission workflow.
- Sources read: https://hackathon.devfridge.cool/llms.txt and https://hackathon.devfridge.cool/kit/handbook.md . Build-log template: https://hackathon.devfridge.cool/kit/build-log.md .
- Skill: official DevFridge Game Builder 1.4.0, downloaded from https://world.devfridge.cool/world/skill/downloads/devfridge-game-builder.zip .
- Manifest: https://world.devfridge.cool/world/skill/downloads/manifest.json . Archive SHA-256: `76c15c5fb0f8fe6ba7260bc94d6cfbe7c0f879db9f81f2a77c6158c471c600cf`.
- Installation checks: archive digest matched the manifest; all 15 entry hashes matched; paths were checked for destination containment and symbolic links before extraction; all installed hashes matched afterward.
- Installation: workspace `.agents/skills/devfridge-game-builder/`; all references, assets and agents files retained. The previously installed global skill was preserved. No existing destination files were replaced.
- Instructions loaded: SKILL.md, discovery, hackathon submission, game delivery, SDK/access and Phantom references.
- Human decisions: community/game concept, exact mint/network or pre-launch status, and access policy requested; answers pending.
- Human review: not yet performed.
- Tests: `node --test assets/timelock-gate.test.mjs` passed all 6 bundled tests. Coverage includes exact decimal conversion, aggregation, expiry/duration boundaries, single-lock policy, recheck deadlines and rejection of invalid/stale evidence. This verifies the bundled evaluator, not a completed game or live on-chain integration.
- Gameplay and device evidence: none yet; implementation awaits the game concept. No physical phone or live wallet tests claimed.
- Transactions: none. No token purchases, fund movement, contract deployments or transaction signatures.
- Publication: no game deployment, source publication or showcase PR yet. Dates, prizes and final competition eligibility remain to be announced.
- Commit: none yet.

## Implementation requirements

- Complete play/result/restart loop, keyboard and touch controls, realistic materials and original art direction.
- Explicit practice mode until mint compatibility and policy are verified. Never substitute an arbitrary live mint.
- Separate wallet connection/authentication, token eligibility and score authority; browser scores must be labelled local and unverified unless a server verification system is implemented.
- Reuse DevFridge program `9RY54dNPYTzDyh3TfFqDdt2b2KMM56KW1tw9erRTGQo6`; verify current mint owner, decimals, extensions and integration documentation before live access.
- Before any locking flow disclose expiry, no early withdrawal, 2% redemption fee, separate network costs and redemption routing constraints. Non-PASTA redemption requires an executable Jupiter route.
- Showcase preparation must include reproducible setup, actual test evidence, asset provenance and explicit limitations. A submission PR is not gallery publication: owner review, merge and successful deployment are required.

## Playable build — 2026-09-22

- User decisions: BIKE TYSON: ONE LAST DELIVERY; original anthropomorphic boxing bicycle rather than a real-person likeness; auto acceleration, steer/jump/punch, 30–60 second runs and a comic automatic replay. User supplied the exact Pump.fun mint.
- Confirmed access policy: at least **1,000 BIKE TYSON**, **any unexpired lock with no minimum duration**. Aggregate qualifying deposits of the same mint and wallet. Free practice plus a special pass-gated challenge was proposed and retained; no entry fee or rewards added.
- Mint verification: public Solana mainnet `getAccountInfo` with finalized commitment, slot 449431015, identified Token-2022 ownership, six decimals, metadataPointer/tokenMetadata extensions, and no mint/freeze authority. Raw response saved under evidence/. This is mint compatibility evidence, not a redemption-route test or audit.
- Implementation: TypeScript/Three.js, Vite and a same-origin Node HTTP server. Created a detailed original bicycle, city and five obstacle types; fixed-step arcade physics, dignity, scoring, delivery/failure, restart, keyboard/touch controls, pause and context recovery. Midnight Dispatch uses a daily seed, more obstacles and night lighting/headlight.
- Replay: stores transforms from each actual run, selects a scored event and interpolates four seconds over eight seconds with a camera move and captions. Records a 360×640 canvas plus synthesized audio. Device narration is local-only and is not included in the exported video. WebM/MP4 support and sharing vary by browser.
- Identity: server-issued two-minute message challenge; Ed25519 verification; single-use nonce; 15-minute HttpOnly/SameSite session. Generated test keys were used only for synthetic tests, not a user wallet or a transaction.
- Eligibility: verifies mint owner/decimals/extensions and reads filtered accounts owned by the existing DevFridge program via RPC. Uses the official exact BigInt evaluator with a threshold of 1,000,000,000 raw units. Checks earliest expiry/freshness boundary and clears old access on account/visibility changes. Scores remain independently labelled local and unverified.
- Source review found the official API depositor lookup can catch an RPC error and return an empty list. To preserve unavailable-versus-zero semantics, authoritative admission uses direct program RPC reads against documented account fields rather than treating an SDK empty array as proof of zero holdings. Sources: https://github.com/mikeminer/devfridge/blob/master/scan/app/api/sdk/check/route.ts , /scan/lib/fridge.ts and /scan/lib/constants.ts . No contract implementation was copied or deployed.
- Live backend probe: direct RPC account reading succeeded with a generated test public key and correctly returned ineligible with no locks. Evidence saved in evidence/live-rpc-probe.json. This does not claim a live qualifying deposit or real Phantom success.
- Corrections from tests: rapid touch taps initially could be lost between physics frames; actions now queue until consumed. Moved replay camera inside road bounds to avoid building occlusion. Raised the original character's face for readability. Preserved stale-response invalidation and serialized logout after in-flight authentication.
- Visual polish: deliberate frame tubes, tire/rim/spoke details, glove seams, sunglasses/headlamp face, delivery case, masonry/window frames, awnings, signs, asphalt base/bump maps, PBR materials, environment reflections and bounded shadows. Font binaries and licences bundled locally; no runtime Google Fonts requests remain.
- Dependency review: initial Vite/esbuild versions were flagged by npm audit. Updated to Vite 7.3.6 and pinned esbuild 0.28.1 override. Final dependency audit reports zero known vulnerabilities; this is not a security audit.
- Tests: unit suite and browser evidence are recorded in VERIFICATION.md and evidence/. Browser tests use actual keyboard/pointer controls for gameplay; mock wallet/access cases are explicitly synthetic. A complete practice run produced the saved replay clip.
- Human review: pending the user's playthrough. Physical phone, real Phantom desktop/mobile, supported-platform upload and redemption routing remain untested. No public hosting, prizes, on-chain score recording or gallery submission is claimed.
- Future features: ghost racing, community content, weekly competitions and opt-in on-chain scores require their own design, permissions and score authority; they were not presented as working features in this build.
- Final evidence: 11 unit tests, 19 browser checks, zero uncaught browser errors and zero npm audit findings. Production smoke test passed with no external page requests; four restart cycles held texture count at 10. The exported 360×640 WebM decoded and played for 7.898714 seconds. A hidden local Node production server serves the preview on port 4173.
- Version control: initialized an isolated repository inside this game's output directory on branch `codex/bike-tyson`; the parent home-directory repository was not modified. Source publication and submission remain pending the user's request.


## Reference character and English revision — 2026-09-22

- Human steering: match the supplied muscle bicycle image and make the entire game English. This supersedes the earlier robot bicycle visual direction; the confirmed 1,000-token active-lock policy stays in effect.
- Replaced the orange mechanical frame, robot head and boxing gloves with a procedural muscular torso, tapered arms/legs, thin tires and spokes, chain/cranks, feet on pedals, a black saddle and handlebars emerging beside a head. A reference-derived facial texture was generated with built-in image_gen and mapped to a curved facial mesh. This is a stylized reconstruction, not a scanned model or exact photorealistic reproduction.
- Pedaling uses two-bone leg IK. Punching animates a bare fist; wheel rotation and pedal motion derive from recorded distance, so they also work in the actual-run replay. Batched rigid pieces by material and lowered geometry detail for small chain links.
- Translated menus, controls, help, HUD, results, sharing, accessibility labels, wallet states, auth/RPC errors, lock disclosures, HTML language and metadata to English. Number formatting is en-US. Provider-signature failures use a stable English message.
- Visual review corrected face projection/occlusion and mobile camera framing. The full bicycle now fits below the portrait start button. Startup waits for the character texture and reports asset-load failure separately from WebGL failure.
- Verification: build and 11 unit checks passed; browser play/replay/input/Phantom-fixture checks and refreshed evidence are recorded in VERIFICATION.md and evidence/. No user wallet, transaction, purchase, new contract or public publication was involved.
- The first compound server restart command was rejected by automatic review without a detailed reason. A scoped PowerShell script validated the recorded game process before restarting only that server and succeeded.
- Final revision checks: 19 browser checks passed with zero uncaught errors. Production playback decoded the actual 360×640 recording (8.189557 seconds); four restart cycles held 12 resident textures with no external page requests. The in-app preview was reloaded and visually inspected in English; the user's existing local best was preserved.
- GitNexus CLI is available, but its running MCP reader reports a storage-format mismatch (database 42, reader 40). This affects code-index queries, not the build, game server or browser checks.


## Gemini audio direction and integration — 2026-09-22

- Human request: have Gemini create funny music and sounds for Bike Tyson. Used the signed-in Gemini web application in Chrome; no API keys, paid upgrades or purchases were requested.
- Lyria attempts: the detailed instrumental chase brief and a shorter Pedal Panic brief both returned generic failure messages. No Lyria MP3 was produced, downloaded or claimed. Conversation: https://gemini.google.com/app/baf3a85ea0f0b520 .
- Successful Gemini composition: asked for declarative Web Audio sound recipes and two original numeric note/bass arrangements. Downloaded Gemini's complete JSON from https://gemini.google.com/app/5f07a28b972543b7 . Eight effects: rubber punch, jump/boing, bicycle ding, geyser whistle/spray, trombone crash/clatter, apologetic bus horn, angry pigeon and wrong-note finish fanfare. Two 16-beat themes: jaunty toy jazz and a comic failure march.
- Codex integration: validated numeric limits and waveforms before rendering; no external executable code evaluated. Built an offline renderer, bounded six-voice effect pool, compressed mixer, music ducking, fades, mute, audio-clock pause/resume and recorder routing. Replay phrase is accelerated from 9.6 to 8 seconds so its complete wrong-note ending fits the Funny Finish.
- Added a zero-score jump event so the same boing also accompanies a recorded replay jump. No change to token gating, signatures, funds or score authority.
- Evidence: tests/audio-verification.mjs verifies user-gesture audio start, 10 compiled sounds, nonzero output, actual jump/punch inputs, mute silence, pause/resume and home cleanup. It exports all 10 WAV previews and checks finite samples, nonzero RMS and peaks below clipping. This is a technical audio verification, not a human listening review or physical-phone test.
- Final checks: 11 unit checks, 19 full browser checks and 9 audio checks passed. Exported WebM audio decoded with RMS 0.03328 and peak 0.39359; video playback also passed. No external page requests or browser errors. The raw Gemini JSON hash matches the downloaded file: `7ba5a6183ecb0831c3e000ba15d38e075462b5b9f6fbc71ea5dd580e582048da`. The completed Gemini composition conversation remains available to the user. The local preview and source archive were updated.

## Anatomical character and texture revision — 2026-09-22

- Human request: make Bike Tyson closer to the supplied photo and improve textures. Replaced separate muscle/joint primitives with one smooth-union anatomical mesh: 22,514 vertices, 45,028 triangles, 13 bones. Reproducible bake script retained. Added shaped biceps, forearms, hands and feet; inverse kinematics drives the deforming mesh.
- Replaced the separate facial shell with one closed sculpted head and softly blended projection around the temples. Refined initial pedal pose to match the reference silhouette.
- Generated a new skin albedo swatch with the built-in image tool using the user reference. Exact prompt and hash retained with the asset. Added rest-space triplanar sampling, subtle skin micro-bump, rubber grain, leather grain, metal roughness and grip rings.
- Desktop 1440×1000 and portrait 390×844 screenshots inspected. Idle scene reported 87 draw calls, 302,946 rendered triangles and 16 resident textures (including shadow passes); the body is baked offline rather than polygonized on phones. Build passed. Final browser verification is recorded below.
- Final verification: 11 unit checks and 19 browser checks passed; production replay decoded with audible audio, zero browser errors and zero external requests. Four restart cycles held 17 textures each. Corrected reversed shader smoothstep bounds, rebuilt and rechecked the final desktop/portrait preview and production smoke. Updated the in-app preview while preserving the user's local best. No wallet or transaction changes.

## Surface detail and ground contact — 2026-09-22

- Human confirmed another realism and texture pass. Kept the supplied bicycle silhouette and English game interface.
- Skin shading now derives restrained micro-normal and roughness variation from the same albedo sample, alongside subtle vascular color. Added an original winged-wheel ink emblem on upper arms and thighs, projected in rest space so it follows skeletal movement. This decorative emblem is original project art, not a claim to reproduce every tattoo in the reference.
- Added patterned tire tread and sidewall beads, valve stems, saddle stitching and support rails. Leather uses a pebbled height pattern; rubber and leather have different roughness and bump strength.
- Replaced the uniform road grain with authored aggregate and sparse fine cracks at a two-meter tile scale. Added two shared-texture tire contact shadows that broaden/fade with height. Corrected the cosmetic chassis height to match the road surface without changing simulation or collision rules.
- All new surface patterns are generated by local source code in surface-textures.ts; no downloads or external runtime texture services. Existing generated face/skin provenance is unchanged. No new wallet, economy, publication or transaction actions.
- Verification completed: production build, shader-aware visual preview and all 19 browser checks passed. Inspected desktop, portrait and night-mode evidence. Production replay/audio playback passed; four restart cycles stayed at 19 textures. The in-app preview, evidence and source archive were refreshed.

## Authorized DevFridge showcase submission � 2026-09-22

- Human explicitly requested submission and selected mikeminer plus the public GitHub profile as author/contact. Read current llms.txt, complete handbook, repository guide, schema and PR template. Existing game/PR search found no duplicate.
- Authenticated GitHub account is mikeminer, also the upstream owner: use an isolated master checkout and a dedicated proposal branch; a self-fork is neither needed nor possible. Do not approve or merge the proposal.
- Created a separate public game repository and Vercel project; reused available signed-in accounts without requesting credentials, buying services or changing DevFridge production projects. Added a thin deployment adapter around the shared API handler, preserving challenge verification, origin checks and read-only eligibility. Process-local state remains explicitly documented as a prototype limitation on scaled functions.
- Verified the public /api/config response and ran public browser evidence with generated test-wallet signatures and labelled synthetic lock responses. These are not real Phantom/mainnet participation claims. No funds moved.
- All 19 checks passed against the public production URL. Saved public desktop, mobile-emulation and visibly labelled synthetic gate videos plus the exported replay. The shared API unit checks passed (11). Vercel's CLI-created local environment file is ignored and excluded from uploads; no credential values were read or committed. Public demo pages state all fixture, device, score and ephemeral-session limits.
