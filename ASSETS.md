# Asset provenance

## Original project work

- Bike Tyson is a newly modeled anthropomorphic bicycle with boxing gloves, sunglasses/headlamp face, crank, spokes, frame, pedals and delivery case. It does not use a real person's facial likeness, tattoos or voice identity.
- All 3D environment/obstacle geometry, shop signs, game UI, icon and colors were created in source for this project. No character or art was copied from DevFridge World or the linked Pump.fun page.
- Asphalt base color and bump maps, shadow texture and sign textures are generated locally by the source. They have no external runtime image dependencies.
- Audio effects are synthesized with Web Audio. Optional narration uses browser speech synthesis and the user's installed voice; it is not a cloned voice and not part of the video export.
- User supplied the Bike Tyson game concept, title, comic direction, sample captions and mint. Brand ownership and final publication consent should be reviewed by the user before public release.

## Fonts

Barlow and Barlow Condensed by Jeremy Tribby, distributed under SIL Open Font License 1.1. Font binaries are self-hosted in `public/fonts/`; both licence files are included there. Sources retrieved 2026-09-22: Google Fonts CSS and its referenced fonts.gstatic.com font URLs; licence sources:

- https://github.com/google/fonts/blob/main/ofl/barlow/OFL.txt
- https://github.com/google/fonts/blob/main/ofl/barlowcondensed/OFL.txt

## Libraries and skill helper

Three.js (MIT), Vite (MIT), TypeScript (Apache-2.0), bs58 (MIT), Playwright (Apache-2.0) and type definitions retain their package licences in the dependency tree. Exact versions/integrity values are pinned in package-lock.json.

`src/timelock-gate.mjs` and its tests originate from the official DevFridge Game Builder 1.4.0 package, explicitly supplied as an integration helper. The distributed skill archive did not include a standalone licence. Attribution is retained here; confirm the helper's redistribution terms with DevFridge before public source publication. This project reads the existing program and does not copy or redeploy its contract implementation. Its own decoder implements documented account offsets rather than importing DevFridge application source.
