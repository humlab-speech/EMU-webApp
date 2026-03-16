<script lang="ts">
	import { viewStateService } from '../stores/services';

	let message = $state('');
	let visible = $state(false);
	let dismissTimer: ReturnType<typeof setTimeout> | null = null;

	function show(msg: string, durationMs = 8000) {
		message = msg;
		visible = true;
		if (dismissTimer !== null) clearTimeout(dismissTimer);
		dismissTimer = setTimeout(dismiss, durationMs);
	}

	function dismiss() {
		visible = false;
		setTimeout(() => { message = ''; }, 300);
		if (dismissTimer !== null) { clearTimeout(dismissTimer); dismissTimer = null; }
	}

	$effect(() => {
		viewStateService._toastCtrl = { show, dismiss };
		return () => {
			if (viewStateService._toastCtrl === { show, dismiss }) {
				viewStateService._toastCtrl = null;
			}
		};
	});
</script>

{#if message}
<div class="grazer-toast" class:grazer-toast-show={visible}>
	<span>{message}</span>
	<button onclick={dismiss}>&times;</button>
</div>
{/if}
