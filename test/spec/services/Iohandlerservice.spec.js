'use strict';

describe('Service: IoHandlerService', function () {

  // load the controller's module
  beforeEach(angular.mock.module('grazer'));
  
  var scope;


  //Initialize the controller and a mock scope
  beforeEach(angular.mock.inject(function ($rootScope, IoHandlerService, ViewStateService) {
    scope = $rootScope.$new();
    scope.io = IoHandlerService;
    scope.vs = ViewStateService;
  }));

  /**
   *
   */
  it('should parseLabelFile with ESPS', angular.mock.inject(function (EspsParserService) {
    // var def = $q.defer();
    spyOn(EspsParserService, 'asyncParseEsps');
    scope.io.parseLabelFile('','test','test','ESPS');
    expect(EspsParserService.asyncParseEsps).toHaveBeenCalledWith('', '', 'embeddedESPS');
  }));

  /**
   *
   */
  it('should parseLabelFile with textgrid', angular.mock.inject(function ($q, TextGridParserService) {
    // var def = $q.defer();
    spyOn(TextGridParserService, 'asyncParseTextGrid');//.mockReturnValue(def.promise);
    scope.io.parseLabelFile('','test','test','TEXTGRID');
    expect(TextGridParserService.asyncParseTextGrid).toHaveBeenCalledWith('', '', 'embeddedTEXTGRID');
  }));

  /**
   *
   */
  it('should saveBundle CORS', angular.mock.inject(function (ConfigProviderService) {
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'CORS';
    scope.io.saveBundle();
  }));

  /**
   *
   */
  it('should saveBundle WS', angular.mock.inject(function ($q, ConfigProviderService, WebSocketHandlerService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'WS';
    spyOn(WebSocketHandlerService, 'saveBundle').mockReturnValue(def.promise);
    scope.io.saveBundle();
    expect(WebSocketHandlerService.saveBundle).toHaveBeenCalled();
  }));

  /**
   *
   */
  it('should getBundle CORS', angular.mock.inject(function ($q, ConfigProviderService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'CORS';
    scope.io.getBundle('','','');
  }));

  /**
   *
   */
  it('should getBundle WS', angular.mock.inject(function ($q, ConfigProviderService, WebSocketHandlerService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'WS';
    spyOn(WebSocketHandlerService, 'getBundle').mockReturnValue(def.promise);
    scope.io.getBundle('','','');
    expect(WebSocketHandlerService.getBundle).toHaveBeenCalled();
  }));

  /**
   *
   */
  it('should getBundleList CORS', angular.mock.inject(function ($q, ConfigProviderService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'CORS';
    scope.io.getBundleList('');
  }));

  /**
   *
   */
  it('should getBundleList WS', angular.mock.inject(function ($q, ConfigProviderService, WebSocketHandlerService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'WS';
    spyOn(WebSocketHandlerService, 'getBundleList').mockReturnValue(def.promise);
    scope.io.getBundleList('');
    expect(WebSocketHandlerService.getBundleList).toHaveBeenCalled();
  }));

  /**
   *
   */
  it('should getBundleList DEMO', angular.mock.inject(function ($q, ConfigProviderService, WebSocketHandlerService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'DEMO';
    var test = scope.io.getBundleList('');
  }));

  /**
   *
   */
  it('should getDBconfigFile CORS', angular.mock.inject(function ($q, ConfigProviderService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'CORS';
    scope.io.getDBconfigFile('');
  }));

  /**
   *
   */
  it('should getDBconfigFile DEMO', angular.mock.inject(function ($q, ConfigProviderService, WebSocketHandlerService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'DEMO';
    var test = scope.io.getDBconfigFile('');
  }));

  /**
   *
   */
  it('should getDBconfigFile WS', angular.mock.inject(function ($q, ConfigProviderService, WebSocketHandlerService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'WS';
    spyOn(WebSocketHandlerService, 'getDBconfigFile').mockReturnValue(def.promise);
    scope.io.getDBconfigFile('');
    expect(WebSocketHandlerService.getDBconfigFile).toHaveBeenCalled();
  }));


  /**
   *
   */
  it('should logOnUser CORS', angular.mock.inject(function ($q, ConfigProviderService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'CORS';
    scope.io.logOnUser('');
  }));

  /**
   *
   */
  it('should logOnUser WS', angular.mock.inject(function ($q, ConfigProviderService, WebSocketHandlerService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'WS';
    spyOn(WebSocketHandlerService, 'logOnUser').mockReturnValue(def.promise);
    scope.io.logOnUser('');
    expect(WebSocketHandlerService.logOnUser).toHaveBeenCalled();
  }));

  /**
   *
   */
  it('should getDoUserManagement CORS', angular.mock.inject(function ($q, ConfigProviderService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'CORS';
    scope.io.getDoUserManagement();
  }));

  /**
   *
   */
  it('should getDoUserManagement WS', angular.mock.inject(function ($q, ConfigProviderService, WebSocketHandlerService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'WS';
    spyOn(WebSocketHandlerService, 'getDoUserManagement').mockReturnValue(def.promise);
    scope.io.getDoUserManagement();
    expect(WebSocketHandlerService.getDoUserManagement).toHaveBeenCalled();
  }));

  /**
   *
   */
  it('should getProtocol CORS', angular.mock.inject(function ($q, ConfigProviderService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'CORS';
    scope.io.getProtocol();
  }));

  /**
   *
   */
  it('should getProtocol WS', angular.mock.inject(function ($q, ConfigProviderService, WebSocketHandlerService) {
    var def = $q.defer();
    ConfigProviderService.vals = {};
    ConfigProviderService.vals.main = {};
    ConfigProviderService.vals.main.comMode = 'WS';
    spyOn(WebSocketHandlerService, 'getProtocol').mockReturnValue(def.promise);
    scope.io.getProtocol();
    expect(WebSocketHandlerService.getProtocol).toHaveBeenCalled();
  }));

});