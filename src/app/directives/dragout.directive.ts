import * as angular from 'angular';

angular.module('grazer')
	.directive('dragout', ['$window', 'DataService', 'LoadedMetaDataService', 'BrowserDetectorService', 'ConfigProviderService', 
		function ($window, DataService, LoadedMetaDataService, BrowserDetectorService, ConfigProviderService) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				name: '@'
			},
			link: function (scope, element, attrs) {
				scope.cps = ConfigProviderService;
				var el = element[0];
				// var dragIcon = document.createElement('img');
				// dragIcon.src = 'img/save.svg';
				// dragIcon.width = '35';
				// dragIcon.height = '35';

				scope.generateURL = function () {
					return scope.getURL(angular.toJson(DataService.getData(), true));
				};

				scope.isActive = function () {
					if (attrs.name === LoadedMetaDataService.getCurBndl().name) {
						return true;
					}
					else{
						return false;
					}
				};

				scope.getURL = function (data) {
					return URL.createObjectURL(scope.getBlob(data));
				};

				scope.getBlob = function (data) {
					return new Blob([data], {type: 'text/plain'});
				};

				el._dragstartHandler = function (e) {
						// console.log('dragstart');
						if (scope.isActive()) {
							this.classList.add('drag');
							var url = scope.generateURL();
							if (BrowserDetectorService.isBrowser.Firefox() || BrowserDetectorService.isBrowser.Chrome()) {
								if(e.dataTransfer !== undefined){
									// add image
									// e.dataTransfer.setDragImage(dragIcon, -8, -8);
									// e.dataTransfer.effectAllowed = 'move';
									e.dataTransfer.setData('DownloadURL', 'application/json:' + attrs.name + '_annot.json:' + url);
								}
							}
						}
						else {
							e.preventDefault();
							// console.log('dropping inactive bundles is not allowed');
						}
						return false;
				};
				el.addEventListener('dragstart', el._dragstartHandler, false);

				el._dragendHandler = function (e) {
						// console.log('dragend');
						if (scope.isActive()) {
							this.classList.remove('drag');
							e.preventDefault();
						}
						return false;

				};
				el.addEventListener('dragend', el._dragendHandler, false);

				scope.$on('$destroy', function() {
					el.removeEventListener('dragstart', el._dragstartHandler, false);
					el.removeEventListener('dragend', el._dragendHandler, false);
				});
			}
		};
	}]);
