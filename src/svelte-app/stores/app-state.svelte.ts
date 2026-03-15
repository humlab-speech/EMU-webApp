/**
 * Reactive bridge between plain-object services and Svelte 5 components.
 *
 * Services mutate their own state (viewStateService.curViewPort.sS = 123).
 * Svelte components need reactive signals to know when to re-render.
 *
 * Solution: a "tick" counter that increments whenever services change state.
 * Components use $effect(() => { tick; redraw(); }) to react.
 *
 * The scheduleUpdate() function (used by services and event handlers)
 * increments this tick to trigger Svelte re-renders.
 */

let tick = $state(0);

/** Increment to trigger Svelte component re-renders */
export function invalidate() {
	tick++;
}

/** Read in $effect/$derived to establish reactive dependency */
export function getTick(): number {
	return tick;
}
