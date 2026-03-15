import * as angular from 'angular';
import { PublisherService } from '../../core/services/publisher.service';

angular.module('grazer')
.factory('PublisherService', ['SsffDataService', 'SsffParserService', 'BinaryDataManipHelperService', 'ValidationService', 'DataService', 'StandardFuncsService', 'LoadedMetaDataService', 'ConfigProviderService',
function(SsffDataService, SsffParserService, BinaryDataManipHelperService, ValidationService, DataService, StandardFuncsService, LoadedMetaDataService, ConfigProviderService) {
	const instance = new PublisherService();
	instance.initDeps({ SsffDataService, SsffParserService, BinaryDataManipHelperService, ValidationService, DataService, StandardFuncsService, LoadedMetaDataService, ConfigProviderService });
	return instance;
}]);
