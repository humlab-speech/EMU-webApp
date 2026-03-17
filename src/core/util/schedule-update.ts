/**
 * Pluggable UI update scheduler — replaces $rootScope.$apply().
 * In Angular: set to $rootScope.$apply.bind($rootScope)
 * In Svelte: calls invalidate() after callback to trigger re-renders
 */
let _scheduleUpdate: (fn?: () => void) => void = (fn) => { if (fn) fn(); };
let _postUpdate: (() => void) | null = null;

export function setScheduleUpdate(fn: (cb?: () => void) => void) {
	_scheduleUpdate = fn;
}

/** Register a post-update hook (called after each scheduleUpdate callback) */
export function setPostUpdate(fn: () => void) {
	_postUpdate = fn;
}

export function scheduleUpdate(fn?: () => void) {
	_scheduleUpdate(fn);
	if (_postUpdate) _postUpdate();
}
