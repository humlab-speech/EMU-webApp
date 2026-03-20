<script lang="ts">
	import { modalService, ioHandlerService, viewStateService } from '../../stores/services';

	let username = $state('');
	let password = $state('');
	let errorMsg = $state('');

	async function tryLogin() {
		try {
			const res = await ioHandlerService.logOnUser(username, password);
			if (res) {
				modalService.closeAndResolve(true);
			} else {
				errorMsg = 'Login failed. Please check credentials.';
			}
		} catch (e: any) {
			errorMsg = e?.message || 'Login failed.';
		}
	}

	function onFocus() { viewStateService.cursorInTextField = true; }
	function onBlur() { viewStateService.cursorInTextField = false; }
</script>

<div class="artic-modal-wrap">
	<div class="artic-modal-header-large artic-modal-header">
		<h3 id="modalHeading">User Login</h3>
	</div>
	<div class="artic-modal-body">
		Please enter:
		<hr />
		<table style="width: 100%; text-align: center;"><tbody>
			<tr>
				<td>User name:</td>
				<td><input type="text" bind:value={username} onfocus={onFocus} onblur={onBlur} /></td>
			</tr>
			<tr>
				<td>Password:</td>
				<td><input type="password" bind:value={password} onfocus={onFocus} onblur={onBlur} /></td>
			</tr>
		</tbody></table>
		<hr />
		{#if errorMsg}<p style="color: red">{errorMsg}</p>{/if}
	</div>
	<div class="artic-modal-footer">
		<button class="artic-mini-btn" id="modalCancelBtn" onclick={() => modalService.close()}>Cancel</button>
		<button class="artic-mini-btn" onclick={tryLogin}>Login</button>
	</div>
</div>
