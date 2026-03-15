<script lang="ts">
	// TODO: Wire up zoom controls, playback, perspective switching
</script>

<div class="grazer-bottom-menu">
	<div class="osci-overview-container">
		<!-- OsciOverview canvas will go here in Phase 3 -->
	</div>

	<div class="controls">
		<button class="grazer-mini-btn">
			<i class="material-icons">expand_less</i>in
		</button>
		<button class="grazer-mini-btn">
			<i class="material-icons">expand_more</i>out
		</button>
		<button class="grazer-mini-btn">
			<i class="material-icons">chevron_left</i>left
		</button>
		<button class="grazer-mini-btn">
			<i class="material-icons">chevron_right</i>right
		</button>
		<button class="grazer-mini-btn">
			<i class="material-icons" style="transform: rotate(90deg)">unfold_less</i>all
		</button>
		<button class="grazer-mini-btn">
			<i class="material-icons" style="transform: rotate(90deg)">unfold_more</i>selection
		</button>
	</div>
</div>

<style>
	.grazer-bottom-menu {
		display: flex;
		align-items: center;
		padding: 2px 4px;
		background: #333;
		color: #fff;
		min-height: 30px;
	}

	.osci-overview-container {
		flex: 1;
		height: 25px;
		margin-right: 8px;
	}

	.controls {
		display: flex;
		gap: 2px;
	}

	.grazer-mini-btn {
		background: #555;
		border: 1px solid #666;
		color: #fff;
		cursor: pointer;
		padding: 2px 8px;
		font-size: 12px;
		border-radius: 2px;
	}

	.grazer-mini-btn:hover {
		background: #666;
	}
</style>
