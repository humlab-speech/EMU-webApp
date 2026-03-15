import * as angular from 'angular';
import { WavParserService } from '../../core/services/wav-parser.service';

angular.module('grazer')
.factory('WavParserService', ['AudioResamplerService', 'ViewStateService',
function(AudioResamplerService, ViewStateService) {
	const instance = new WavParserService();
	instance.initDeps({ AudioResamplerService, ViewStateService });
	return instance;
}]);
