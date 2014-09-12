/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerSetSpeed',  ['$parse', function($parse) {
        return {
            restrict: 'A',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                var speedFn = $parse(attrs.playerSetSpeed);

                youtubePlayerCtrl.getPlayer().then(function(player){
                    elm.on('click', function() {
                        scope.$apply(function() {
                            var speed = speedFn(scope);
                            player.setPlaybackRate(speed);
                        });
                    });
                });
            }
        };
    }]);
})(angular);

