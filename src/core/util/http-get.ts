/**
 * Drop-in replacement for AngularJS $http.get().
 * Returns a promise resolving to { status, data, config: { url } }
 * matching the $http response shape that callers expect.
 */
export function httpGet(url: string, options?: { responseType?: string }): Promise<{ status: number; data: any; config: { url: string } }> {
	// Resolve relative URLs against the page origin (native fetch in browsers
	// does this automatically, but Node/jsdom fetch requires absolute URLs).
	let resolvedUrl = url;
	if (typeof window !== 'undefined' && window.location && !/^https?:\/\//i.test(url)) {
		resolvedUrl = new URL(url, window.location.href).href;
	}
	return fetch(resolvedUrl).then((resp) => {
		if (!resp.ok) {
			throw new Error('HTTP ' + resp.status + ': ' + resp.statusText);
		}
		const responseType = options && options.responseType;
		let bodyPromise: Promise<any>;
		if (responseType === 'arraybuffer') {
			bodyPromise = resp.arrayBuffer();
		} else {
			bodyPromise = resp.json();
		}
		return bodyPromise.then((data) => ({
			status: resp.status,
			data: data,
			config: { url: url }
		}));
	});
}
