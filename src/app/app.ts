import * as angular from 'angular';

angular.module('grazer', ['ngAnimate', 'angular.filter', 'ngRoute'])
	.config(['$locationProvider', function ($locationProvider) {
		$locationProvider.html5Mode(true);
	}]);
