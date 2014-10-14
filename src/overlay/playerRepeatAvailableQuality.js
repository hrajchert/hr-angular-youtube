/* global angular, YT */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerRepeatAvailableQuality', ['youtubeQualityMap',  function(youtubeQualityMap) {
        return {
            restrict: 'A',
            template: function (tElm) {
                tElm.removeAttr('player-repeat-available-quality');
                tElm.attr('ng-repeat','$quality in availableQuality');
                return tElm[0].outerHTML;
            },
            replace: true,
            priority: 1000,
            scope: {

            },
            require: '^youtubePlayer',
            link: function(scope, elm, attrs, youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    // Youtube doesnt inform you on the available qualities until loading video
                    var unbind = player.on('onStateChange', function(event) {
                        if (event.data === YT.PlayerState.PLAYING) {
                            unbind();
                            scope.availableQuality = youtubeQualityMap.convertToYoutubeArray(player.getAvailableQualityLevels());
                            if (attrs.hasOwnProperty('reverse')) {
                                scope.availableQuality.reverse();
                            }

                        }
                    });
                    // So default is Auto
                    scope.availableQuality = ['Auto'];

                });
            }

        };
    }]);
})(angular);

