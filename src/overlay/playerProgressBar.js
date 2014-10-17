/* global angular, YT */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerProgressBar', ['$compile', function($compile) {
        return {
            restrict: 'E',
            require: '^youtubePlayer',
            templateUrl: '/template/overlay/player-progress-bar.html',
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
                    // When someone seeks the video update the progress
                    player.on('seekToBegin', updateProgress);
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
    .directive('hoverIndicator', ['$document','$compile','$templateCache','$http','youtubeReadableTime',
                                  function($document, $compile,$templateCache,$http, youtubeReadableTime) {
        return {
            restrict: 'A',
            require: '^youtubePlayer',
//            templateUrl: '/template/overlay/hover-indicator.html',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {

                // TODO: This is copy pasted from ytSlider, refactor!!!
                var getPercentageFromPageX = function (pagex) {
                    // Get the player bar x from the page x
                    var left =  elm[0].getBoundingClientRect().left;
                    var x = Math.min(Math.max(0,pagex - left),elm[0].clientWidth);

                    // Get the percentage of the bar
                    var xpercent = x / elm[0].clientWidth;
                    return xpercent;
                };
                // TODO: check how bootstrap does this
                var template = $http.get('/template/overlay/hover-indicator.html', { cache: $templateCache }).then(function(response) {
                    return response.data;
                });
                var indicatorElm = null;
                var indicatorScope = scope.$new(true);
                template.then(function(template) {
                    indicatorElm = $compile(template)(indicatorScope);
                    // Hide it
                    indicatorElm.addClass('ng-hide');

                    // Add it to the parent
                    elm.parent().append(indicatorElm);
                });

                youtubePlayerCtrl.getPlayer().then(function(player){
                    var duration = player.getDuration();

                    var barMove = function(event) {
                        var p = getPercentageFromPageX(event.pageX);
                        indicatorScope.$apply(function(scope) {
                            scope.time = youtubeReadableTime(p * duration);
                        });
                        indicatorElm.css('left', (p * 100) + '%');
                    };

                    elm.on('mouseenter', function() {
                        $document.on('mousemove', barMove);
                        indicatorElm.removeClass('ng-hide');

                    });
                    elm.on('mouseleave', function() {
                        $document.off('mousemove', barMove);
                        indicatorElm.addClass('ng-hide');
                    });
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
                    // If the marker has extra css, add it
                    if (marker.barCss !== '') {
                        elm.addClass(marker.barCss);
                    }

                    var relativeTime = 100 * marker.time / duration;
                    elm.css('left', relativeTime + '%');

                });
            }
        };
    });
})(angular);

