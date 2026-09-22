# Asset provenance

## Original project work

- The current character is a procedural, stylized 3D adaptation of the user-supplied image `4905cec7-705d-4bfc-8f62-aa5227fa3abd.webp`. The user requested this visual direction after the original robot bicycle iteration. The model has a muscular body/frame, thin spoked wheels, bare hands on the front axle, feet animated on pedals, black handlebars beside the head and a saddle on the back. It includes the reference-based face and facial tattoo; it must not be described as an unrelated original face or a licensed/scanned likeness. Rights in the reference have not been independently verified.
- `public/character/face.png` was generated with the built-in `image_gen` tool on 2026-09-22 from that reference. No external image service, API key or 3D reconstruction service was used. It is UV-projected onto a curved 3D head surface. Full prompt and provenance are in `public/character/provenance.json`. The source reference itself is not redistributed.
- Body, wheels and drivetrain are geometry created in source; skin pores use a source-generated bump map. Feet use two-bone inverse kinematics, arms animate for a punch, and wheel/crank transforms follow recorded distance. Fixed character meshes are batched by material.
- All 3D environment/obstacle geometry, shop signs, game UI, icon and colors were created in source for this project. No character or art was copied from DevFridge World or the linked Pump.fun page.
- Asphalt base color and bump maps, shadow texture and sign textures are generated locally by the source. They have no external runtime image dependencies.
- Music notes and eight layered sound-effect recipes were composed by Gemini in the user-authorized session on 2026-09-22: https://gemini.google.com/app/5f07a28b972543b7 . The downloaded JSON is preserved verbatim in `src/gemini-score.json`. Codex implemented and validated the renderer, instrument envelopes, mixing, fades, volume limits and gameplay integration. Reproducible WAV previews are in `public/audio/`.
- These are Gemini-composed, locally synthesized sounds, not Lyria recordings. Two Lyria music-generation requests returned errors and produced no audio file.
- Audio effects and both music loops are synthesized with Web Audio. Optional narration uses browser speech synthesis and the user's installed voice; it is not a cloned voice and not part of the video export.
- User supplied the Bike Tyson game concept, title, comic direction, sample captions and mint. Brand ownership and final publication consent should be reviewed by the user before public release.

## Fonts

Barlow and Barlow Condensed by Jeremy Tribby, distributed under SIL Open Font License 1.1. Font binaries are self-hosted in `public/fonts/`; both licence files are included there. Sources retrieved 2026-09-22: Google Fonts CSS and its referenced fonts.gstatic.com font URLs; licence sources:

- https://github.com/google/fonts/blob/main/ofl/barlow/OFL.txt
- https://github.com/google/fonts/blob/main/ofl/barlowcondensed/OFL.txt

## Libraries and skill helper

Three.js (MIT), Vite (MIT), TypeScript (Apache-2.0), bs58 (MIT), Playwright (Apache-2.0) and type definitions retain their package licences in the dependency tree. Exact versions/integrity values are pinned in package-lock.json.

`src/timelock-gate.mjs` and its tests originate from the official DevFridge Game Builder 1.4.0 package, explicitly supplied as an integration helper. The distributed skill archive did not include a standalone licence. Attribution is retained here; confirm the helper's redistribution terms with DevFridge before public source publication. This project reads the existing program and does not copy or redeploy its contract implementation. Its own decoder implements documented account offsets rather than importing DevFridge application source.
