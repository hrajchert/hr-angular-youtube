/* global angular, YT */


(function(angular) {
    angular.module('hrAngularYoutube')

    .directive('showIfPlayerIs', ['$animate', function($animate) {
        return {
            restrict: 'AE',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                // By default hide
                $animate.addClass(elm, 'ng-hide');
                youtubePlayerCtrl.getPlayer().then(function(player){
                    // Convert the status list into an array of state numbers
                    var status = [];
                    // Convert it first into the array of string
                    var stringStatus = attrs.showIfPlayerIs.toUpperCase().split(',');
                    // For each state name, get its state number
                    angular.forEach(stringStatus,function(s){
                        if (YT.PlayerState.hasOwnProperty(s)) {
                            status.push(YT.PlayerState[s]);
                        } else {
                            throw new Error('Video status ' + s + ' is not defined');
                        }
                    });

                    var hideOrShow = function (event) {
                        if (status.indexOf(event.data) !== -1) {
                            $animate.removeClass(elm, 'ng-hide');
                        } else {
                            $animate.addClass(elm, 'ng-hide');
                        }
                    };
                    // Subscribe to the state change event
                    player.on('onStateChange', hideOrShow);
                    // Show or hide based on initial status
                    hideOrShow({data: player.getPlayerState()});
                });
            }
        };
    }])



    .directive('showIfMuted', ['$animate', function($animate) {
        return {
            restrict: 'A',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                // By default hide
                $animate.addClass(elm, 'ng-hide');
                youtubePlayerCtrl.getPlayer().then(function(player){
                    var hideOrShow = function () {
                        var show = !player.isMuted();
                        if (attrs.showIfMuted === 'true') {
                            show = !show;
                        }

                        if ( show ) {
                            $animate.removeClass(elm, 'ng-hide');
                        } else {
                            $animate.addClass(elm, 'ng-hide');
                        }
                    };
                    hideOrShow();
                    player.on('muteChange', hideOrShow);
                });
            }
        };
    }])
    ;

})(angular);


