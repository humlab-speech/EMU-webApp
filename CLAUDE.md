# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

grazer (formerly EMU-webApp) is an AngularJS 1.8 SPA for labeling, visualizing, and correcting speech and derived speech data (spectrograms, waveforms, annotation tiers). This is a Humlab fork of the IPS-LMU original (v1.5.3-humlab-1.5.3).

## Commands

```bash
npm install           # install deps
npm start             # dev server at http://localhost:9000
npm run build         # production build to /dist
npm test              # unit tests via Jest (247 tests)
npm run test:jest     # Jest tests only
npm run test:karma    # Karma tests (legacy)
```

For WebSocket-based dev (loads example DB):
```bash
cd exampleServers && node nodeEmuProtocolWsServer.js
# then open: http://localhost:9000/?autoConnect=true
```

For GET-param-based dev (no WebSocket needed):
```
http://localhost:9000/?audioGetUrl=http:%2F%2Flocalhost:9000%2FdemoDBs%2Fae%2Fmsajc003.wav&labelGetUrl=http:%2F%2Flocalhost:9000%2FdemoDBs%2Fae%2Fmsajc003_annot.json&labelType=annotJSON
```

## Architecture

**Fully frontend app** — no backend bundled. Communicates with external EMU Protocol servers via WebSocket, or loads data via GET params/demo DBs.

**Stack:** AngularJS 1.8 + TypeScript 3.8 + Webpack 4 + D3.js 5 + HTML5 Canvas

### Key Layers

- **`src/app/services/`** — 38 services with core logic:
  - `io-handler.service` / `websocket-handler.service` — data loading/saving, WebSocket comms
  - `draw-helper.service` / `view-state.service` — canvas rendering state
  - `handleglobalkeystrokes.service` (81KB) — keyboard interaction handling
  - `config-provider.service` — URL params, deployment settings
  - `history.service` / `validation.service` — undo/redo and schema validation

- **`src/app/components/`** — 24 UI components (oscillogram, spectrogram, annotation levels, hierarchy viewer)

- **`src/app/workers/`** — Web Workers for heavy parsing (TextGrid, SSFF, ESPS formats, spectrogram drawing). Uses Comlink for Worker abstraction.

- **`src/demoDBs/`** — example speech databases for offline/dev use

- **`src/configFiles/`** / **`src/schemaFiles/`** — JSON config and EMU database schema definitions

### Data Flow

External EMU Protocol server (WebSocket) or URL params → `io-handler.service` → AngularJS services → Canvas renderers (D3 + raw Canvas API) + annotation tier components

### Build

Webpack configs are split: `webpack.common.js` (shared), `webpack.dev.js` (source maps, dev server port 9000), `webpack.prod.js` (minified output to `/dist`, copies views/schemas/demoDBs).

TypeScript is compiled via ts-loader targeting ES5/ES6 modules with decorator support.
