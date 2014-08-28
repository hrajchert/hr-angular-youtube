/* global angular */
angular.module('demo', ['ngRoute','demoOverlay','demoControls', 'demoMarker'])
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
    .when('/demo/overlay', {
        templateUrl: 'demo-overlay.html',
        controller: 'OverlayDemoCtrlRemoveThis'
    })
    .when('/demo/marker', {
        templateUrl: 'demo-marker.html',
        controller: 'MarkerDemoCtrlRemoveThis'
    });
}]);



/* global angular */
angular.module('demo')

.controller('BasicDemoCtrlRemoveThis', ['$http','$scope', function($http, $scope) {
    $http.get('demo/basic/index.html').then(function(ans){
        $scope.indexhtml = ans.data;
    });
}])
.controller('ControlsDemoCtrlRemoveThis', ['$http','$scope', function($http, $scope) {
    $http.get('demo/controls/controls.html').then(function(ans){
        $scope.controlshtml = ans.data;
    });
    $http.get('demo/controls/controls.js').then(function(ans){
        $scope.controlsjs = ans.data;
    });
}])
.controller('OverlayDemoCtrlRemoveThis', ['$http','$scope', function($http, $scope) {
    $http.get('demo/overlay/overlay.html').then(function(ans){
        $scope.overlayhtml = ans.data;
    });
    $http.get('demo/overlay/overlay.js').then(function(ans){
        $scope.overlayjs = ans.data;
    });
    $http.get('demo/overlay/overlay.css').then(function(ans){
        $scope.overlaycss = ans.data;
    });
}])

.controller('MarkerDemoCtrlRemoveThis', ['$http','$scope', function($http, $scope) {
    $http.get('demo/marker/marker.html').then(function(ans){
        $scope.html = ans.data;
    });
    $http.get('demo/marker/marker.js').then(function(ans){
        $scope.js = ans.data;
    });
    $http.get('demo/marker/marker.css').then(function(ans){
        $scope.css = ans.data;
    });
}]);


