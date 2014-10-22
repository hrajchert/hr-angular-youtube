/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerToggleFullscreen',  function() {
        return {
            restrict: 'E',
            require: '^youtubePlayer',
            templateUrl: '/template/overlay/player-toggle-fullscreen.html',
            transclude: true,
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    elm.on('click', function() {
                        player.toggleFullscreen();
                    });
                });
            }
        };
    });
})(angular);

