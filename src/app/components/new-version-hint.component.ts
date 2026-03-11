import * as angular from 'angular';
import { version } from "../../../package.json";

let NewVersionHintComponent = {
    selector: "newVersionHint",
    template: `
    <div class="grazer-aboutHint">
    <button class="grazer-aboutHint-hidden" ng-click="$ctrl.aboutBtnOverlayClick()"></button>
    Welcome to the EMU-webApp Version {{version}}
    <div class="grazer-aboutHint-arrow">click here for more information ⇧</div>
    </div>
    `,
    bindings: {
        aboutBtnOverlayClick: '&'
    },
    controller: class NewVersionHintComponent{
        constructor(){
        }
        $postLink (){
        };
    }

}

angular.module('grazer')
    .component(NewVersionHintComponent.selector, NewVersionHintComponent);