# Showcase preparation — local draft

**Project:** BIKE TYSON: ONE LAST DELIVERY

**Pitch:** An overconfident boxing bicycle has 45 seconds to deliver a mysterious case through an absurd city; every run becomes a shareable Funny Finish.

**Community:** BIKE TYSON. Exact Solana mainnet mint: `CbyTNf7UPzvewHh4Zp6umogM2RWahhmGRJWLJnPwpump`.

**Playable scope:** One Last Delivery with free practice and Midnight Dispatch, a daily-seeded, denser night variation unlocked by the Delivery Pass. Keyboard and touch controls; original Three.js art; automatic recorded replay; local personal bests.

**Access:** aggregate at least 1,000 BIKE TYSON in unexpired DevFridge locks belonging to the authenticated wallet. Six decimals: `1000000000` raw units. No minimum lock duration. Expired deposits stop counting. Failed/stale lookups revoke UI eligibility; a run continues as practice. No purchase is required to assess the game.

**Identity / access / scores:** single-use, expiring message challenge verified with Ed25519 on the server; fresh direct RPC account checks for the existing DevFridge program; local unverified scores, no prizes and no on-chain score submission.

**Disclosures:** no early withdrawal; 2% redemption fee for PASTA buy-and-burn; separate network costs; non-PASTA redemption requires an executable Jupiter route. The mint's route is not verified, so the game does not offer creation of new locks. Program, mint decimals and extensions must be reviewed again before release.

## Evidence available locally

- Playable local server: http://localhost:4173 . This is not a public showcase URL.
- Source, pinned dependencies and setup: README.md and package-lock.json.
- AI contribution log: BUILD_LOG.md.
- Tests and limitations: VERIFICATION.md and evidence/browser-verification.json.
- Screenshots: evidence/desktop-ready.png, desktop-playing.png, desktop-funny-finish.png, mobile-ready.png, mobile-playing.png and mobile-landscape.png.
- Demonstration replay: evidence/funny-finish-demo.webm. This is a recording of an actual automated practice run, not a human-play or mainnet-wallet claim.
- Mainnet mint observation: evidence/mint-mainnet-2026-09-22.json.
- Art/font/helper provenance: ASSETS.md.

## Still needed before submission

- User's public team alias/contact and review of branding/assets.
- Confirmation of redistribution terms for the supplied skill helper before public source publication.
- Public source repository, immutable commit URL and public HTTPS game URL.
- Physical phone and real Phantom desktop/mobile results; a short showcase demo showing desktop, mobile and honestly labelled gate states.
- Current gallery example schema, validator and PR template fetched at submission time. Do not invent registry metadata or evidence links.

No showcase PR has been opened. When requested, the agent handles GitHub authentication guidance if needed, the fork, branch, validated metadata-only change and PR to `mikeminer/devfridge:master`. Owner review, merge and a successful production deployment publish the gallery card. Dates, prizes and final competition eligibility remain to be announced.
