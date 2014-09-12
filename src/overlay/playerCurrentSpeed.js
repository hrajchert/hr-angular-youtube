
/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerCurrentSpeed',  function() {
        return {
            restrict: 'EA',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    var setPlaybackRate = function () {
                        elm.html(player.getPlaybackRate ());
                    };
                    player.on('onPlaybackRateChange',setPlaybackRate);
                    setPlaybackRate();
                });
            }
        };
    });
})(angular);

