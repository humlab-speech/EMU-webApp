/**
 * Pluggable UI update scheduler — replaces $rootScope.$apply().
 * In Angular: set to $rootScope.$apply.bind($rootScope)
 * In Svelte: no-op (reactivity is automatic)
 */
let _scheduleUpdate: (fn?: () => void) => void = (fn) => { if (fn) fn(); };

export function setScheduleUpdate(fn: (cb?: () => void) => void) {
	_scheduleUpdate = fn;
}

export function scheduleUpdate(fn?: () => void) {
	_scheduleUpdate(fn);
}
