/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerTotalTime',  function() {
        return {
            restrict: 'EA',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    elm.html(player.getHumanReadableDuration());
                });
            }
        };
    });
})(angular);

