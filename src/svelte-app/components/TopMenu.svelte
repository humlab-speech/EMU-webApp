<script lang="ts">
	// TODO: Import configProviderService and viewStateService for button visibility/permissions
</script>

<div class="grazer-top-menu">
	<button class="grazer-button-icon" id="bundleListSideBarOpen" style="float:left">
		<i class="material-icons">menu</i>
	</button>

	<button class="grazer-mini-btn left" id="spectSettingsBtn">
		<i class="material-icons">settings</i> settings
	</button>

	<button class="grazer-button-icon" id="aboutBtn" style="float: right;">
		<img src="/assets/EMU-webAppEmu.svg" class="_35px" alt="About" />
	</button>
</div>

<style>
	.grazer-top-menu {
		display: flex;
		align-items: center;
		padding: 2px 4px;
		background: #333;
		color: #fff;
		min-height: 30px;
	}

	.grazer-button-icon {
		background: none;
		border: none;
		color: #fff;
		cursor: pointer;
		padding: 4px 8px;
	}

	.grazer-mini-btn {
		background: #555;
		border: 1px solid #666;
		color: #fff;
		cursor: pointer;
		padding: 2px 8px;
		margin: 0 2px;
		font-size: 12px;
		border-radius: 2px;
	}

	.grazer-mini-btn:hover {
		background: #666;
	}

	._35px {
		height: 35px;
	}
</style>
