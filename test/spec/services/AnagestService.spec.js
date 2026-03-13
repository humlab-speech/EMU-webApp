'use strict';

describe('Service: AnagestService', function () {


	var $rootScope;
	var mockDialogService = {};


	// load the controller's module
	beforeEach(angular.mock.module('grazer'));

	beforeEach(angular.mock.module(function ($provide) {
		$provide.value('ModalService', mockDialogService);
	}));

	beforeEach(angular.mock.inject(function (ModalService, $q, _$rootScope_) {
		$rootScope = _$rootScope_;

		// mock open function 
		mockDialogService.open = function (p1) {
			var deferred = $q.defer();
			if(p1 === 'views/SelectLabelModal.html'){
				deferred.resolve(0);
			}else{
				deferred.resolve('called open on dialogService');
			}
			return deferred.promise;
		};

		// mock changeModal function (not needed any more as it was changed to open)
		// mockDialogService.changeModal = function (p1, p2, p3, p4) {
		// 	var deferred2 = $q.defer();
		// 	deferred2.resolve(0);
		// 	return deferred2.promise;
		// };

		// spyOn(dialogService, 'open');
	}));

	/**
	 *
	 */
	it('should find thresholds in mock array', angular.mock.inject(function (AnagestService, MathHelperService){
		var x = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
		var minVal = 13;
		var maxVal = 19;
		var threshold = 0.2;
		var direction = 1;
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, direction).then(function (res) {
			expect(MathHelperService.roundToNdigitsAfterDecPoint(res, 1)).toEqual(3.2);
		});
		$rootScope.$apply();

		threshold = 0.35;
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, direction).then(function (res) {
			expect(MathHelperService.roundToNdigitsAfterDecPoint(res, 1)).toEqual(4.1);
		});
		$rootScope.$apply();


		threshold = 0.8;
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, direction).then(function (res) {
			expect(MathHelperService.roundToNdigitsAfterDecPoint(res, 1)).toEqual(6.8);
		});
		$rootScope.$apply();


		// change direction
		// should call error dialog -> no thresholds found
		threshold = 0.2;
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, -1).then(function (res) {}, function (err) {
			expect(err).toEqual('Could not find any values that step over the threshold!!');
		});
		$rootScope.$apply();

		// new values
		x = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11];
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, -1).then(function (res) {
			expect(MathHelperService.roundToNdigitsAfterDecPoint(res, 1)).toEqual(5.8);
		});
		$rootScope.$apply();

		// two thresholds
		// new values
		x = [20, 19, 18, 17, 16, 15, 14, 13, 20, 19, 18, 17, 16, 15, 14, 13];
		AnagestService.interactiveFindThresholds(x, minVal, maxVal, threshold, -1).then(function (res) {
			expect(res).toEqual(NaN);
		});
		$rootScope.$apply();

		// TODO: SHOULD spy on mock open function to see if it is called with the correct values 
	}));
	
	/**
	*
	*/
	it('should not insertAnagestEvents with selected events', angular.mock.inject(function ($q, AnagestService, ViewStateService) {
	    spyOn(ViewStateService, 'getItemsInSelection').mockReturnValue([1, 2, 3]);
	    AnagestService.insertAnagestEvents();
		expect(ViewStateService.getItemsInSelection).toHaveBeenCalled();    
  }));
	
	/**
	*
	*/
	it('should insertAnagestEvents', angular.mock.inject(function ($q, LevelService, LinkService, HistoryService, ConfigProviderService, SsffDataService, AnagestService, ViewStateService) {
	    
	    var defer = $q.defer();
	    spyOn(HistoryService, 'updateCurChangeObj').mockImplementation(() => {});
	    spyOn(HistoryService, 'addCurChangeObjToUndoStack').mockImplementation(() => {});
	    spyOn(LinkService, 'insertLinksTo').mockImplementation(() => {});
	    spyOn(LevelService, 'getLevelDetails').mockReturnValue({name: 'test', items: [ {id:1}, {id:2}]});
	    spyOn(LevelService, 'getAllLabelsOfLevel').mockReturnValue({});
	    spyOn(ViewStateService, 'getcurClickLevelName').mockReturnValue('Phonetic');
	    spyOn(ViewStateService, 'getItemsInSelection').mockReturnValue([]);
	    spyOn(ConfigProviderService, 'getLevelDefinition').mockReturnValue({ 
	        anagestConfig: { 
	            velocitySsffTrackName: 'velocity', 
	            verticalPosSsffTrackName: 'ssff' , 
	            gestureOnOffsetLabels: ['test'], 
	            maxVelocityOnOffsetLabels: [10], 
	            constrictionPlateauBeginEndLabels: ['test']
	        }
	    });
	    spyOn(ConfigProviderService, 'getSsffTrackConfig').mockReturnValue({ name: 'test', columnName: 'test'});
	    spyOn(SsffDataService, 'getSampleRateAndStartTimeOfTrack').mockReturnValue({ startTime: 0, sampleRate: 20000 });
	    spyOn(SsffDataService, 'getColumnOfTrack').mockReturnValue([1]);
	    spyOn(AnagestService, 'interactiveFindThresholds').mockReturnValue(defer.promise);
	    
	    AnagestService.insertAnagestEvents();
	    
		expect(ViewStateService.getcurClickLevelName).toHaveBeenCalled();    
		expect(ViewStateService.getItemsInSelection).toHaveBeenCalled();    
		expect(ConfigProviderService.getLevelDefinition).toHaveBeenCalled();    
		expect(ConfigProviderService.getSsffTrackConfig).toHaveBeenCalled();   
		expect(SsffDataService.getSampleRateAndStartTimeOfTrack).toHaveBeenCalled();   
		expect(SsffDataService.getColumnOfTrack).toHaveBeenCalled(); 
		defer.resolve({}); 
		$rootScope.$apply(); 
		expect(AnagestService.interactiveFindThresholds).toHaveBeenCalled(); 
		expect(HistoryService.updateCurChangeObj).toHaveBeenCalled(); 
		expect(HistoryService.addCurChangeObjToUndoStack).toHaveBeenCalled(); 
		expect(LinkService.insertLinksTo).toHaveBeenCalled(); 
  }));
  	
	
	

});