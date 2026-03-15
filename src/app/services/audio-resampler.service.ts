import * as angular from 'angular';
import { AudioResamplerService } from '../../core/services/audio-resampler.service';

angular.module('grazer')
.factory('AudioResamplerService', ['BrowserDetectorService', function(BrowserDetectorService) {
	const instance = new AudioResamplerService();
	instance.initDeps({ BrowserDetectorService });
	return instance;
}]);
