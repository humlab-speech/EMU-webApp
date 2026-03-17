/**
 * Reactive bridge between plain-object services and Svelte 5 components.
 *
 * Services mutate their own state (viewStateService.curViewPort.sS = 123).
 * Svelte components need reactive signals to know when to re-render.
 *
 * Solution: a "tick" counter that increments whenever services change state.
 * Components use $effect(() => { tick; redraw(); }) to react.
 *
 * Two tick channels:
 * - tick: incremented on data/viewport changes (all canvases react)
 * - markupTick: incremented on mouse-only changes (only markup canvases react)
 */

let tick = $state(0);
let markupTick = $state(0);

/** Increment to trigger ALL Svelte component re-renders */
export function invalidate() {
	tick++;
}

/** Increment to trigger only markup canvas re-renders (mouse movement etc.) */
export function invalidateMarkup() {
	markupTick++;
}

/** Read in $effect/$derived to establish reactive dependency on all changes */
export function getTick(): number {
	return tick;
}

/** Read in $effect/$derived to establish reactive dependency on markup-only changes */
export function getMarkupTick(): number {
	return markupTick;
}
