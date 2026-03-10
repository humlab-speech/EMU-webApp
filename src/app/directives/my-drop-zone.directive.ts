import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('myDropZone', [function () {
		return {
			template: /*html*/`
			<div id="dropzone" class="emuwebapp-dropzone">
				<span><br />Connect to a server or use URL parameters to load a database.</span>
		  	</div>`,
			restrict: 'E',
			replace: true,
			scope: {},
			link: function postLink() {
				// File drop functionality disabled — audio files are loaded via URL params or WebSocket protocol.
			}
		};
	}]);
