import * as angular from 'angular';
import styles from '../../styles/grazer-design.scss';

let HistoryActionPopupComponent = {
    selector: "historyActionPopup",
    template: `
    <div ng-bind="$ctrl.historyActionTxt">
    test12
    </div>
    `,
    bindings : {
        historyActionTxt: '<'
    },
    controller: [
        '$element', 
        'ViewStateService', 
        '$animate', 
        '$timeout', 
        'ConfigProviderService',
        class HistoryActionPopupController{
        private $element;
        private ViewStateService;
        private $animate;
        private $timeout;
        private ConfigProviderService;

        private historyActionTxt;
        private _inited;

        constructor(
            $element, 
            ViewStateService, 
            $animate, 
            $timeout, 
            ConfigProviderService
            ){
            this.$element = $element;
            this.ViewStateService = ViewStateService;
            this.$animate = $animate;
            this.$timeout = $timeout;
            this.ConfigProviderService = ConfigProviderService;

        }

        $postLink (){
            
        };
        
        $onChanges (changes) {
            //
            if(this._inited){
                //
                if(changes.historyActionTxt){
                    if (this.historyActionTxt !== '') {
                        this.$animate.addClass(this.$element, 'grazer-history-fade').then(() => {
                            this.$timeout(() => {
                                this.$animate.removeClass(this.$element, 'grazer-history-fade').then(() => {
                                    this.$timeout(() => {
                                        this.ViewStateService.historyActionTxt = '';
                                    }, styles.animationPeriod);
                                });
                            }, styles.animationPeriod);
                        });
                    }
                }
            }
        }

        $onInit () {
            this._inited = true;
        };

    }]

}

angular.module('grazer')
.component(HistoryActionPopupComponent.selector, HistoryActionPopupComponent);