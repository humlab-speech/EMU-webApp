interface Subscription {
	unsubscribe: () => void;
}

interface ObservableLike<T> {
	subscribe: (cb: (data: T) => void) => Subscription;
}

const target = new EventTarget();

export const eventBus = {
	emit(type: string, data?: any): void {
		target.dispatchEvent(new CustomEvent(type, { detail: data }));
	},

	on(type: string): ObservableLike<any> {
		return {
			subscribe(cb: (data: any) => void): Subscription {
				const handler = (e: Event) => cb((e as CustomEvent).detail);
				target.addEventListener(type, handler);
				return { unsubscribe: () => target.removeEventListener(type, handler) };
			}
		};
	}
};
