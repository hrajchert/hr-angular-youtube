/* global angular, YT */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerProgressBar', ['$compile', function($compile) {
        return {
            restrict: 'E',
            require: '^youtubePlayer',
            template: '<div yt-slider="onSliderUp($percentage)"' +
                      '     yt-slider-down="onSliderDown()"' +
                      '     yt-slider-move="onSliderMove($percentage)" style="width:100%;height:100%;">' +
                      '  <div class="hr-yt-played"></div>' +
                      '  <div class="hr-yt-loaded"></div>' +
                      '  <div class="hr-yt-handle"></div>' +
                      '</div>',
            scope: {},
            link: function(scope, elm, attrs, youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){

                    var duration = player.getDuration();
                    var $played = angular.element(elm[0].querySelector('.hr-yt-played')),
                        $loaded = angular.element(elm[0].querySelector('.hr-yt-loaded')),
                        $handle = angular.element(elm[0].querySelector('.hr-yt-handle'));

                    var updateProgress = function(sec) {
                        var played, loaded;
                        if (player.getPlayerState() === YT.PlayerState.ENDED ) {
                            played = 100;
                            loaded = 100;
                        } else if ( typeof sec === 'number') {
                            // debugger;
                            played = 100 * sec / duration;
                            loaded = player.getVideoLoadedFraction() * 100;
                        } else {
                            played = 100 * player.getCurrentTime() / duration;
                            loaded = player.getVideoLoadedFraction() * 100;
                        }
                        // This was calculated manually, but cant have
                        // outerwidth without adding jquery
                        var handleOuterWidth = 15;
                        var handleX = played * elm[0].clientWidth / 100 - handleOuterWidth / 2  ;
                        handleX = Math.min(Math.max(0, handleX),elm[0].clientWidth - handleOuterWidth);
                        $loaded.css('width', loaded + '%');
                        $played.css('width', played + '%');
                        $handle.css('left', handleX + 'px');
                    };
                    // Update the progress on an interval when playing
                    player.onProgress(function(){
                        // The interval calls updateProgress with a number, so we need to add this inner fn
                        updateProgress();
                    });
                    // Update the progress every time there state changes
                    player.on('onStateChange', updateProgress);


                    var playStatus = null;
                    scope.onSliderDown = function () {
                        // Save the status of the player at the begining of the dragndrop
                        playStatus = player.getPlayerState();
                        player.pauseVideo();
                    };


                    scope.onSliderMove = function(percentage) {
                        // See what second it corresponds to
                        var sec = Math.round(duration * percentage);
                        // player.eventSeekTo(sec, false);
                        updateProgress(sec);
                    };

                    scope.onSliderUp = function(percentage) {
                        // See what second it corresponds to
                        var sec = Math.round(duration * percentage);
                        if (playStatus === YT.PlayerState.PLAYING || playStatus === YT.PlayerState.PAUSED) {
                            // Load it in the player
                            player.eventSeekTo(sec, true);
                            // Force update progress because seekTo takes its time
                            updateProgress(sec);
                        } else {
                            player.startLoading(sec);
                        }

                        // If it was playin before, play now as well
                        if (playStatus === YT.PlayerState.PLAYING) {
                            player.playVideo();
                        }
                    };


                    // Add markers  to the bar
                    var addMarker = function(marker) {
                        if (!marker.showMarker) {
                            return;
                        }
                        var $markerElm = angular.element('<span class="hr-yt-marker" '+
                                                         '      marker-name="'+marker.name+'">'+
                                                         '</span>');
                        elm.append($markerElm);
                        $compile($markerElm)(scope);
                    };
                    // Existing markers
                    angular.forEach(player.getMarkers(), addMarker);
                    // New markers
                    player.on('markerAdd', addMarker );

                });
            }
        };
    }])
    .directive('hrYtMarker',  function() {
        return {
            restrict: 'C',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    var duration = player.getDuration();
                    var marker = player.getMarker(attrs.markerName);
                    var relativeTime = 100 * marker.time / duration;

                    var adjustLeftPosition = function () {
                        var x = relativeTime * elm.parent()[0].clientWidth / 100;
                        elm.css('left', x + 'px');
                    };
                    adjustLeftPosition();
                    player.on('fullscreenEnabled', adjustLeftPosition);
                    angular.element(window).bind('resize', adjustLeftPosition);

                });
            }
        };
    });
})(angular);

