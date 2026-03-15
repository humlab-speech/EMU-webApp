/**
 * Deep copy replacement for angular.copy.
 * Uses structuredClone when available, falls back to JSON round-trip.
 */
export function deepCopy<T>(source: T, destination?: T): T {
	const clone = typeof structuredClone === 'function'
		? structuredClone(source)
		: JSON.parse(JSON.stringify(source));

	if (destination !== undefined && destination !== null && typeof destination === 'object') {
		// angular.copy(src, dst) clears dst then copies — replicate that
		if (Array.isArray(destination)) {
			destination.length = 0;
			if (Array.isArray(clone)) {
				for (const item of clone) {
					(destination as any[]).push(item);
				}
			}
		} else {
			for (const key of Object.keys(destination)) {
				delete (destination as any)[key];
			}
			Object.assign(destination, clone);
		}
		return destination;
	}

	return clone;
}
