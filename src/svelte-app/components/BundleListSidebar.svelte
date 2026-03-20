<script lang="ts">
	import { getTick } from '../stores/app-state.svelte';
	import {
		viewStateService,
		loadedMetaDataService,
		dbObjLoadSaveService,
		historyService,
		configProviderService,
		modalService,
		dragnDropService,
	} from '../stores/services';

	let filterText = $state('');

	// Reactive state from services
	let sideBarOpen = $derived.by(() => {
		getTick();
		return !viewStateService.bundleListSideBarDisabled && viewStateService.getBundleListSideBarOpen();
	});

	let showDropZone = $derived.by(() => {
		getTick();
		return viewStateService.showDropZone;
	});

	let groupedBundles = $derived.by(() => {
		getTick();
		const list = loadedMetaDataService.getBundleList();
		if (!list || list.length === 0) return [];
		const groups: Map<string, any[]> = new Map();
		for (const bndl of list) {
			const session = bndl.session || '';
			if (!groups.has(session)) groups.set(session, []);
			groups.get(session)!.push(bndl);
		}
		return Array.from(groups.entries()).map(([session, bundles]) => ({ session, bundles }));
	});

	let curBndl = $derived.by(() => {
		getTick();
		return loadedMetaDataService.getCurBndl();
	});

	let hasUnsavedChanges = $derived(getTick() >= 0 && historyService.movesAwayFromLastSave !== 0);

	function loadBundle(bndl: any) {
		if (historyService.movesAwayFromLastSave !== 0) {
			modalService.open('views/confirmModal.html', 'You have unsaved changes. Load new bundle anyway?').then((res: any) => {
				if (res) dbObjLoadSaveService.loadBundle(bndl);
			});
		} else {
			dbObjLoadSaveService.loadBundle(bndl);
		}
	}

	function toggleSession(session: string) {
		loadedMetaDataService.openCollapseSession(session);
	}

	function saveBundle(bndl: any, e: MouseEvent) {
		e.stopPropagation();
		dbObjLoadSaveService.saveBundle();
	}

	function isFiltered(bndl: any): boolean {
		if (!filterText) return true;
		const search = filterText.toLowerCase();
		return (bndl.name?.toLowerCase().includes(search) || bndl.session?.toLowerCase().includes(search));
	}

	function getBndlColor(bndl: any): string {
		if (curBndl === bndl) {
			if (hasUnsavedChanges) {
				return 'background-color: #f00; color: #fff;';
			}
			return 'background-color: #999; color: #000;';
		}
		return '';
	}

	function isSessionOpen(session: string): boolean {
		return loadedMetaDataService.isSessionOpen ? loadedMetaDataService.isSessionOpen(session) : true;
	}

	let fileInput: HTMLInputElement;

	// Drop zone handlers
	function onDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		viewStateService.showDropZone = false;
		if (e.dataTransfer?.files) {
			dragnDropService.handleDrop(e.dataTransfer.files);
		}
	}

	function onDropZoneClick() {
		fileInput?.click();
	}

	function onFileSelected(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			dragnDropService.handleDrop(input.files);
			input.value = '';
		}
	}
</script>

{#if sideBarOpen}
<div class="artic-bundle-outer">
	<div>
		<h3>
			<div style="text-align: center; padding: 4px;">
				<input
					class="artic-filter"
					type="text"
					placeholder="&#x1f50d; Bundle Filter"
					bind:value={filterText}
					onfocus={() => viewStateService.setcursorInTextField(true)}
					onblur={() => viewStateService.setcursorInTextField(false)}
				/>
			</div>
		</h3>
		{#if showDropZone}
			<input
				bind:this={fileInput}
				type="file"
				multiple
				accept=".wav,.mp3,.flac,.ogg,.oga,.aac,.m4a,.wma,.mp4,.webm,.mkv,.mov,.textgrid,.json"
				onchange={onFileSelected}
				style="display: none;"
			/>
			<div class="artic-dropzone"
				ondragover={onDragOver}
				ondrop={onDrop}
				onclick={onDropZoneClick}
				role="button"
				tabindex="0"
				aria-label="Drop zone — click to open file dialog"
			>
				<span>Drop your audio/video files here (paired with optional .TextGrid or annotJSON files) or click to open a file dialog</span>
			</div>
		{:else}
			<div class="artic-bundle-container">
				{#each groupedBundles as group}
					{#if group.session || groupedBundles.length > 1}
					<div class="artic-bundle-session" onclick={() => toggleSession(group.session)} role="button" tabindex="0">
						<div>
							<i class="material-icons" style="font-size: 14px; vertical-align: middle;">
								{isSessionOpen(group.session) ? 'expand_more' : 'chevron_right'}
							</i>
							{group.session}
						</div>
					</div>
					{/if}
					{#if isSessionOpen(group.session)}
						<ul>
							{#each group.bundles as bndl, i}
								{#if isFiltered(bndl)}
									<li class="artic-bundle-item"
										class:artic-bundle-last={i === group.bundles.length - 1}
										onclick={() => loadBundle(bndl)}
										role="button"
										tabindex="0"
										style={getBndlColor(bndl)}
									>
										<b>{bndl.name}{#if hasUnsavedChanges && curBndl === bndl} *{/if}</b>
										{#if configProviderService.vals?.activeButtons?.saveBundle && curBndl === bndl}
											<button class="artic-saveBundleButton" onclick={(e) => saveBundle(bndl, e)}>
												<i class="material-icons" style="font-size: 16px;">save</i>
											</button>
										{/if}
									</li>
								{/if}
							{/each}
						</ul>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>
{/if}
