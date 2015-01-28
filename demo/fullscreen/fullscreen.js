/* global angular */
angular.module('demoFullscreen', ['hrAngularYoutube'])
// TODO: Move this into the FullscreenVideoPlayer in a fancy way
.config(['youtubeProvider', function(youtubeProvider) {
    // This options are the ones from here
    // https://developers.google.com/youtube/player_parameters?playerVersion=HTML5
    youtubeProvider.setPlayerVarOption('controls',0);
    youtubeProvider.setPlayerVarOption('showinfo',false);
    youtubeProvider.setPlayerVarOption('modestbranding',1);
    youtubeProvider.setPlayerVarOption('disablekb',1);
}])

.factory('FullscreenVideoPlayer', ['YoutubePlayer', function(YoutubePlayer) {
    function FullscreenVideoPlayer (elmOrId, options) {
        // Initialize parent
        YoutubePlayer.call(this, elmOrId, options);

        // Initialize Mixins
//        YoutubePlayerFullscreenMixin.call(this);

    }

    YoutubePlayer.extend(FullscreenVideoPlayer);
//YoutubePlayer.extend(FullscreenVideoPlayer, [YoutubePlayerFullscreenMixin]);

    return FullscreenVideoPlayer;
}])

.controller('FullscreenDemoCtrl', function(){
    this.id = 'i_mKY2CQ9Kk';
});
