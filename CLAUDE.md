# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

grazer (formerly EMU-webApp) is a Svelte 5 SPA for labeling, visualizing, and correcting speech and derived speech data (spectrograms, waveforms, annotation tiers). Humlab fork of IPS-LMU original (v1.5.3-humlab-1.6.0).

## Commands

```bash
npm install           # install deps
npm start             # dev server (Vite) at http://localhost:5173
npm run build:svelte  # production build to /dist
npm test              # unit tests via Jest (274 tests)
npm run test:jest     # Jest tests only
```

For WebSocket-based dev (loads example DB):
```bash
cd exampleServers && node nodeEmuProtocolWsServer.js
# then open: http://localhost:5173/?autoConnect=true
```

## Architecture

**Fully frontend app** — no backend bundled. Communicates with external EMU Protocol servers via WebSocket, or loads data via GET params/demo DBs.

**Stack:** Svelte 5 + TypeScript 5 + Vite + D3.js 5 + HTML5 Canvas

### Key Layers

- **`src/core/services/`** — 38 framework-agnostic services (pure TS classes with `initDeps()` pattern):
  - `io-handler.service` / `websocket-handler.service` — data loading/saving, WebSocket comms
  - `draw-helper.service` / `view-state.service` — canvas rendering state
  - `handleglobalkeystrokes.service` — keyboard interaction (action-map pattern)
  - `config-provider.service` — URL params, deployment settings
  - `history.service` / `validation.service` — undo/redo and schema validation

- **`src/core/interfaces/`** — TypeScript interfaces (IViewPort, ISsffFile, IAnnotJSON, etc.)

- **`src/core/workers/`** — Web Workers for heavy parsing (TextGrid, SSFF, ESPS, spectrogram drawing, WAV range requests)

- **`src/core/util/`** — Shared utilities (http-get, deep-copy, event-bus, safe-storage)

- **`src/svelte-app/`** — Svelte 5 UI layer:
  - `stores/services.ts` — service DI container (replaces Angular DI)
  - `components/` — Svelte components (oscillogram, spectrogram, annotation levels, hierarchy)

- **`src/demoDBs/`** — example speech databases for offline/dev use

- **`src/configFiles/`** / **`src/schemaFiles/`** — JSON config and EMU database schema definitions

### Testing

Tests use `test/angular-compat.js` shim that emulates Angular DI for existing test files. The shim creates fresh service instances per test suite via `createFreshServices()`. No test files were modified during migration.

### Data Flow

External EMU Protocol server (WebSocket) or URL params → `io-handler.service` → core services → Svelte stores → Canvas renderers (D3 + raw Canvas API) + Svelte components

### Build

Vite with Svelte plugin. TypeScript compiled targeting ES2020.
