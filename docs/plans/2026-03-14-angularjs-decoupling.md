# AngularJS Decoupling Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove all AngularJS primitive dependencies (`$q`, `$http`, `$log`, `$timeout`, `$window`, `$location`, `$sce`, `$compile`) from 24 services, replacing with native browser APIs. Keep `$rootScope.$apply()` in 4 services until framework swap. Replace `$rootScope.$broadcast/$on` with RxJS Subject event bus.

**Architecture:** Each service class becomes pure TypeScript — no AngularJS imports in the class body. The `angular.module().service()` registration at the bottom of each file stays (it's the DI wiring layer removed during framework swap). Services that used `$q` now return native `Promise`. Services that used `$http` now use `fetch()`.

**Tech Stack:** TypeScript, native Promise/async-await, fetch API, RxJS Subject (for event bus)

**Testing:** `npm test` (262 Jest tests) + `npm run test:workers` (25 tests) after each task. Smoke test via `npm start` → `?autoConnect=true` after major tasks.

---

## Task 1: `$q` → `Promise` — Simple sync-resolve services

**Files:**
- Modify: `src/app/services/config-provider.service.ts`
- Modify: `src/app/services/drag-n-drop-data.service.ts`
- Modify: `src/app/services/io-handler.service.ts` (3 methods only — `getProtocol`, `getDoUserManagement`, `parseLabelFile`)

These services create a `$q.defer()`, immediately resolve it, and return `defer.promise`. Replace with `Promise.resolve(value)`.

**Step 1: config-provider.service.ts**

Remove `$q` from constructor and `$inject`. Replace `getDelta`:

```typescript
// BEFORE
public getDelta(current) {
    var defer = this.$q.defer();
    var ret = this.getDeltas(current, this.initDbConfig);
    defer.resolve(ret);
    return defer.promise;
}

// AFTER
public getDelta(current) {
    var ret = this.getDeltas(current, this.initDbConfig);
    return Promise.resolve(ret);
}
```

Update registration from `['$q', 'ViewStateService', ConfigProviderService]` to `['ViewStateService', ConfigProviderService]`. Remove `$q` from constructor params.

**Step 2: drag-n-drop-data.service.ts**

Remove `$q` from constructor and `$inject`. Replace `getBundle`:

```typescript
// BEFORE
public getBundle(name) {
    var defer = this.$q.defer();
    this.convertedBundles.forEach((bundle) => {
        if (bundle.name === name) {
            var bc = angular.copy(bundle);
            delete bc.name;
            defer.resolve({ status: 200, data: bc });
        }
    });
    return defer.promise;
}

// AFTER
public getBundle(name) {
    return new Promise((resolve) => {
        this.convertedBundles.forEach((bundle) => {
            if (bundle.name === name) {
                var bc = angular.copy(bundle);
                delete bc.name;
                resolve({ status: 200, data: bc });
            }
        });
    });
}
```

Update registration to remove `'$q'`.

**Step 3: io-handler.service.ts — 3 sync methods only**

Replace three methods that use `$q.defer()` for immediate resolve. Do NOT touch `$http` or `$rootScope` yet.

```typescript
// getProtocol() GITLAB branch — BEFORE
var defer = this.$q.defer();
defer.resolve({ protocol: 'EMU-webApp-websocket-protocol', version: '0.0.2' });
getProm = defer.promise;

// AFTER
getProm = Promise.resolve({ protocol: 'EMU-webApp-websocket-protocol', version: '0.0.2' });
```

Same pattern for `getDoUserManagement()` GITLAB branch and `parseLabelFile()` annotJSON branch.

Remove `$q` from constructor and `$inject` array. Keep `$rootScope`, `$http`, `$location`, `$window`.

**Step 4: Run tests**

```bash
npm test
```

Expected: 262 tests pass, 0 failures.

**Step 5: Commit**

```bash
git add -A && git commit -m "refactor: $q→Promise — config-provider, drag-n-drop-data, io-handler (sync)"
```

---

## Task 2: `$q` → `Promise` — Worker-callback services

**Files:**
- Modify: `src/app/services/esps-parser.service.ts`
- Modify: `src/app/services/textgrid-parser.service.ts`
- Modify: `src/app/services/modal.service.ts`

These services store `this.defer = this.$q.defer()` as instance state, then resolve it from a Worker `onmessage` callback or UI callback. Replace `this.defer` with stored `resolve`/`reject` functions.

**Pattern:**

```typescript
// BEFORE
public asyncParseEsps(esps, annotates, name) {
    this.defer = this.$q.defer();
    this.worker.tell({ cmd: 'parseESPS', ... });
    return this.defer.promise;
}
// (somewhere in onmessage callback)
this.defer.resolve(result);

// AFTER
private _resolve: ((value: any) => void) | null = null;
private _reject: ((reason: any) => void) | null = null;

public asyncParseEsps(esps, annotates, name) {
    return new Promise((resolve, reject) => {
        this._resolve = resolve;
        this._reject = reject;
        this.worker.tell({ cmd: 'parseESPS', ... });
    });
}
// (somewhere in onmessage callback)
this._resolve(result);
```

**Step 1: esps-parser.service.ts**

Replace `this.defer` pattern in `asyncParseEsps` and `asyncParseJSO`. Find the worker `onmessage` handler and replace `this.defer.resolve()`/`this.defer.reject()` with `this._resolve()`/`this._reject()`. Remove `$q` from constructor and `$inject`.

**Step 2: textgrid-parser.service.ts**

Same pattern for `asyncToTextGrid` and `asyncParseTextGrid`. Remove `$q` from constructor and `$inject`.

**Step 3: modal.service.ts**

Replace `this.defer` in `open()`. The modal resolves via a `close()` or `confirm()` method that calls `this.defer.resolve(result)`. Replace with stored `_resolve`/`_reject`. Remove `$q` from constructor and `$inject`.

**Step 4: Run tests**

```bash
npm test
```

Expected: 262 tests pass.

**Step 5: Commit**

```bash
git add -A && git commit -m "refactor: $q→Promise — esps-parser, textgrid-parser, modal (worker/callback)"
```

---

## Task 3: `$q` → `Promise` — Try-catch and AudioContext services

**Files:**
- Modify: `src/app/services/audio-resampler.service.ts`
- Modify: `src/app/services/ssff-parser.service.ts`
- Modify: `src/app/services/wav-parser.service.ts`

**Step 1: audio-resampler.service.ts**

`resampleWavBuffer` uses try-catch with defer. Direct replacement:

```typescript
// BEFORE
public resampleWavBuffer(buf, headerInfos, targetRate) {
    var defer = this.$q.defer();
    try {
        // ... computation ...
        defer.resolve({ originalBuffer, resampledWavBuf: outBuf });
    } catch (e) {
        defer.reject({ status: { type: 'ERROR', message: 'Resampling failed: ' + e.message } });
    }
    return defer.promise;
}

// AFTER
public resampleWavBuffer(buf, headerInfos, targetRate) {
    return new Promise((resolve, reject) => {
        try {
            // ... computation unchanged ...
            resolve({ originalBuffer, resampledWavBuf: outBuf });
        } catch (e) {
            reject({ status: { type: 'ERROR', message: 'Resampling failed: ' + e.message } });
        }
    });
}
```

Remove `$q` from constructor and `$inject`.

**Step 2: ssff-parser.service.ts**

Four methods use `$q`: `mainThreadParseSsffArr`, `mainThreadJso2ssff` (try-catch pattern), `asyncParseSsffArr`, `asyncJso2ssff` (worker-callback pattern). Apply try-catch pattern to first two, worker-callback pattern (from Task 2) to last two. Remove `$q` from constructor and `$inject`.

**Step 3: wav-parser.service.ts**

`parseWavAudioBuf` and `decodeResampledForPlayback` use `$q.defer()` with AudioContext callbacks. Replace:

```typescript
// BEFORE
this.defer = this.$q.defer();
offlineCtx.decodeAudioData(buf,
    (decodedData) => { this.defer.resolve({ audioBuffer: decodedData, playbackBuffer: null }); },
    (error) => { this.defer.reject(error); });
return this.defer.promise;

// AFTER
return new Promise((resolve, reject) => {
    offlineCtx.decodeAudioData(buf,
        (decodedData) => { resolve({ audioBuffer: decodedData, playbackBuffer: null }); },
        (error) => { reject(error); });
});
```

Note: `wav-parser` also uses `$window` for `AudioContext`/`OfflineAudioContext`. Replace `this.$window.AudioContext` → `window.AudioContext` etc. at the same time. Remove both `$q` and `$window` from constructor and `$inject`.

**Step 4: Run tests**

```bash
npm test
```

Expected: 262 tests pass.

**Step 5: Commit**

```bash
git add -A && git commit -m "refactor: $q→Promise — audio-resampler, ssff-parser, wav-parser"
```

---

## Task 4: `$q` → `Promise` — websocket-handler

**Files:**
- Modify: `src/app/services/websocket-handler.service.ts`

This is the most complex `$q` usage. Three patterns:

**Step 1: `initConnect`**

```typescript
// BEFORE
public initConnect(url) {
    var defer = this.$q.defer();
    try {
        this.ws = new WebSocket(url);
        // ...
    } catch (err) {
        return this.$q.reject('A malformed websocket URL...');
    }
    this.conPromise = defer;
    return defer.promise;
}

// AFTER
public initConnect(url) {
    return new Promise((resolve, reject) => {
        try {
            this.ws = new WebSocket(url);
            this.ws.onopen = this.wsonopen.bind(this);
            this.ws.onmessage = this.wsonmessage.bind(this);
            this.ws.onerror = this.wsonerror.bind(this);
            this.ws.onclose = this.wsonclose.bind(this);
        } catch (err) {
            reject('A malformed websocket URL...');
            return;
        }
        this.conPromise = { resolve, reject };
    });
}
```

**Step 2: `sendRequest`**

The callbacks map stores `{ time, cb: defer }` where `defer.resolve`/`defer.reject` are called from `listener()`. Replace:

```typescript
// BEFORE
private sendRequest(request) {
    var defer = this.$q.defer();
    var callbackId = this.getCallbackId();
    this.callbacks[callbackId] = { time: new Date(), cb: defer };
    // ...
    return defer.promise;
}
// In listener: this.callbacks[id].cb.resolve(data)

// AFTER
private sendRequest(request) {
    return new Promise((resolve, reject) => {
        var callbackId = this.getCallbackId();
        this.callbacks[callbackId] = { time: new Date(), cb: { resolve, reject } };
        // ...
    });
}
// In listener: this.callbacks[id].cb.resolve(data) — unchanged!
```

The `cb.resolve()`/`cb.reject()` interface stays identical — the callbacks map just stores the Promise executor functions instead of a deferred object.

**Step 3: Update `listener()` and `wsonopen()`**

Check that `this.conPromise.resolve()` and `this.callbacks[id].cb.resolve()` still work with the new shape. They should — the interface is the same (`{ resolve, reject }`).

Remove `$q` from constructor and `$inject`. Keep `$rootScope`, `$location`, `$timeout`.

**Step 4: Run tests**

```bash
npm test
```

Expected: 262 tests pass.

**Step 5: Commit**

```bash
git add -A && git commit -m "refactor: $q→Promise — websocket-handler (request/response callbacks)"
```

---

## Task 5: `$q` → `Promise` — db-obj-load-save

**Files:**
- Modify: `src/app/services/db-obj-load-save.service.ts`

Most complex service (19 deps). Three methods use `$q`:

**Step 1: `saveBundle`**

```typescript
// BEFORE
public saveBundle() {
    if (this.ViewStateService.getPermission('saveBndlBtnClick')) {
        var defer = this.$q.defer();
        // ...
        return defer.promise;
    }
}

// AFTER
public saveBundle() {
    if (this.ViewStateService.getPermission('saveBndlBtnClick')) {
        return new Promise((resolve, reject) => {
            // ... replace defer.resolve() → resolve(), defer.reject() → reject()
        });
    }
    return undefined; // preserves existing behavior
}
```

**Step 2: `loadBundle`**

This method creates a defer at the top and passes it to `innerLoadBundle`. Refactor:

```typescript
// BEFORE
public loadBundle(bndl, url) {
    var defer = this.$q.defer();
    // ... deep nesting ... eventually calls:
    this.innerLoadBundle(bndl, bundleData, arrBuff, defer);
    return defer.promise;
}

// AFTER
public loadBundle(bndl, url) {
    return new Promise((resolve, reject) => {
        // ... same logic but pass resolve/reject instead of defer
        this.innerLoadBundle(bndl, bundleData, arrBuff, { resolve, reject });
    });
}
```

Update `innerLoadBundle` signature: `defer` param becomes `{ resolve, reject }`.

**Step 3: `innerLoadBundle` — replace `$q.all` and dummy promise**

```typescript
// BEFORE
var d = this.$q.defer();
promises.push(d.promise);
d.resolve();
// ...
this.$q.all(promises).then(...)

// AFTER
promises.push(Promise.resolve());
// ...
Promise.all(promises).then(...)
```

Remove `$q` from constructor and `$inject`. Keep `$log`, `$http`.

**Step 4: Run tests**

```bash
npm test
```

Expected: 262 tests pass (including the 13 dbObjLoadSave tests).

**Step 5: Commit**

```bash
git add -A && git commit -m "refactor: $q→Promise — db-obj-load-save (loadBundle, saveBundle)"
```

---

## Task 6: `$q` → `Promise` — anagest, drag-n-drop, validation

**Files:**
- Modify: `src/app/services/anagest.service.ts`
- Modify: `src/app/services/drag-n-drop.service.ts`
- Modify: `src/app/services/validation.service.ts`

**Step 1: validation.service.ts**

Only usage is `$q.all()` in `loadSchemas()`. This will be replaced in Task 7 alongside `$http` since they're in the same method:
```typescript
proms.push(this.$http.get(uri));
return this.$q.all(proms);
```
Skip for now — handled in Task 7. Just remove `$q` from constructor, replace `$q.all` → `Promise.all`.

**Step 2: anagest.service.ts**

`insertAnagestEvents` and `interactiveFindThresholds` use `$q.defer()`. Replace with `new Promise(...)`. Note: `insertAnagestEvents` has a bug where it returns `defer` (not `defer.promise`) on the error path — preserve this behavior.

Remove `$q` from constructor and `$inject`.

**Step 3: drag-n-drop.service.ts**

`convertDragnDropData` uses recursive `$q.defer()` with FileReader callbacks. Replace:

```typescript
// BEFORE
public convertDragnDropData(bundles, i) {
    var defer = this.$q.defer();
    // ... FileReader onloadend → defer.resolve()
    return defer.promise;
}

// AFTER
public convertDragnDropData(bundles, i) {
    return new Promise((resolve, reject) => {
        // ... FileReader onloadend → resolve()
    });
}
```

Remove `$q` from constructor and `$inject`. Keep `$rootScope`, `$window`.

**Step 4: Run tests**

```bash
npm test
```

Expected: 262 tests pass.

**Step 5: Commit**

```bash
git add -A && git commit -m "refactor: $q→Promise — anagest, drag-n-drop, validation"
```

---

## Task 7: `$http` → `fetch`

**Files:**
- Modify: `src/app/services/io-handler.service.ts`
- Modify: `src/app/services/validation.service.ts`
- Modify: `src/app/services/db-obj-load-save.service.ts`

**Critical difference:** `$http.get()` returns `{ status, data, ... }`. `fetch()` returns a `Response` object. Many callers check `if (bundleData.status === 200) { bundleData = bundleData.data; }`. We must preserve this shape OR update all callers.

**Strategy:** Create a thin wrapper that returns the same `{ status, data }` shape:

```typescript
// Add to each file that needs it, or extract to a shared util
function httpGet(url: string, responseType?: string): Promise<any> {
    return fetch(url).then(response => {
        if (responseType === 'arraybuffer') {
            return response.arrayBuffer().then(data => ({ status: response.status, data }));
        }
        return response.json().then(data => ({ status: response.status, data }));
    });
}
```

**Step 1: Create `src/app/http-util.ts`**

```typescript
export function httpGet(url: string, responseType?: string, headers?: Record<string, string>): Promise<{ status: number; data: any }> {
    const opts: RequestInit = {};
    if (headers) {
        opts.headers = headers;
    }
    return fetch(url, opts).then(response => {
        if (responseType === 'arraybuffer') {
            return response.arrayBuffer().then(data => ({ status: response.status, data }));
        }
        return response.json().then(data => ({ status: response.status, data }));
    });
}
```

**Step 2: io-handler.service.ts**

Replace all `this.$http.get(...)` calls with `httpGet(...)`:

```typescript
// BEFORE
public httpGetDefaultConfig() {
    var prom = this.$http.get('configFiles/default_grazerConfig.json');
    return prom;
}

// AFTER
import { httpGet } from '../http-util';
public httpGetDefaultConfig() {
    return httpGet('configFiles/default_grazerConfig.json');
}
```

```typescript
// BEFORE
public httpGetPath(path, respType, ignoreComMode = false) {
    if (...) {
        var prom = this.$http.get(path, { responseType: respType });
    }
}

// AFTER
public httpGetPath(path, respType, ignoreComMode = false) {
    if (...) {
        var prom = httpGet(path, respType);
    }
}
```

Remove `$http` from constructor and `$inject`.

**Step 3: validation.service.ts**

```typescript
// BEFORE
public loadSchemas() {
    var proms = [];
    this.names.forEach((n) => {
        uri = 'schemaFiles/' + n + '.json';
        proms.push(this.$http.get(uri));
    });
    return this.$q.all(proms);
}

// AFTER
import { httpGet } from '../http-util';
public loadSchemas() {
    var proms = [];
    this.names.forEach((n) => {
        var uri = 'schemaFiles/' + n + '.json';
        proms.push(httpGet(uri));
    });
    return Promise.all(proms);
}
```

Remove `$http` and `$q` from constructor and `$inject`.

**Step 4: db-obj-load-save.service.ts**

Single usage: `this.$http.get(url)` in `loadBundle`. Replace:

```typescript
// BEFORE
var promise = this.$http.get(url);

// AFTER
import { httpGet } from '../http-util';
var promise = httpGet(url);
```

Remove `$http` from constructor and `$inject`.

**Step 5: Run tests**

```bash
npm test
```

Expected: 262 tests pass.

**Step 6: Commit**

```bash
git add -A && git commit -m "refactor: $http→fetch — io-handler, validation, db-obj-load-save"
```

---

## Task 8: Trivial replacements — `$log`, `$window`, `$timeout`, `$location`

**Files:**
- Modify: `src/app/services/app-state.service.ts` (`$log`, `$location`)
- Modify: `src/app/services/db-obj-load-save.service.ts` (`$log`)
- Modify: `src/app/services/history.service.ts` (`$log`)
- Modify: `src/app/services/publisher.service.ts` (`$log`)
- Modify: `src/app/services/anagest.service.ts` (`$log`)
- Modify: `src/app/services/sound-handler.service.ts` (`$window`)
- Modify: `src/app/services/drag-n-drop.service.ts` (`$window`)
- Modify: `src/app/services/websocket-handler.service.ts` (`$timeout`)
- Modify: `src/app/services/io-handler.service.ts` (`$location`)

**Step 1: `$log` → `console` (5 files)**

In each file, replace `this.$log.info(...)` → `console.info(...)`, `this.$log.warn(...)` → `console.warn(...)`, `this.$log.error(...)` → `console.error(...)`. Remove `$log` from constructor and `$inject`.

**Step 2: `$window` → `window` (2 files)**

- `sound-handler.service.ts`: `this.$window.AudioContext || this.$window.webkitAudioContext` → `window.AudioContext || (window as any).webkitAudioContext`. Remove `$window` from constructor and `$inject`.
- `drag-n-drop.service.ts`: Already sets `this.$window = window` in constructor. Just remove `$window` from `$inject` and use `window` directly.

Note: wav-parser.service.ts `$window` was already removed in Task 3.

**Step 3: `$timeout` → `setTimeout` (1 file)**

`websocket-handler.service.ts`: The `$timeout` in `sendRequest` is used for request timeout. Replace:

```typescript
// BEFORE
this.$timeout(() => { ... }, this.ConfigProviderService.vals.main.serverTimeoutInterval);

// AFTER
setTimeout(() => { ... }, this.ConfigProviderService.vals.main.serverTimeoutInterval);
```

Remove `$timeout` from constructor and `$inject`.

Note: `handleglobalkeystrokes.service.ts` and `view-state.service.ts` also inject `$timeout`. Check if they actually use it — if injected but unused, just remove from constructor and `$inject`.

**Step 4: `$location` → URL API (2 files)**

`$location.search()` returns an object of query params. Replace with:

```typescript
// Utility (add to each file or http-util.ts)
function getSearchParams(): Record<string, string> {
    const params: Record<string, string> = {};
    new URLSearchParams(window.location.search).forEach((v, k) => { params[k] = v; });
    return params;
}
```

- `io-handler.service.ts`: Replace `this.$location.search()` → `getSearchParams()`. Replace `this.$location.search('privateToken', null).replace()` → `const url = new URL(window.location.href); url.searchParams.delete('privateToken'); window.history.replaceState({}, '', url.toString());`
- `app-state.service.ts`: Replace `this.$location.url(this.$location.path())` → `window.history.replaceState({}, '', window.location.pathname)`.

Remove `$location` from constructor and `$inject` in both files.

**Step 5: Run tests**

```bash
npm test
```

Expected: 262 tests pass.

**Step 6: Commit**

```bash
git add -A && git commit -m "refactor: trivial AngularJS removals — $log, $window, $timeout, $location"
```

---

## Task 9: `$rootScope.$broadcast/$on` → RxJS Subject event bus

**Files:**
- Create: `src/app/event-bus.ts`
- Modify: `src/app/services/app-state.service.ts`
- Modify: `src/app/services/websocket-handler.service.ts`
- Modify: `src/app/services/handleglobalkeystrokes.service.ts`

**Step 1: Create `src/app/event-bus.ts`**

From audit, there are 3 event types broadcast:

```typescript
import { Subject } from 'rxjs';

export interface ReloadEvent {
    url: string;
    session: string;
    reload: boolean;
}

// Singleton event bus — replaces $rootScope.$broadcast/$on
export const appEvents = {
    resetToInitState$: new Subject<void>(),
    reloadToInitState$: new Subject<ReloadEvent>(),
    connectionDisrupted$: new Subject<void>()
};
```

**Step 2: app-state.service.ts — replace $broadcast**

```typescript
// BEFORE
this.$rootScope.$broadcast('resetToInitState');
// AFTER
import { appEvents } from '../event-bus';
appEvents.resetToInitState$.next();

// BEFORE
this.$rootScope.$broadcast('reloadToInitState', {url, session, reload: true});
// AFTER
appEvents.reloadToInitState$.next({url, session, reload: true});
```

Remove `$rootScope` from constructor and `$inject`.

**Step 3: websocket-handler.service.ts — replace $broadcast**

```typescript
// BEFORE
this.$rootScope.$broadcast('resetToInitState');
// AFTER
import { appEvents } from '../event-bus';
appEvents.resetToInitState$.next();

// BEFORE
this.$rootScope.$broadcast('connectionDisrupted');
// AFTER
appEvents.connectionDisrupted$.next();
```

Keep `$rootScope` in this file — it still uses `$rootScope.$apply()`.

**Step 4: Find and update all `$rootScope.$on` listeners**

Search for `$on('resetToInitState'`, `$on('reloadToInitState'`, `$on('connectionDisrupted'` in components/controllers. These are likely in component files, not services. For each:

```typescript
// BEFORE (in a component)
$rootScope.$on('resetToInitState', () => { ... });

// AFTER
import { appEvents } from '../event-bus';
const sub = appEvents.resetToInitState$.subscribe(() => { ... });
// In $onDestroy: sub.unsubscribe();
```

**Step 5: handleglobalkeystrokes.service.ts — `$on('$destroy')`**

This listens to `$destroy` which is an AngularJS lifecycle event, not a custom broadcast. This is used to clean up jQuery event listeners. Leave this as-is — it's tied to AngularJS component lifecycle. Document as "removed during framework swap".

**Step 6: Run tests**

```bash
npm test
```

Expected: 262 tests pass.

**Step 7: Commit**

```bash
git add -A && git commit -m "refactor: $rootScope events → RxJS Subject event bus"
```

---

## Task 10: `$compile` + `$sce` cleanup — history.service

**Files:**
- Modify: `src/app/services/history.service.ts`

**Step 1: Remove `$compile`**

`$compile` is injected but never called. Remove from constructor and `$inject`.

**Step 2: Replace `$sce.trustAsHtml`**

```typescript
// BEFORE
public setHistoryActionText(isUndo, text) {
    var front = '<i>UNDO</i> &#8594; ';
    if (!isUndo) {
        front = '<i>REDO</i> &#8592; ';
    }
    this.ViewStateService.historyActionTxt = this.$sce.trustAsHtml(front + text);
}

// AFTER
public setHistoryActionText(isUndo, text) {
    var front = '<i>UNDO</i> &#8594; ';
    if (!isUndo) {
        front = '<i>REDO</i> &#8592; ';
    }
    this.ViewStateService.historyActionTxt = front + text;
}
```

Note: The template consuming `historyActionTxt` likely uses `ng-bind-html`. Since `$sce.trustAsHtml` is removed, the template needs `ng-bind-html` to still work. AngularJS 1.8 with `$sanitize` module will sanitize `<i>` tags (they're safe). If the template uses `ng-bind-html="historyActionTxt"` this will work because AngularJS auto-sanitizes if `angular-sanitize` is loaded. Check if `angular-sanitize` is a dependency — if not, the `<i>` tags might be stripped. In that case, just keep the raw string and accept the `<i>` tags get sanitized (the text still shows, just without italics).

Remove `$sce` from constructor and `$inject`.

**Step 3: Run tests**

```bash
npm test
```

Expected: 262 tests pass.

**Step 4: Commit**

```bash
git add -A && git commit -m "refactor: remove $compile/$sce — history.service"
```

---

## Task 11: Final verification and cleanup

**Step 1: Verify no remaining AngularJS primitives (except $rootScope.$apply)**

```bash
grep -r '\$q\b' src/app/services/ --include="*.ts" | grep -v '\.d\.ts' | grep -v node_modules
grep -r '\$http\b' src/app/services/ --include="*.ts" | grep -v '\.d\.ts'
grep -r '\$log\b' src/app/services/ --include="*.ts" | grep -v '\.d\.ts'
grep -r '\$timeout\b' src/app/services/ --include="*.ts" | grep -v '\.d\.ts'
grep -r '\$window\b' src/app/services/ --include="*.ts" | grep -v '\.d\.ts'
grep -r '\$location\b' src/app/services/ --include="*.ts" | grep -v '\.d\.ts'
grep -r '\$sce\b' src/app/services/ --include="*.ts" | grep -v '\.d\.ts'
grep -r '\$compile\b' src/app/services/ --include="*.ts" | grep -v '\.d\.ts'
```

Expected: No matches.

```bash
grep -r '\$rootScope' src/app/services/ --include="*.ts" | grep -v '\.d\.ts'
```

Expected: Only `$rootScope.$apply` in view-state, handleglobalkeystrokes, websocket-handler, and possibly drag-n-drop. These are documented as "kept until framework swap".

**Step 2: Run full test suite**

```bash
npm test && npm run test:workers
```

Expected: 262 + 25 = 287 tests pass.

**Step 3: Smoke test**

```bash
npm start
# Open http://localhost:9000/?autoConnect=true
# Verify: annotation loads, playback works, hierarchy view works, bundle switching works
```

**Step 4: Commit if any cleanup needed**

```bash
git add -A && git commit -m "refactor: AngularJS decoupling Phase 0 complete — verify clean state"
```

---

## Summary

| Task | What | Files | Risk |
|------|------|-------|------|
| 1 | $q→Promise: sync-resolve | 3 | Low |
| 2 | $q→Promise: worker-callback | 3 | Low |
| 3 | $q→Promise: AudioContext/try-catch | 3 | Medium |
| 4 | $q→Promise: websocket-handler | 1 | Medium |
| 5 | $q→Promise: db-obj-load-save | 1 | Medium |
| 6 | $q→Promise: anagest, drag-n-drop, validation | 3 | Medium |
| 7 | $http→fetch | 3 (+1 new) | Low |
| 8 | Trivial: $log, $window, $timeout, $location | 9 | Low |
| 9 | Event bus: $rootScope.$broadcast → RxJS Subject | 3 (+1 new) | Medium |
| 10 | $compile/$sce cleanup | 1 | Low |
| 11 | Final verification | 0 | Low |

**After completion:** 24 services fully decoupled from AngularJS primitives. 4 services retain only `$rootScope.$apply()`. 12 services were already decoupled. All 36 service classes are pure TypeScript with native browser APIs.
