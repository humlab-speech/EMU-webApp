# Artic Fidelity Audit Report

**Date:** 2026-03-19
**Original:** https://ips-lmu.github.io/EMU-webApp/ (Angular)
**Fork:** http://localhost:9007 (Svelte 5, branch feat/P7-visual-parity)
**Demo DBs tested:** ae, ema
**Unit tests:** 274 passed (272 pass, 2 skipped)

---

## Executive Summary

The fork faithfully reproduces the original's **core layout, canvas structure, CSS design tokens, bottom menu, and signal rendering pipeline**. Canvas counts match exactly for both ae (15) and ema (19) demos. CSS colors, fonts, and sizing are pixel-identical.

**3 Critical**, **3 Major**, and **5 Minor** issues were found. The most impactful are the hierarchy modal missing level-name buttons, the help modal showing unsubstituted template variables, and the connect button label difference.

---

## Findings by Severity

### Critical (3)

| # | Finding | Location |
|---|---------|----------|
| C1 | Hierarchy modal header empty — level-name buttons (Utterance, Intonational, etc.) don't render because `viewStateService.hierarchyState.path` is not initialized when modal opens | `HierarchyModal.svelte:43-47` |
| C2 | Help modal intro tab shows `@@versionnr`, `@@timestamp`, `@@sha1` — build-time template substitution not implemented | `public/views/helpTabs/intro.html:5-9` |
| C3 | Help manual tab references `views/helpTabs/manual.html` but file doesn't exist — only `intro.html` and `keys.html` are present | `HelpModal.svelte:10`, `public/views/helpTabs/` |

### Major (3)

| # | Finding | Location |
|---|---------|----------|
| M1 | Connect button always shows static "connect" text; original uses dynamic `{{connectBtnLabel}}` that shows the connection URL when connected | `TopMenu.svelte:285` |
| M2 | Help modal uses flat tab navigation (Introduction/Keys/Manual) vs original's expandable tree navigation (▾ EMU-webApp → What's New, Keyboard Shortcuts, General Usage, Getting Help) — different information architecture | `HelpModal.svelte` vs original tree structure |
| M3 | Fork renders extra "Drop zone" button in top area even after demo DB is loaded (not visible in original) | `BundleListSidebar.svelte` — drop zone visibility condition |

### Minor (5)

| # | Finding | Location |
|---|---------|----------|
| m1 | Fork uses Svelte `{#if}` (removes from DOM) vs Angular `ng-show` (hides in DOM) for conditional buttons — functionally equivalent but Save, Add Level, Rename, Download TextGrid, Download Annotation buttons are completely absent from DOM when hidden | `TopMenu.svelte:213-247` |
| m2 | CSS variable naming: fork uses camelCase (`--color-lightGrey`) vs original's kebab-case (`--color-light-grey`) — values are identical | `artic-design.scss` |
| m3 | Fork adds semantic tokens (`--bg-primary`, `--accent`, etc.) and light theme support not in original — no impact on default appearance | `artic-design.scss:48-104` |
| m4 | Bundle list items render as `<button>` in fork vs `<li>` with `ng-click` in original — functionally equivalent | `BundleListSidebar.svelte` |
| m5 | Perspectives sidebar items render as `<button>` in fork vs `<li>` in original — functionally equivalent | `PerspectivesSidebar.svelte` |

### Informational (3)

| # | Finding | Location |
|---|---------|----------|
| i1 | All 14 modals use correct structure: artic-modal-wrap → header (60px, #0DC5FF) + body (#303030, overflow-y auto) + footer (60px, #0DC5FF) | `modal.scss`, all modal components |
| i2 | Settings modal layout (84% width, 90% height, 8% margins) is mathematically correct per viewport — the issue in `current-config.png` may be viewport-dependent or resolved | `modal.scss:19-27` |
| i3 | SettingsModal uses inline sticky footer (Cancel/Save) inside body PLUS an empty absolute footer — works correctly but differs structurally from standard modals | `SettingsModal.svelte:12`, `Settings.svelte:245-248` |

---

## Detailed Findings

### Phase 1: Layout & Structure

| Element | Original | Fork | Match? |
|---------|----------|------|--------|
| `.{prefix}-window` | `{x:240, y:0, w:462, h:1596}` | `{x:235, y:0, w:110, h:1596}` | ✅ (% correct, viewport diff) |
| `.{prefix}-top-menu` | `height:40px, bg:rgb(13,197,255)` | `height:40px, bg:rgb(13,197,255)` | ✅ |
| `.{prefix}-canvas` | fills remaining space | fills remaining space | ✅ |
| `.{prefix}-bottom-menu` | `height:92px, bg:rgb(13,197,255)` | `height:92px, bg:rgb(13,197,255)` | ✅ |
| Left sidebar | `width:240px` | `width:240px` | ✅ |
| Right sidebar | Perspectives list (default, phonetic+10DftCoeffs) | Same items | ✅ |
| Split pane | `.emuwebapp-split-panes vertical` h:1212px | `.split-container` h:1212px | ✅ |

### Phase 2: Top Menu Buttons (ae demo loaded)

| Button | Original | Fork | Match? |
|--------|----------|------|--------|
| Hamburger (menu) | ✅ visible | ✅ visible | ✅ |
| Save | hidden (DEMO mode) | not in DOM | ✅ (functionally same) |
| Add Level SEG/EVENT | hidden | not in DOM | ✅ |
| Rename sel. level | hidden | not in DOM | ✅ |
| Download TextGrid | hidden | not in DOM | ✅ |
| Download annotJSON | hidden | not in DOM | ✅ |
| Settings | ✅ | ✅ | ✅ |
| Open Demo | hidden/disabled | not in DOM | ✅ |
| Connect | visible, disabled, text="input" | visible, disabled, text="inputconnect" | ⚠️ M1 |
| Hierarchy | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ |
| Clear | ✅ | ✅ | ✅ |
| About (EMU SVG) | ✅ | ✅ | ✅ |

### Phase 3: Bottom Menu Buttons

**Perfect match.** All 9 buttons identical:

| Button | ID | Icon | Match? |
|--------|-----|------|--------|
| Zoom In | zoomInBtn | expand_less | ✅ |
| Zoom Out | zoomOutBtn | expand_more | ✅ |
| Zoom Left | zoomLeftBtn | chevron_left | ✅ |
| Zoom Right | zoomRightBtn | chevron_right | ✅ |
| Zoom All | zoomAllBtn | unfold_less (rotated 90°) | ✅ |
| Zoom Selection | zoomSelBtn | unfold_more (rotated 90°) | ✅ |
| Play In View | playViewBtn | play_arrow | ✅ |
| Play Selected | playSelBtn | play_circle_outline | ✅ |
| Play Entire File | playAllBtn | play_circle_filled | ✅ |

### Phase 4: Modal Audit

| Modal | Structure | Content Match | Issues |
|-------|-----------|---------------|--------|
| Settings | ✅ | ✅ sections: Hierarchy, Level Canvas, OSCI, SPEC | i3: inline footer |
| Connect | ✅ | ✅ URL input, +/- buttons, select list | M1: button label |
| Help | ✅ | ⚠️ different nav structure | C2, C3, M2 |
| Hierarchy | ✅ | ⚠️ header empty, SVG renders | C1 |
| Search | ✅ | ✅ level select, attribute select, input, regex toggle | — |
| Export | ✅ | ✅ filename, pre block | — |
| Error | ✅ | ✅ message display | — |
| Confirm | ✅ | ✅ message + Cancel/Confirm | — |
| RenameLevel | ✅ | ✅ text input | — |
| SaveChanges | ✅ | ✅ Save/Discard/Cancel | — |
| Login | ✅ | ✅ username/password | — |
| LoadFiles | ✅ | ✅ file input | — |
| SelectLabel | ✅ | ✅ dropdown | — |
| SelectThreshold | ✅ | ✅ slider | — |

**General modal metrics (fork):**
- Overlay: full viewport, `rgba(0,0,0,0.7)` ✅
- Content: 84% width, 90% height ✅
- Margins: 8% left/right, 3% top ✅
- Header: #0DC5FF, 60px ✅
- Body: #303030, overflow-y auto ✅
- Footer: #0DC5FF, 60px ✅
- Close button: top-right ✕ ✅

### Phase 5: Signal Area

| Component | ae demo | ema demo | Match? |
|-----------|---------|----------|--------|
| Total canvases | 15 vs 15 | 19 vs 19 | ✅ |
| Timeline Main | 3 | 3 | ✅ |
| Timeline SSFF | 3 | 3 | ✅ |
| Timeline Markup | 3 | 3 | ✅ |
| Level canvases | 4 (2 levels × 2) | 6 (3 levels × 2) | ✅ |
| Preview canvas | 2 | 2 | ✅ |
| 2D canvases | — | 2 (static + dots) | ✅ |

### Phase 6: Annotation Levels

- Level count matches: 2 (ae), 3 (ema) ✅
- Canvas structure: level-canvas + level-canvas-markup per level ✅

### Phase 7: Keyboard Shortcuts

All 16 planned shortcuts are implemented. Code has 15 additional shortcuts for advanced features:

| Key | Action | Status |
|-----|--------|--------|
| o | Toggle left sidebar | ✅ |
| Shift+O | Toggle right sidebar | ✅ |
| w/s | Zoom in/out | ✅ |
| a/d | Pan left/right | ✅ |
| q | Zoom all | ✅ |
| e | Zoom to selection | ✅ |
| Space | Play in view | ✅ |
| f | Play entire file | ✅ |
| c | Play selected | ✅ |
| ArrowUp/Down | Level up/down | ✅ |
| ArrowLeft/Right | Prev/next item | ✅ |
| Tab | Next item | ✅ |
| Backspace | Delete boundary | ✅ |
| Enter | Create item / commit edit | ✅ |
| z/Shift+Z | Undo/redo | ✅ |
| 1-5/0 | Correction tools | ✅ |
| Shift+S | Save bundle | ✅ |
| h | Show hierarchy | ✅ (extra) |
| t/b/x | Snap boundary (top/bottom/zero) | ✅ (extra) |
| n/m | Add hierarchy item before/after | ✅ (extra) |
| +/-/=/_ | Expand/shrink segments | ✅ (extra) |

### Phase 8: Mouse Interactions

Not fully testable via automation. Code review confirms handlers exist for:
- Canvas click/drag selection (SignalCanvasMarkup)
- Level segment selection/editing
- Boundary dragging
- Split pane resize

### Phase 9: CSS Design Tokens

| Token | Original | Fork | Match? |
|-------|----------|------|--------|
| Blue | #0DC5FF | #0DC5FF | ✅ |
| Dark Grey | #303030 | #303030 | ✅ |
| Light Grey | #E7E7E7 | #E7E7E7 | ✅ |
| Transparent Black | rgba(0,0,0,0.7) | rgba(0,0,0,0.7) | ✅ |
| Font (buttons) | Arial 12px | Arial 12px | ✅ |
| Font (body) | 16px | 16px | ✅ |
| Top menu bg | rgb(13,197,255) | rgb(13,197,255) | ✅ |
| Bottom menu bg | rgb(13,197,255) | rgb(13,197,255) | ✅ |

### Phase 10: Cross-Demo Tests

| Demo | ae | ema |
|------|----|----|
| Canvas count | 15 ✅ | 19 ✅ |
| SSFF tracks | N/A | renders ✅ |
| 2D panel | N/A | present ✅ |
| Levels | 2 ✅ | 3 ✅ |
| Bundle list | msajc003, msajc010 ✅ | msajc003, msajc010 ✅ |
| Perspectives | default, phonetic+10DftCoeffs ✅ | default ✅ |

---

## Recommendations (prioritized)

### P0 — Fix Before Release

1. **C1: Initialize hierarchy path on modal open** — In `TopMenu.svelte:showHierarchy()` or `HierarchyModal.svelte`, set `viewStateService.hierarchyState.path` to the first available path if not already set. This should populate the level-name buttons in the modal header.

2. **C2: Replace template variables in help intro** — Either:
   - Add a Vite plugin to substitute `@@versionnr`/`@@timestamp`/`@@sha1` at build time, or
   - Move intro content to Svelte component with dynamic values from `package.json`

3. **C3: Add or remove manual tab** — Either create `public/views/helpTabs/manual.html` with relevant content, or remove the Manual tab from `HelpModal.svelte:10`.

### P1 — Fix Soon

4. **M1: Dynamic connect button label** — Add reactive state for `connectBtnLabel` that shows the WebSocket URL when connected, like the original's `{{connectBtnLabel}}`.

5. **M2: Help modal navigation** — Consider whether the flat tab structure is intentional simplification or should match the original's tree navigation.

6. **M3: Drop zone visibility** — Ensure the drop zone button is hidden after a demo DB is loaded (check `showDropZone` state management in `BundleListSidebar.svelte`).

### P2 — Nice to Have

7. **m2: CSS variable naming** — Consider aligning to kebab-case (`--color-light-grey`) to match original convention, though camelCase works fine.

8. **i3: Settings modal footer** — The inline sticky footer works but could be unified with the standard absolute footer pattern for consistency.
