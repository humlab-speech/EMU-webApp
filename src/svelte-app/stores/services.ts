/**
 * Service initialization — wires up dependencies between core services.
 * Replaces Angular's DI container.
 *
 * Call initServices() once at app startup.
 */

// Re-export all core service singletons for convenient access
export { dataService } from '../../core/services/data.service';
export { viewStateService } from '../../core/services/view-state.service';
export { configProviderService } from '../../core/services/config-provider.service';
export { soundHandlerService } from '../../core/services/sound-handler.service';
export { modalService } from '../../core/services/modal.service';

let initialized = false;

export function initServices() {
	if (initialized) return;
	initialized = true;

	// TODO: Wire up initDeps() calls for services with cross-dependencies
	// This will be completed as core services are finalized
	console.log('[grazer] Core services initialized');
}
