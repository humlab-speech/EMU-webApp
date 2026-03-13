'use strict';

describe('Directive: emuwebapp', function() {

    var httpBackend, elm, scope;
    beforeEach(angular.mock.module('grazer', 'grazer.templates'));

    beforeEach(angular.mock.inject(function($injector, $rootScope) {
        scope = $rootScope.$new();
        httpBackend = $injector.get('$httpBackend');
        httpBackend.whenGET('schemaFiles/annotationFileSchema.json').respond(annotationFileSchema);
        httpBackend.whenGET('schemaFiles/grazerConfigSchema.json').respond(grazerConfigSchema);
        httpBackend.whenGET('schemaFiles/DBconfigFileSchema.json').respond(DBconfigFileSchema);
        httpBackend.whenGET('schemaFiles/bundleListSchema.json').respond(bundleListSchema);
        httpBackend.whenGET('schemaFiles/bundleSchema.json').respond(bundleSchema);
        httpBackend.whenGET('schemaFiles/designSchema.json').respond(designSchema);
        httpBackend.whenGET('NEWS.md').respond('# I am the fake NEWS.md');
    }));

    function compileDirective(tpl) {
        if (!tpl) tpl = '<grazer audio-get-url="/testData/oldFormat/msajc003/msajc003.wav" label-get-url="/testData/oldFormat/msajc003/msajc003.TextGrid" label-type="TEXTGRID"></grazer>';
        angular.mock.inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should set correct values', angular.mock.inject(function ($rootScope, ViewStateService, ConfigProviderService) {
        ConfigProviderService.setVals(defaultGrazerConfig);
        ViewStateService.mouseInEmuWebApp = undefined;
        compileDirective();
        $rootScope.$digest();
        expect(ConfigProviderService.embeddedVals.audioGetUrl).toEqual('/testData/oldFormat/msajc003/msajc003.wav');
        expect(ConfigProviderService.embeddedVals.labelGetUrl).toEqual('/testData/oldFormat/msajc003/msajc003.TextGrid');
        expect(ConfigProviderService.embeddedVals.labelType).toEqual('TEXTGRID');
        elm.triggerHandler('mouseenter');
        expect(ViewStateService.mouseInEmuWebApp).toBeTruthy();
        elm.triggerHandler('mouseleave');
        expect(ViewStateService.mouseInEmuWebApp).not.toBeTruthy();
    }));
});
