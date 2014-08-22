/* global angular */
angular.module('demoMarker', ['hrAngularYoutube'])
.config(['youtubeProvider', function(youtubeProvider) {
    // This options are the ones from here
    // https://developers.google.com/youtube/player_parameters?playerVersion=HTML5
    youtubeProvider.setPlayerVarOption('controls',0);
    youtubeProvider.setPlayerVarOption('rel',0);
    youtubeProvider.setPlayerVarOption('modestbranding',1);
}])


.controller('MarkerDemoCtrl', ['$scope','YoutubeMarker','YoutubeTemplateMarker', function($scope,YoutubeMarker,YoutubeTemplateMarker){
    $scope.id = 'QjX9Wu-MJ-s';

    $scope.$watch('player1', function(player) {

        if (typeof player === 'undefined') {
            return;
        }

        player.mute();
        player.addMarker(new YoutubeMarker({
            time: 3,
            showMarker: false,
            handler: function() {
                console.log('Basic marker!');
            }
        }));

        player.addMarker(new YoutubeTemplateMarker(player, {
            time: 10,
            duration: 3,
            template: '<div class="example-marker">This only shows when the video passes normally</div>',
        }));

        player.addMarker(new YoutubeTemplateMarker(player, {
            time: 15,
            duration: 3,
            launchOnSeek: true,
            template: '<div class="example-marker">This shows even if you seek trough</div>'
        }));

        player.addMarker(new YoutubeTemplateMarker(player, {
            time: 30,
            blockFF: true,
            fireOnce: true,
            template: '<div class="full-screen-marker-example">This blocks your seek, but only once' +
                      '<button ng-click="closeMarker()">close</button></div>',
            link: function (player, $scope) {
                console.log('linkin!');
                var self = this;
                $scope.closeMarker = function() {
                    console.log('close!');
                    self.destroy();
                    player.playVideo();
                };
                player.pauseVideo();
            }

        }));

    });


}]);
