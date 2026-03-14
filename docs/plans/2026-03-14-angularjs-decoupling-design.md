# AngularJS Decoupling — Phase 0 Design

## Goal

Make all 36 services pure TypeScript classes with no AngularJS imports, except 4 services that retain `$rootScope.$apply()` until framework swap.

## Audit Findings

| AngularJS Primitive | Files | Instances | Replacement |
|---|---|---|---|
| `$q` | 14 | ~57 | `Promise` / `async-await` |
| `$rootScope` | 6 | ~16 | RxJS Subject event bus + keep `$apply` |
| `$http` | 3 | ~9 | `fetch()` |
| `$timeout` | 3 | few | `setTimeout` |
| `$window` | 3 | few | `window` |
| `$log` | 3 | few | `console` |
| `$location` | 2 | few | `URL` API |
| `$compile` + `$sce` | 1 | 2 | DOM API |
| Already decoupled | 12 | — | No work needed |

## Strategy

Replace one AngularJS primitive at a time across all services. Each step is independently testable and committable.

### Step 1: `$q` → native `Promise` / `async-await` (14 files)

Files: anagest, audio-resampler, config-provider, db-obj-load-save, drag-n-drop-data, drag-n-drop, esps-parser, io-handler, modal, ssff-parser, textgrid-parser, validation, wav-parser, websocket-handler

Patterns:
- `$q.defer()` → `new Promise((resolve, reject) => { ... })`
- `$q.all([...])` → `Promise.all([...])`
- `deferred.promise` → return the Promise directly
- `deferred.resolve(x)` / `reject(x)` → call resolve/reject closures
- Remove `$q` from constructor injection and `$inject` arrays

### Step 2: `$http` → `fetch` (3 files)

Files: db-obj-load-save, io-handler, validation

Patterns:
- `$http.get(url)` → `fetch(url).then(r => r.json())`
- `$http.get(url, {responseType: 'arraybuffer'})` → `fetch(url).then(r => r.arrayBuffer())`
- io-handler already partially migrated to fetch

### Step 3: Trivial replacements (6 files)

- `$timeout(fn, ms)` → `setTimeout(fn, ms)` — handleglobalkeystrokes, view-state, websocket-handler
- `$window` → `window` — drag-n-drop, sound-handler, wav-parser
- `$log` → `console` — app-state, db-obj-load-save, publisher
- `$location.search()` → `new URLSearchParams(window.location.search)` — app-state, io-handler

### Step 4: `$rootScope` event bus → RxJS Subject (2 files)

Create `src/app/event-bus.ts` with typed RxJS Subjects for app-wide events.

Events to model (from audit):
- app-state: broadcasts global state reset/reload
- websocket-handler: broadcasts connection state changes

Patterns:
- `$rootScope.$broadcast('event', data)` → `eventBus.event$.next(data)`
- `$rootScope.$on('event', cb)` → `eventBus.event$.subscribe(cb)`

Keep `$rootScope.$apply()` in 4 services (view-state, handleglobalkeystrokes, websocket-handler, drag-n-drop) — removed during framework swap.

### Step 5: `$compile` + `$sce` (1 file)

File: history.service

- `$sce.trustAsHtml(str)` → raw string (content is hardcoded `<i>UNDO</i>`)
- `$compile` — assess if still needed

## What stays AngularJS (for now)

- Service registration in `services/index.ts`
- `$rootScope.$apply()` in 4 services
- Components, directives, controllers (separate future work)

## Testing

- `npm test` after each step (262 Jest tests must pass)
- `npm run test:workers` (25 worker tests must pass)
- Manual smoke test: `?autoConnect=true`, verify annotation editing

## Risk

| Step | Risk | Reason |
|------|------|--------|
| 1. $q→Promise | Medium | Largest change (14 files); promise chain semantics differ slightly |
| 2. $http→fetch | Low | Straightforward API swap |
| 3. Trivial | Low | Drop-in replacements |
| 4. Event bus | Medium | Behavioral change in event propagation |
| 5. $compile/$sce | Low | Single file |

## Decision Log

- Event bus: RxJS Subject (already in project, typed)
- Strategy: By primitive, not by service or by layer
- $apply: Keep until framework swap (pragmatic, less abstraction)
