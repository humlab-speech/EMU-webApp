'use strict';

angular.module('emuwebApp')
	.controller('TabbedCtrl', function ($scope, viewState, ConfigProviderService, Validationservice, uuid) {
		
		// service shortcuts
		$scope.cps = ConfigProviderService;
		$scope.vs = viewState;
		$scope.valid = Validationservice;
		
		// definition shortcuts
		$scope.levelDefinitionProperties = {};
		$scope.linkDefinitionProperties = {};
		$scope.spectroDefinitionProperties = {};
		
		// selection properties for "add signal canvases order"
		$scope.signalSelect = [];
		// selection properties for "add level canvases order"
		$scope.levelSelect = [];
		// selection properties for "add signal canvases order"
		$scope.twoDimSelect = [];
		// default selection for "add signal canvases order"
		$scope.addSignalSelect = "";
		// default selection for "add level canvases order"
		$scope.addLevelSelect = "";
		// default selection for "add two dim canvases order"
		$scope.addTwoDimSelect = "";
		
		// all available tabs
		$scope.tabs = [{
				title: 'level definitions',
				url: 'views/tabbed/levelDefinition.html'
			}, {
				title: 'link definitions',
				url: 'views/tabbed/linkDefinition.html'
			}, {
				title: 'ssff track definitions',
				url: 'views/tabbed/ssffDefinition.html'
			}, {
				title: '2D definitions',
				url: 'views/tabbed/twoDimDefinition.html'
			}, {
				title: 'EMU-webApp',
				url: 'views/tabbed/emuDefinition.html'
			},{
				title: 'global DB',
				url: 'views/tabbed/globalDefinition.html'
		}];
		// current open tab
		$scope.currentTab = 'views/tabbed/levelDefinition.html';
		
		$scope.setup = function () {
		    // read db config file for enum types
		    var dbconfigFileSchema = $scope.valid.getSchema('DBconfigFileSchema');
		    var webappFileSchema = $scope.valid.getSchema('emuwebappConfigSchema');
		    $scope.levelDefinitionProperties = dbconfigFileSchema.data.properties.levelDefinitions.items.properties;
		    $scope.linkDefinitionProperties = dbconfigFileSchema.data.properties.linkDefinitions.items.properties;
		    $scope.spectroDefinitionProperties = webappFileSchema.data.properties.spectrogramSettings.properties;
		    $scope.resetSelections();
		}
		
		$scope.generateUUID = function () {
		    $scope.cps.curDbConfig.UUID = uuid.new();
		}
		
		$scope.onClickTab = function (tab) {
			$scope.currentTab = tab.url;
		}
		
		$scope.resetSelections = function () {
			$scope.signalSelect = ['OSCI', 'SPEC'];
			$scope.levelSelect = [];
			$scope.twoDimSelect = [];
			angular.forEach($scope.cps.curDbConfig.ssffTrackDefinitions, function (td) {
			    $scope.signalSelect.push(td.name);
			});
			angular.forEach($scope.cps.curDbConfig.levelDefinitions, function (td) {
			    $scope.levelSelect.push(td.name);
			});
			// the following will be rewritten : !
			if($scope.cps.vals.perspectives[0].twoDimCanvases.twoDimDrawingDefinitions !== undefined) {
				angular.forEach($scope.cps.vals.perspectives[key].twoDimCanvases.twoDimDrawingDefinitions, function (dd) {
					$scope.twoDimSelect.push(dd.name);
				});
			}
			else {
			    $scope.twoDimSelect.push('under development');
			}
			////////////////////////////////
			$scope.addSignalSelect = $scope.signalSelect[0];
			$scope.addLevelSelect = $scope.levelSelect[0];
			$scope.addTwoDimSelect = $scope.twoDimSelect[0];
			
		}
		
		$scope.isActiveTab = function(tabUrl) {
			if(tabUrl == $scope.currentTab) {
				return {
					'background-color': '#FFF',
					'color': '#000'
				}
			}
			return {};
		}

		/**
		 *
		 */
		$scope.cursorInTextField = function () {
			viewState.setEditing(true);
			viewState.setcursorInTextField(true);
		};

		/**
		 *
		 */
		$scope.cursorOutOfTextField = function () {
			viewState.setEditing(false);
			viewState.setcursorInTextField(false);
		};
			
		$scope.addDefinition = function (typeOfDefinition, key, keyAttribute) {
		    switch(typeOfDefinition) {
		        case 'level':
		            $scope.cps.curDbConfig.levelDefinitions.push({name: '', type: 'ITEM', attributeDefinitions: [{name: '', type: 'STRING'}]});
		            break;
		        case 'levelattribute':
		            $scope.cps.curDbConfig.levelDefinitions[key].attributeDefinitions.push({name: '', type: 'STRING', legalLabels: []});
		            break;
		        case 'link':
		            $scope.cps.curDbConfig.linkDefinitions.push({type: 'undefined', superlevelName: 'undefined', sublevelName: 'undefined'});
		            break;
		        case 'ssff':
		            $scope.cps.curDbConfig.ssffTrackDefinitions.push({name: "undefined", columnName: "undefined", fileExtension: "undefined"})
		            break;	
		        case 'perspective':
		            $scope.cps.vals.perspectives.push({name: '', signalCanvases: { order: [], assign: [], contourLims: [], contourColors: []}, levelCanvases: { order: [] }, twoDimCanvases: { order: [] }});
		            break;
		        case 'perspectiveAssign':
		            $scope.cps.vals.perspectives[key].signalCanvases.assign.push({signalCanvasName: '', ssffTrackName: ''});
		            break;	
		        case 'perspectiveContourColor':
		            $scope.cps.vals.perspectives[key].signalCanvases.contourColors.push({colors: ['rgba(0,0,0,1)'], ssffTrackName: ''});
		            break;	
		        case 'perspectiveContourColorColor':
		            $scope.cps.vals.perspectives[key].signalCanvases.contourColors[keyAttribute].colors.push('rgba(0,0,0,1)');
		            break;	
		        case 'perspectiveContourLims':
		            $scope.cps.vals.perspectives[key].signalCanvases.contourLims.push({ssffTrackName: '', minContourIdx: 0, maxContourIdx: 1});
		            break;	
		        case 'perspectiveOrderSignal':
		            $scope.cps.vals.perspectives[key].signalCanvases.order.push(keyAttribute);
		            break;	
		        case 'perspectiveOrderLevel':
		            $scope.cps.vals.perspectives[key].levelCanvases.order.push(keyAttribute);
		            break;	
		        case 'perspectiveOrderTwoDim':
		            console.log($scope.cps.vals.perspectives[key].twoDimCanvases.twoDimDrawingDefinitions);
		            $scope.cps.vals.perspectives[key].twoDimCanvases.order.push(keyAttribute);
		            break;	

		    }
		}
		
		$scope.deleteDefinition = function (typeOfDefinition, key, keyAttribute, subKeyAttribute) {
		    switch(typeOfDefinition) {
		        case 'level':
		            $scope.cps.curDbConfig.levelDefinitions.splice(key, 1);
		            break;
		        case 'levelattribute':
		            $scope.cps.curDbConfig.levelDefinitions[key].attributeDefinitions.splice(keyAttribute, 1);
		            break;
		        case 'link':
		            $scope.cps.curDbConfig.linkDefinitions.splice(key, 1);
		            break;
		        case 'ssff':
		            $scope.cps.curDbConfig.ssffTrackDefinitions.splice(key, 1);
		            break;
		        case 'perspective':
		            $scope.cps.vals.perspectives.splice(key, 1);
		            break;
		        case 'perspectiveAssign':
		            $scope.cps.vals.perspectives[key].signalCanvases.assign.splice(keyAttribute, 1);
		            break;
		        case 'perspectiveContourColor':
		            $scope.cps.vals.perspectives[key].signalCanvases.contourColors.splice(keyAttribute, 1);
		            break;
		        case 'perspectiveContourColorColor':
		            $scope.cps.vals.perspectives[key].signalCanvases.contourColors[keyAttribute].colors.splice(subKeyAttribute, 1);
		            break;
		        case 'perspectiveContourLims':
		            $scope.cps.vals.perspectives[key].signalCanvases.contourLims.splice(keyAttribute, 1);
		            break;
		        case 'perspectiveOrderSignal':
		            $scope.cps.vals.perspectives[key].signalCanvases.order.splice(keyAttribute, 1);
		            break;
		        case 'perspectiveOrderLevel':
		            $scope.cps.vals.perspectives[key].levelCanvases.order.splice(keyAttribute, 1);
		            break;
		        case 'perspectiveOrderTwoDim':
		            $scope.cps.vals.perspectives[key].twoDimCanvases.order.splice(keyAttribute, 1);
		            break;
		    }		    
		}		
		
		$scope.setup();	
});