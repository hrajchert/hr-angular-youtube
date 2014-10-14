
/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerCurrentQuality',  function() {
        return {
            restrict: 'EA',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    var setPlaybackQuality = function () {
                        var quality;
                        if (attrs.hasOwnProperty('intendedQuality')) {
                            var showRealAuto = false;
                            if (attrs.hasOwnProperty('showRealAuto')) {
                                showRealAuto = true;
                            }
                            quality = player.getHumanIntendedPlaybackQuality(showRealAuto);
                        } else {
                            quality = player.getHumanPlaybackQuality ();
                        }
                        elm.html(quality);
                    };
                    player.on('onPlaybackQualityChange',setPlaybackQuality);
                    player.on('onIntentPlaybackQualityChange',setPlaybackQuality);
                    setPlaybackQuality();
                });
            }
        };
    });
})(angular);

