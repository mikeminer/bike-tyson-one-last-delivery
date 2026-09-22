# Showcase preparation â€” local draft

**Project:** BIKE TYSON: ONE LAST DELIVERY

**Pitch:** An overconfident boxing bicycle has 45 seconds to deliver a mysterious case through an absurd city; every run becomes a shareable Funny Finish.

**Community:** BIKE TYSON. Exact Solana mainnet mint: `CbyTNf7UPzvewHh4Zp6umogM2RWahhmGRJWLJnPwpump`.

**Playable scope:** One Last Delivery with free practice and Midnight Dispatch, a daily-seeded, denser night variation unlocked by the Delivery Pass. Keyboard and touch controls; a Three.js city and reference-based muscle bicycle; automatic recorded replay; local personal bests.

**Access:** aggregate at least 1,000 BIKE TYSON in unexpired DevFridge locks belonging to the authenticated wallet. Six decimals: `1000000000` raw units. No minimum lock duration. Expired deposits stop counting. Failed/stale lookups revoke UI eligibility; a run continues as practice. No purchase is required to assess the game.

**Identity / access / scores:** single-use, expiring message challenge verified with Ed25519 on the server; fresh direct RPC account checks for the existing DevFridge program; local unverified scores, no prizes and no on-chain score submission.

**Disclosures:** no early withdrawal; 2% redemption fee for PASTA buy-and-burn; separate network costs; non-PASTA redemption requires an executable Jupiter route. The mint's route is not verified, so the game does not offer creation of new locks. Program, mint decimals and extensions must be reviewed again before release.

## Public project and evidence

- Public playable game: https://bike-tyson-mikeminer.vercel.app/ . Free practice requires no wallet or payment.
- Public source: https://github.com/mikeminer/bike-tyson-one-last-delivery . The gallery metadata pins a full immutable commit.
- Public author/contact: mikeminer — https://github.com/mikeminer (explicitly chosen by the user).
- Demo hub: https://bike-tyson-mikeminer.vercel.app/demo/ . Desktop and mobile browser recordings, labelled synthetic gate flow and an exported Funny Finish.
- Source, pinned dependencies and setup: README.md and package-lock.json.
- AI contribution log: BUILD_LOG.md.
- Tests and limitations: VERIFICATION.md and evidence/browser-verification.json.
- Screenshots: evidence/desktop-ready.png, desktop-playing.png, desktop-funny-finish.png, mobile-ready.png, mobile-playing.png and mobile-landscape.png.
- Demonstration replay: evidence/funny-finish-demo.webm. This is a recording of an actual automated practice run, not a human-play or mainnet-wallet claim.
- Mainnet mint observation: evidence/mint-mainnet-2026-09-22.json.
- Art/font/helper provenance: ASSETS.md.

## Readiness and limitations

The public showcase is a prototype. Scores are local and unverified; no ranked rewards or on-chain score writes. Wallet tests use ephemeral generated test keys and explicitly labelled lock fixtures; no real user wallet was signed and no funds moved. Mobile coverage is Chromium emulation, not physical-phone/Phantom-mobile testing. The exact mint was observed on mainnet; the current public RPC is rechecked for live eligibility and can rate-limit or reject filtered account queries. Such failures do not unlock the special mode. Redemption routing remains unverified and no locking flow is offered.

The Vercel API uses the same server-side authentication and lock verifier as local Node. Nonces, sessions and rate budgets are process-local: cold starts or a different instance can require a fresh sign-in. This fails closed, but a shared persistent store and distributed rate limiting are needed before treating the service as a production authentication system. No independent security audit is claimed.

The character is based on the user's supplied reference, with AI-generated face and skin textures. This does not establish a scanned/licensed likeness or independently verified rights in that reference. Asset provenance, font licences and retained helper attribution are documented in ASSETS.md for owner review. The game has no voice clone.

## AI contributions and prior work

The human supplied the concept, reference image, token mint, threshold and active-lock rule; then reviewed and steered the character, English language and audio direction. Codex implemented the game, server verifier, tests, models, shaders, deployment adapter and this submission. Built-in image generation made the documented face/skin textures; Gemini composed the retained numeric music and effect recipes. Lyria audio generation failed and no Lyria recording is claimed. The official DevFridge 1.4.0 exact-lock helper is pre-existing code with attribution. The existing DevFridge Solana program is reused, not redeployed. Earlier iterations and actual verification are preserved in the build log.

## Gallery publication

This package is submitted for owner review through a metadata-only PR targeting mikeminer/devfridge:master. A successful submission is not gallery publication. Owner review, merge and successful gallery deployment publish the entry. Dates, prizes and final competition eligibility remain to be announced. The agent does not self-approve or merge this proposal.
