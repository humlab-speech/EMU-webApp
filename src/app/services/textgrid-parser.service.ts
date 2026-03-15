import * as angular from 'angular';
import { TextGridParserService } from '../../core/services/textgrid-parser.service';

angular.module('grazer')
.factory('TextGridParserService', ['DataService', 'ViewStateService', 'SoundHandlerService',
function(DataService, ViewStateService, SoundHandlerService) {
	const instance = new TextGridParserService();
	instance.initDeps({ DataService, ViewStateService, SoundHandlerService });
	return instance;
}]);
