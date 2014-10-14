/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerSetQuality',  ['$parse', function($parse) {
        return {
            restrict: 'A',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                var fn = $parse(attrs.playerSetQuality);

                youtubePlayerCtrl.getPlayer().then(function(player){
                    elm.on('click', function() {
                        scope.$apply(function() {
                            player.setHumanPlaybackQuality(fn(scope));
                        });
                    });
                });
            }
        };
    }]);
})(angular);

