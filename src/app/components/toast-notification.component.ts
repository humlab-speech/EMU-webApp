import * as angular from 'angular';

let ToastNotificationComponent = {
    selector: 'toastNotification',
    template: /*html*/`
    <div class="grazer-toast" ng-if="$ctrl.message" ng-class="{'grazer-toast-show': $ctrl.visible}">
        <span>{{$ctrl.message}}</span>
        <button ng-click="$ctrl.dismiss()">&times;</button>
    </div>
    `,
    controller: ['$timeout', 'ViewStateService', class ToastNotificationController {
        private $timeout;
        private ViewStateService;
        public message: string;
        public visible: boolean;
        private dismissTimer: any;

        constructor($timeout, ViewStateService) {
            this.$timeout = $timeout;
            this.ViewStateService = ViewStateService;
            this.message = '';
            this.visible = false;
        }

        $onInit() {
            this.ViewStateService._toastCtrl = this;
        }

        $onDestroy() {
            if (this.ViewStateService._toastCtrl === this) {
                this.ViewStateService._toastCtrl = null;
            }
        }

        public show(msg: string, durationMs?: number) {
            this.message = msg;
            this.visible = true;
            if (this.dismissTimer) {
                this.$timeout.cancel(this.dismissTimer);
            }
            this.dismissTimer = this.$timeout(() => {
                this.dismiss();
            }, durationMs || 8000);
        }

        public dismiss() {
            this.visible = false;
            this.$timeout(() => {
                this.message = '';
            }, 300);
            if (this.dismissTimer) {
                this.$timeout.cancel(this.dismissTimer);
                this.dismissTimer = null;
            }
        }
    }]
};

angular.module('grazer')
.component(ToastNotificationComponent.selector, ToastNotificationComponent);
