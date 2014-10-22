/* global angular, YT */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerPanel', ['$animate', '$timeout', function($animate, $timeout) {
        return {
            restrict: 'E',
            require: '^youtubePlayer',
            templateUrl: '/template/overlay/player-panel.html',
            transclude: true,
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    var $overlay = youtubePlayerCtrl.getOverlayElement();
                    var whoWantsToShow = {};

                    var show = function(cause) {
                        whoWantsToShow[cause] = true;
                        $animate.addClass(elm, 'ng-show');
                    };

                    var hide = function(cause) {
                        delete whoWantsToShow[cause];
                        if (Object.keys(whoWantsToShow).length === 0 ) {
                            $animate.removeClass(elm, 'ng-show');

                        }
                    };

                    if ('showOnHover' in attrs && attrs.showOnHover !== false) {
                        var showOnHover = parseInt(attrs.showOnHover);
                        var cancelTimerFn = null;
                        var cancelTimer = function() {
                            if (cancelTimerFn !== null) {
                                $timeout.cancel(cancelTimerFn);
                            }
                            cancelTimerFn = null;
                        };
                        $overlay.on('mouseenter', function() {
                            cancelTimer();
                            show('showOnHover');
                            if (!isNaN(showOnHover)) {
                                cancelTimerFn = $timeout(function(){
                                    hide('showOnHover');
                                }, showOnHover);

                            }
                        });
                        $overlay.on('mouseleave', function() {
                            cancelTimer();
                            hide('showOnHover');
                        });
                    }

                    var showOnPause = function(event) {
                        if (event.data === YT.PlayerState.PLAYING) {
                            hide('showOnPause');
                        } else {
                            show('showOnPause');
                        }
                    };
                    if ('showOnPause' in attrs && attrs.showOnPause !== false) {
                        player.on('onStateChange', showOnPause);
                        showOnPause({data:player.getPlayerState()});

                    }
                });

            }
        };
    }]);
})(angular);

