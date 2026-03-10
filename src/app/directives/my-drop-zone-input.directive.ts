import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('myDropZoneInput', function () {
		return {
			template: '<span></span>',
			restrict: 'E',
			scope: {},
			link: function postLink() {
				// File input disabled — audio files are loaded via URL params or WebSocket protocol.
			}
		};
	});
