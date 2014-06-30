/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerCurrentTime',  function() {
        return {
            restrict: 'EA',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    player.onProgress(function(){
                        elm.html(player.getHumanReadableCurrentTime());
                    },500);
                });
            }
        };
    });
})(angular);

