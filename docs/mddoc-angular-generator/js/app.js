/* global angular */
angular.module('demo', ['ngRoute','demoOverlay','demoControls'])
// TODO: mgmgmg, ngroute here?

//angular.module('demo', ['demoOverlay', 'demoControls'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/', {
        template: 'This- is hr-angular-youtube more to come',
    })
    .when('/demo/basic', {
        templateUrl: 'demo-basic.html',
        controller: 'BasicDemoCtrlRemoveThis'

    })
    .when('/demo/controls', {
        templateUrl: 'demo-controls.html',
        controller: 'ControlsDemoCtrlRemoveThis'

    })
    .when('/demo/overlay', {
        templateUrl: 'demo-overlay.html',
        controller: 'OverlayDemoCtrlRemoveThis'
    });
}]);


