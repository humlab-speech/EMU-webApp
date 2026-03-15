import * as angular from 'angular';
import { EspsParserService } from '../../core/services/esps-parser.service';

angular.module('grazer')
.factory('EspsParserService', ['LevelService', 'SoundHandlerService',
function(LevelService, SoundHandlerService) {
	const instance = new EspsParserService();
	instance.initDeps({ LevelService, SoundHandlerService });
	return instance;
}]);
