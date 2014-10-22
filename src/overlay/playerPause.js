/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerPause',  function() {
        return {
            restrict: 'E',
            require: '^youtubePlayer',
            templateUrl: '/template/overlay/player-pause.html',
            transclude: true,
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    elm.on('click', function() {
                        player.pauseVideo();
                    });
                });
            }
        };
    });
})(angular);

