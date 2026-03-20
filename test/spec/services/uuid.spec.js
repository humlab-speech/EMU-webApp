'use strict';

describe('Service: UuidService', function () {

  // load the controller's module
  beforeEach(angular.mock.module('artic'));
  
 /**
   *
   */
  it('should return new UuidService', angular.mock.inject(function (UuidService) {
    expect(UuidService.new().length).toEqual('00000000-0000-0000-0000-000000000000'.length); 
    expect(UuidService.new()).not.toEqual('00000000-0000-0000-0000-000000000000'); 
    expect(UuidService.new()[8]).toEqual('-');
    expect(UuidService.new()[13]).toEqual('-'); 
    expect(UuidService.new()[18]).toEqual('-');
    expect(UuidService.new()[23]).toEqual('-');
    expect(UuidService.newHash().length).toEqual('00000000-0000-0000-0000-000000000000'.length); 
    expect(UuidService.newHash()).not.toEqual('00000000-0000-0000-0000-000000000000'); 
    expect(UuidService.newHash()[8]).toEqual('-');
    expect(UuidService.newHash()[13]).toEqual('-'); 
    expect(UuidService.newHash()[18]).toEqual('-');
    expect(UuidService.newHash()[23]).toEqual('-');    
  }));
  
 /**
   *
   */
  it('should return empty UuidService', angular.mock.inject(function (UuidService) {
    expect(UuidService.empty()).toEqual('00000000-0000-0000-0000-000000000000'); 
  }));    

  

});