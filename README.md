# Memory Island

An interactive, procedural 3D travel journal. Ten places, ten fictional memories, one summer to keep.

Built with React, TypeScript, Vite, Three.js, React Three Fiber and Drei. All 3D scenery is generated in code; no paid models, backend, or external image service is required. Fonts are served locally with licenses in `public/fonts`.

## Run locally

Use Node.js 22 LTS or newer.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. To build and serve the production version:

```sh
npm run build
npm run preview
```

`--configLoader runner` is included in the scripts to support the local Windows environment.

## Edit the memories

Edit `src/data/trip.ts`. Each memory has an ID, title, date (`YYYY-MM-DD`), local time, chapter, story, closing note, model kind, and `[latitude, longitude]` in degrees. Keep IDs unchanged to preserve existing local progress. The fictional setting and English stories are editable sample content.

Optional photos: put a file in `public/photos`, then set `image: '/photos/your-photo.jpg'` and a descriptive `imageAlt` on a memory. Optional audio: put a file in `public/audio` and set `trip.audio` to its root-relative path. The audio control is hidden until configured, and playback requires interaction.

The UI derives its total from the memory array. Terrain roads currently connect the ten sample places by index; update `roadPairs` in `src/terrain.ts` if you reorder or remove places.

## Project structure

- `src/App.tsx`: English interface, journal, memory cards, local progress, fullscreen and fallbacks.
- `src/World.tsx`: ocean, clouds, landmark markers, lighting and camera interaction.
- `src/terrain.ts`: geographic layout, elevation, coastlines and road routes.
- `src/Landscape.tsx`: procedural terrain, instanced forest and meadow, bridge, crops and utility poles.
- `src/Details.tsx`: boats, palms, small architecture and decorative objects.
- `src/NewLandmarks.tsx`: garden, stargazing deck, coral cove and café.
- `src/styles.css`: responsive layout, typography, focus styles and motion preferences.
- `src/data/trip.ts`: editable trip and memory content.

## Deploy to Vercel

1. Put this project in a Git repository and import it into Vercel.
2. Set the root directory to the folder containing `package.json`.
3. Select the Vite preset, build command `npm run build`, output directory `dist`.
4. Deploy. No environment variables or backend configuration are required.

Deployment to an external account has not been performed as part of the local implementation.

## Interaction and accessibility

Drag or swipe to rotate, scroll or pinch to zoom. Select a marker or a numbered location to open a memory; select Overview to return. The journal gives keyboard access to every location, including places on the far side. Back-facing markers are hidden and removed from keyboard navigation. Marker labels collapse near the edges and on narrow screens to preserve the view.

Progress is saved in localStorage. Existing progress from the Vietnamese edition is preserved. Icon controls have English accessible labels, visible focus states, and reduced-motion support. WebGL failure shows a readable fallback with access to the journal. Photos that fail to load are hidden.

Trees and ground cover use instancing. Render pixel ratio is capped at 1.5 on phones and 2 on desktop. The scene remains substantial: testing on real target phones and measuring GPU performance is recommended before presenting device-performance claims. Vite reports a size warning for the shared Three.js chunk; the 3D scene is lazy-loaded separately from the interface.

## Portfolio presentation

The miniature-world exploration concept was inspired by daokyuc.vercel.app. This implementation uses its own procedural geometry, layout and fictional copy; it does not bundle assets from that site. Development was assisted by AI. Describe your own contribution accurately when presenting the project, and replace the sample stories with personal material if appropriate.

## Three.js craft details

`src/CraftDetails.tsx` adds 144 instanced curved terracotta tiles, shutter slats, an attic window, a porch lantern, chimney cap, mooring ropes, rope coils, a fishing net, a bucket, water lilies and shoreline reeds. Ropes use `CatmullRomCurve3` and `TubeGeometry`; tiles and vegetation use `InstancedMesh`; the net and curved sails use custom `BufferGeometry`. Repeated details share materials and geometry. These are live 3D meshes, not background illustrations.
