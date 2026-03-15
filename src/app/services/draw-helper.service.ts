import * as angular from 'angular';
import { DrawHelperService } from '../../core/services/draw-helper.service';

angular.module('grazer')
.factory('DrawHelperService', ['ViewStateService', 'ConfigProviderService', 'SoundHandlerService', 'FontScaleService', 'SsffDataService', 'MathHelperService',
function(ViewStateService, ConfigProviderService, SoundHandlerService, FontScaleService, SsffDataService, MathHelperService) {
	const instance = new DrawHelperService();
	instance.initDeps({ ViewStateService, ConfigProviderService, SoundHandlerService, FontScaleService, SsffDataService, MathHelperService });
	return instance;
}]);
