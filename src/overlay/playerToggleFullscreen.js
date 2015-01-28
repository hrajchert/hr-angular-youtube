/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerToggleFullscreen',  function() {
        return {
            restrict: 'E',
            require: '^ytFullscreen',
            templateUrl: '/template/overlay/player-toggle-fullscreen.html',
            transclude: true,
            link: function(scope, elm, attrs,fullScreenCtrl) {
                elm.on('click', function() {
                    fullScreenCtrl.toggleFullscreen();
                });
            }
        };
    });
})(angular);

