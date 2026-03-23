/**
 * Reactive bridge between plain-object services and Svelte 5 components.
 *
 * Services mutate their own state (viewStateService.curViewPort.sS = 123).
 * Svelte components need reactive signals to know when to re-render.
 *
 * Four tick channels (from most frequent to least):
 * - markupTick: mouse-only changes (crosshair, hover — only markup canvases react)
 * - viewportTick: viewport/zoom/pan changes (canvas renderers react)
 * - dataTick: annotation data changes (levels, hierarchy, bundle list)
 * - configTick: config/perspective/UI state changes (menus, modals, sidebars)
 *
 * invalidate() broadcasts all non-markup channels for backward compat.
 * getTick() returns a combined tick for components not yet migrated.
 */

let viewportTick = $state(0);
let dataTick = $state(0);
let configTick = $state(0);
let markupTick = $state(0);

// --- Granular invalidation ---

/** Viewport/zoom/pan changed — canvas renderers should redraw */
export function invalidateViewport() {
	viewportTick++;
}

/** Annotation data changed — levels, hierarchy, bundle list should update */
export function invalidateData() {
	dataTick++;
}

/** Config/perspective/UI state changed — menus, modals, sidebars should update */
export function invalidateConfig() {
	configTick++;
}

/** Mouse-only change — only markup canvases (crosshairs etc.) should redraw */
export function invalidateMarkup() {
	markupTick++;
}

/** Broadcast: increment ALL non-markup channels. Use as fallback during migration. */
export function invalidate() {
	viewportTick++;
	dataTick++;
	configTick++;
}

// --- Granular readers ---

export function getViewportTick(): number {
	return viewportTick;
}

export function getDataTick(): number {
	return dataTick;
}

export function getConfigTick(): number {
	return configTick;
}

export function getMarkupTick(): number {
	return markupTick;
}

/** Combined tick — for components not yet migrated to granular channels */
export function getTick(): number {
	return viewportTick + dataTick + configTick;
}
