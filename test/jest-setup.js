'use strict';

// jQuery must be on window and global before angular loads
const jquery = require('jquery');
global.$ = global.jQuery = window.jQuery = window.$ = jquery;

// AngularJS — must be on window for angular-mocks to find it
const angular = require('angular');
global.angular = window.angular = angular;

// Angular plugins
require('angular-route');
require('angular-animate');
require('angular-filter');

// Register the app module (creates angular.module('grazer', [...]))
require('../src/app/app');

// Register all services
require('../src/app/services');

// Register all filters
require('../src/app/filters');

// angular-mocks checks for window.jasmine || window.mocha to set up
// module() and inject(). Jest 29 uses jest-circus by default which
// doesn't set window.jasmine, so we must provide it.
// angular-mocks IIFE passes (window.jasmine || window.mocha) and
// bails if falsy. Jest-circus doesn't set window.jasmine, so fake it.
window.jasmine = window.jasmine || { getEnv: function() { return {}; } };

// Angular mocks — must load after angular is on window
require('angular-mocks');

// jest-circus doesn't provide spyOn as a global (unlike jest-jasmine2).
// Many Jasmine-style tests use bare spyOn(). Provide it.
global.spyOn = jest.spyOn;

// jsdom stubs for APIs not available in jsdom
if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = function () { return 'blob:mock'; };
  window.URL.revokeObjectURL = function () {};
}
if (!window.webkitURL) {
  window.webkitURL = window.URL;
}

// Load fixture data
require('./fixtures/load-fixtures');
