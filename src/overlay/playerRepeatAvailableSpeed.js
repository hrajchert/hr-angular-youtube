
/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerRepeatAvailableSpeed',  function() {
        return {
            restrict: 'A',
            template: function (tElm) {
                tElm.removeAttr('player-repeat-available-speed');
                tElm.attr('ng-repeat','$speed in availableSpeeds');
                return tElm[0].outerHTML;
            },
            replace: true,
            priority: 1000,
            scope: {

            },
            require: '^youtubePlayer',
            link: function(scope, elm, attrs, youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    scope.availableSpeeds = player.getAvailablePlaybackRates();
                    if (attrs.hasOwnProperty('reverse')) {
                        scope.availableSpeeds.reverse();

                    }

                });
            }

        };
    });
})(angular);

