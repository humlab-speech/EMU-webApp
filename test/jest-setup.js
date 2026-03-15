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

// jsdom doesn't implement Canvas API — stub getContext('2d')
HTMLCanvasElement.prototype.getContext = function (type) {
  if (type === '2d') {
    return {
      canvas: this,
      fillRect: function () {},
      clearRect: function () {},
      putImageData: function () {},
      getImageData: function () { return { data: new Array(4) }; },
      createImageData: function () { return []; },
      setTransform: function () {},
      resetTransform: function () {},
      drawImage: function () {},
      save: function () {},
      fillText: function () {},
      restore: function () {},
      beginPath: function () {},
      moveTo: function () {},
      lineTo: function () {},
      closePath: function () {},
      stroke: function () {},
      translate: function () {},
      scale: function () {},
      rotate: function () {},
      arc: function () {},
      fill: function () {},
      rect: function () {},
      clip: function () {},
      measureText: function () { return { width: 0 }; },
      createLinearGradient: function () { return { addColorStop: function () {} }; },
      createRadialGradient: function () { return { addColorStop: function () {} }; },
      setLineDash: function () {},
      getLineDash: function () { return []; },
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 1,
      lineCap: '',
      lineJoin: '',
      font: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      shadowColor: '',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0
    };
  }
  return null;
};

// jsdom stubs for APIs not available in jsdom
if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = function () { return 'blob:mock'; };
  window.URL.revokeObjectURL = function () {};
}
if (!window.webkitURL) {
  window.webkitURL = window.URL;
}

// structuredClone polyfill for Node versions < 17
if (!global.structuredClone) {
  global.structuredClone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

// AudioContext mock for Web Audio API tests
if (!window.AudioContext) {
  window.AudioContext = function() {
    return {
      createBufferSource: function() {
        return {
          connect: function() {},
          start: function() {},
          stop: function() {},
          buffer: null
        };
      },
      createGain: function() {
        return {
          connect: function() {},
          gain: { value: 1 }
        };
      },
      destination: {},
      resume: function() { return Promise.resolve(); }
    };
  };
}
if (!window.webkitAudioContext) {
  window.webkitAudioContext = window.AudioContext;
}

// Expose Node's native fetch in jsdom (jsdom doesn't provide it).
// jest-environment-jsdom sandboxes globals, hiding Node's native fetch.
// We grab it from the real Node process via vm.runInThisContext.
// Wrap in a safe default that rejects silently for unmocked localhost calls
// to prevent ECONNREFUSED noise from AngularJS service init.
if (typeof fetch === 'undefined') {
  const vm = require('vm');
  const realFetch = vm.runInThisContext('globalThis.fetch');
  if (typeof realFetch === 'function') {
    global.fetch = realFetch;
  }
}

// Silence noisy console methods during tests (keep warn/error visible)
jest.spyOn(console, 'info').mockImplementation(() => {});
jest.spyOn(console, 'debug').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});


// Load fixture data
require('./fixtures/load-fixtures');
