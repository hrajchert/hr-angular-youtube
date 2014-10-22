/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerPlay',  function() {
        return {
            restrict: 'E',
            require: '^youtubePlayer',
            templateUrl: '/template/overlay/player-play.html',
            transclude: true,
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    elm.on('click', function() {
                        player.playVideo();
                    });
                });
            }
        };
    });
})(angular);

