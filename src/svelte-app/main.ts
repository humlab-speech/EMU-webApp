import { mount } from 'svelte';
import { setScheduleUpdate } from '../core/util/schedule-update';
import { invalidate } from './stores/app-state.svelte';
import App from './App.svelte';

// Styles (matching src/app/main.ts)
import '../styles/font.scss';
import '../styles/text.scss';
import '../styles/button.scss';
import '../styles/media-query.scss';
import '../styles/grazer.scss';
import '../styles/preview.scss';
import '../styles/modal.scss';
import '../styles/bundleListSideBar.scss';
import '../styles/rightSideMenu.scss';
import '../styles/twoDimCanvas.scss';
import '../styles/print.scss';
import '../styles/progressBar.scss';
import '../styles/aboutHint.scss';
import '../styles/drop.scss';
import '../styles/timeline.scss';
import '../styles/flexBoxGrid.scss';
import '../styles/levels.scss';
import '../styles/historyActionPopup.scss';
import '../styles/hierarchy.scss';
import '../styles/splitPanes.scss';
import '../styles/tabbed.scss';
import '../styles/animation.scss';
import '../styles/customAngularuiModal.scss';
import '../styles/largeTextInputField.scss';
import '../styles/levelCanvasesGrid.scss';

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
