import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface AppEvent {
	type: string;
	data?: any;
}

const eventSubject = new Subject<AppEvent>();

export const eventBus = {
	emit(type: string, data?: any): void {
		eventSubject.next({ type, data });
	},

	on(type: string): Observable<any> {
		return eventSubject.pipe(
			filter(e => e.type === type),
			map(e => e.data)
		);
	}
};
