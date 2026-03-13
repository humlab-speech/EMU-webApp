'use strict';

describe('Factory: BrowserDetectorService', function () {

  var $window;
  // load the controller's module
  beforeEach(angular.mock.module('grazer'));

  beforeEach(angular.mock.inject(function(_$window_) {
      $window = _$window_;
  }));

  /**
   *
   */
  it('should check if mobile', angular.mock.inject(function (BrowserDetectorService) {
      expect(BrowserDetectorService.isMobileDevice()).toBe(false);
  }));
  
  /**
   *
   */
  it('should check if mobile on mobile', angular.mock.inject(function (BrowserDetectorService) {
      if(!navigator.userAgent.match(/Chrome/i)){ // check if window.navigator can be set (= read only property in chrome)
        setUserAgent($window, 'iPhone');
        expect(BrowserDetectorService.isMobileDevice()).toBe(true);
        setUserAgent($window, 'iPad');
        expect(BrowserDetectorService.isMobileDevice()).toBe(true);
        setUserAgent($window, 'iPod');
        expect(BrowserDetectorService.isMobileDevice()).toBe(true);
        setUserAgent($window, 'Android');
        expect(BrowserDetectorService.isMobileDevice()).toBe(true);
        setUserAgent($window, 'BlackBerry');
        expect(BrowserDetectorService.isMobileDevice()).toBe(true);
      }
  }));  
  
  
	function setUserAgent(window, userAgent) {
		if (window.navigator.userAgent != userAgent) {
			var userAgentProp = { get: function () { return userAgent; } };
			try {
				Object.defineProperty(window.navigator, 'userAgent', userAgentProp);
			} catch (e) {
				window.navigator = Object.create(navigator, {
					userAgent: userAgentProp
				});
			}
		}
	}  
  
});