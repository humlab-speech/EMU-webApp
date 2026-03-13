'use strict';

describe('Service: WebSocketHandlerService', function () {

  // load the service's module
  beforeEach(angular.mock.module('grazer'));

  // instantiate service
  var WebSocketHandlerService;
  beforeEach(angular.mock.inject(function (_WebSocketHandlerService_) {
    WebSocketHandlerService = _WebSocketHandlerService_;
  }));

  it('should check if isConnected', function () {
    var res = WebSocketHandlerService.isConnected();
    expect(res).toBe(false);
  });
  
  it('should initConnect', function () {
    WebSocketHandlerService.initConnect('ws://localhost');
    expect(WebSocketHandlerService.isConnected()).toBe(false);
  });  
  
  //todo 

});
