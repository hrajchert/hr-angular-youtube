/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerVolumeHorizontal',  function() {
        return {
            restrict: 'E',
            require: '^youtubePlayer',
            template: '<div class="ng-transclude"></div><div class="hr-yt-volume-hr-bar"></div>',
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

