import * as angular from 'angular';

angular.module('grazer')
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
