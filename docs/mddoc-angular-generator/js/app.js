/* global angular */
angular.module('demo', ['ngRoute','demoOverlay','demoControls', 'demoMarker', 'demoFullscreen'])
// TODO: mgmgmg, ngroute here?

//angular.module('demo', ['demoOverlay', 'demoControls'])
.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'home.html',

    })
    .when('/demo/basic', {
        templateUrl: 'demo-basic.html',
        controller: 'BasicDemoCtrlRemoveThis'

    })
    .when('/demo/controls', {
        templateUrl: 'demo-controls.html',
        controller: 'ControlsDemoCtrlRemoveThis'
    })
    .when('/demo/fullscreen', {
        templateUrl: 'demo-fullscreen.html',
        controller: 'FullscreenDemoCtrlRemoveThis'
    })

    .when('/demo/overlay', {
        templateUrl: 'demo-overlay.html',
        controller: 'OverlayDemoCtrlRemoveThis'
    })
    .when('/demo/marker', {
        templateUrl: 'demo-marker.html',
        controller: 'MarkerDemoCtrlRemoveThis'
    })
    .when('/dev/code', {
        templateUrl: 'code.html',
    });
}]);


