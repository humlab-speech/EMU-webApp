import * as angular from 'angular';

let ProgressBarComponent = {
    selector: "progressBar",
    template: `
    <div>{{$ctrl.txt}}</div>
    `,
    bindings: {
        open: '<',
        txt: '<'
    },
    controller: [
        '$element', 
        '$animate',
        class ProgressBarController{
        private $element;
        private $animate;

        private _inited = false;
        
        constructor(
            $element, 
            $animate
            ){
            this.$element = $element;
            this.$animate = $animate;
        };
        
        $onInit () {
            this._inited = true;
        };
        
        $onChanges (changes) {
            if(this._inited){
                if(changes.open){
                    // console.log(changes.open.currentValue);
                    if(changes.open.currentValue){
                        this.$animate.removeClass(this.$element, 'grazer-shrinkHeightTo0px');
                        this.$animate.removeClass(this.$element, 'grazer-animationStopped');
                        this.$animate.addClass(this.$element, 'grazer-expandHeightTo20px');
                        this.$animate.addClass(this.$element, 'grazer-animationRunning');
                    } else {
                        this.$animate.removeClass(this.$element, 'grazer-expandHeightTo20px');
                        this.$animate.removeClass(this.$element, 'grazer-animationRunning');
                        this.$animate.addClass(this.$element, 'grazer-shrinkHeightTo0px');
                        this.$animate.addClass(this.$element, 'grazer-animationStopped');
                    }
                }
            }
        }

    }]
}
angular.module('grazer')
.component(ProgressBarComponent.selector, ProgressBarComponent);