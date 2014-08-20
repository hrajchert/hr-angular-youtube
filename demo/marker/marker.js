/* global angular */
angular.module('demoMarker', ['hrAngularYoutube'])
.config(['youtubeProvider', function(youtubeProvider) {
    // This options are the ones from here
    // https://developers.google.com/youtube/player_parameters?playerVersion=HTML5
    youtubeProvider.setPlayerVarOption('controls',0);
    youtubeProvider.setPlayerVarOption('rel',0);
    youtubeProvider.setPlayerVarOption('modestbranding',1);
}])
.controller('MarkerDemoCtrl', ['$scope', '$compile','$timeout', function($scope, $compile, $timeout){
    // Long video 9min
    $scope.id = 'i_mKY2CQ9Kk';
    // Medium 1min
    // $scope.id = 'QjX9Wu-MJ-s';
    // Short video 11 sec
    // $scope.id = 'lIXRN7hBxQ8';

    $scope.$watch('player1', function(player) {
        if (typeof player === 'object') {
            player.mute();
            player.addMarker({
                time:10,
                template: '<div class="example-marker">This only shows when the video passes normally</div>',
                handler: function() {
                    var elm = $compile(this.template)($scope);
                    player.getOverlayElement().append(elm);
                    $timeout(function() {
                        elm.remove();
                    }, 3000);
                }
            });

            player.addMarker({
                time:15,
                template: '<div class="example-marker">This shows even if you seek trough</div>',
                launchOnSeek: true,
                handler: function () {
                    var elm = $compile(this.template)($scope);
                    player.getOverlayElement().append(elm);
                    $timeout(function() {
                        elm.remove();
                    }, 3000);
                }
            });

            player.addMarker({
                time:30,
                template: '<div class="full-screen-marker-example">This blocks your seek, but only once' +
                          '<button ng-click="closeMarker()">close</button></div>',
                launchOnSeek: true,
                fireOnce: true,
                handler: function () {
                    var elm = $compile(this.template)($scope);
                    player.getOverlayElement().append(elm);
                    $scope.closeMarker = function() {
                        elm.remove();
                        player.playVideo();
                    };
                    player.pauseVideo();
                }
            });
        }
    });

    $scope.fullScreen = function () {
        $scope.player1.requestFullscreen();
    };
}]);
