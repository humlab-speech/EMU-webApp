import { mount } from 'svelte';
import { setScheduleUpdate } from '../core/util/schedule-update';
import { invalidate } from './stores/app-state.svelte';
import App from './App.svelte';

// Wire scheduleUpdate → Svelte reactive invalidation
// When services call scheduleUpdate(), Svelte components re-render.
setScheduleUpdate((fn) => {
	if (fn) fn();
	invalidate();
});

const app = mount(App, {
	target: document.getElementById('app')!,
});

export default app;
