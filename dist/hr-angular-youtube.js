/* global angular */
(function(angular) {
    // Add a default handler to avoid missing the event. This can happen if you add the script manually,
    // which can be useful for performance
    if (typeof window.onYouTubeIframeAPIReady === 'undefined') {
        window.onYouTubeIframeAPIReady = function () {
            setTimeout(function(){
                window.onYouTubeIframeAPIReady();
            }, 100);
        };
    }

    // Do not touch the next comment, is used by gulp to inject template as dependency if needed
    angular.module('hrAngularYoutube', ['hrAngularExtend'/*--TEMPLATE-DEPENDENCIES--*/])

    .run(['youtube', function (youtube) {
        if (youtube.getAutoLoad()) {
            // Add the iframe api to the dom
            var tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';

            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }]);

})(angular);


/* global angular */
(function(angular) {
    function convertToUnits(u) {
        // If its numbers, interpret pixels
        if (typeof u === 'number' || /^\d+$/.test(u)) {
            return u + 'px';
        }
        return u;
    }

    angular.module('hrAngularYoutube')
    .directive('youtubePlayer', ['youtube', function (youtube) {
        var playerAttrs = ['id', 'height', 'width'],
            playerVarAttrs = ['autohide', 'autoplay', 'ccLoadPolicy', 'color', 'controls',
                              'disablekb', 'enablejsapi', 'end', 'fs', 'ivLoadPolicy',
                              'list', 'listType', 'loop', 'modestbranding', 'origin', 'playerapiid',
                              'playlist', 'playsinline', 'rel', 'showinfo', 'start', 'theme'];
        return {
            restrict: 'EA',
            require: ['youtubePlayer', '?ngModel'],
            templateUrl: '/template/youtubePlayer.html',
            scope: {
                videoId: '='
            },
            transclude: true,
            controller: ['$q', function($q) {
                var player = $q.defer();

                this.setPlayer = function (p) {
                    player.resolve(p);
                };
                this.getPlayer = function () {
                    return player.promise;
                };
                this.destroyPlayer = function () {
                    player.promise.then(function(p) {
                        p.destroy();
                    });
                    player = $q.defer();
                };

                var $overlayElm;
                this.setOverlayElement = function (elm) {
                    $overlayElm = elm;
                };


                this.getOverlayElement = function () {
                    return $overlayElm;
                };

                var $videoElm = null;


                this.getVideoElement = function () {
                    if ($videoElm === null) {
                        $videoElm = angular.element(this.getOverlayElement()[0].querySelector('.hr-yt-video-place-holder'));
                    }
                    return $videoElm;
                };
            }],
            link: function (scope, elm, attrs, controllers) {
                var youtubePlayerCtrl = controllers[0],
                    ngModelCtrl = controllers[1];

                elm.css('position','relative');
                elm.css('display','block');
                // Save the overlay element in the controller so child directives can use it
                // TODO: check this out again
                youtubePlayerCtrl.setOverlayElement(elm);

                var $videoDiv = elm[0].querySelector('.hr-yt-video-place-holder');
//                var $outerDiv = angular.element(elm[0].querySelector('.hr-yt-wrapper'));
                var $overlayElm = angular.element(elm[0].querySelector('.hr-yt-overlay'));

                var options = {
                    playerVars: {}
                };

                playerAttrs.forEach(function(name) {
                    if (attrs.hasOwnProperty(name)) {
                        options[name] = attrs[name];
                    }
                });
                playerVarAttrs.forEach(function(name) {
                    if (attrs.hasOwnProperty(name)) {
                        options.playerVars[name] = attrs[name];
                    }
                });

                // See if there is a specific player
                var playerFactoryName = attrs.playerFactory || 'YoutubePlayer';

                var instanceCreated = false;
                var createVideo = function() {
                    instanceCreated = true;
                    options.videoId = scope.videoId;
                    if (!options.hasOwnProperty('width') && !options.hasOwnProperty('height') ) {
                        options.height = '390';
                        options.width = '640';
                    }
                    elm.css('height',convertToUnits(options.height));
                    elm.css('width',convertToUnits(options.width));


                    youtube.loadPlayer(playerFactoryName, $videoDiv, options).then(function(player) {
                        youtubePlayerCtrl.setPlayer(player);

//                        player.setFullScreenElement($outerDiv[0]);
                        player.setOverlayElement($overlayElm);

                        // TODO: I dont like this
                        if (typeof ngModelCtrl !== 'undefined') {
                            ngModelCtrl.$setViewValue(player);
                        }
                        return player;
                    });

                };

                scope.$watch('videoId',function sourceChangeEvent(id) {
                    if (typeof id === 'undefined') {
                        return;
                    }
                    if (!instanceCreated) {
                        createVideo();
                    } else {
                        youtubePlayerCtrl.getPlayer().then(function(p){
                            p.loadVideoById(id);
                        });
                    }

                });


                var aspectRatio = 16 / 9;

                // Maybe add some sort of debounce, but without adding a dependency
                var resizeWithAspectRatio = function () {
                    if (options.height) {
                        var w = Math.round(elm[0].clientHeight * aspectRatio);
                        elm.css('width',convertToUnits(w));

                    } else if (options.width) {
                        var h = Math.round(elm[0].clientWidth / aspectRatio);
                        elm.css('height',convertToUnits(h));
                    }
                };

                if (attrs.hasOwnProperty('keepAspectRatio')) {

                    // If aspect ratio is a string like '16:9', set the proper variable.
                    var aspectMatch = attrs.keepAspectRatio.match(/^(\d+):(\d+)$/);
                    if (aspectMatch) {
                        aspectRatio = aspectMatch[1] / aspectMatch[2];
                    }

                    angular.element(window).bind('resize', resizeWithAspectRatio);
                    // If the window or the element size changes, resize the element
                    var unit = 0;
                    scope.$watch(function(){
                        var newUnit = 0;
                        if (options.height) {
                            newUnit = elm[0].clientHeight;
                        } else {
                            newUnit = elm[0].clientWidth;
                        }
                        if (unit !== newUnit && newUnit !== 0) {
                            setTimeout(function() {
                                scope.$apply(resizeWithAspectRatio);
                            });
                            unit = newUnit;
                        }
                    });

                }

                scope.$on('$destroy', function() {
                    youtubePlayerCtrl.destroyPlayer();
                    instanceCreated = false;
                    if (typeof ngModelCtrl !== 'undefined') {
                        ngModelCtrl.$setViewValue(undefined);
                    }

                    angular.element(window).unbind('resize', resizeWithAspectRatio);
                });

            }
        };
    }]);


})(angular);

/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('ytSlider',['$parse','$document',  function($parse, $document) {
        return {
            restrict: 'A',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                var slideDown  = $parse(attrs.ytSliderDown),
                    sliderMove = $parse(attrs.ytSliderMove),
                    sliderUp   = $parse(attrs.ytSlider);

                var getPercentageFromPageX = function (pagex) {
                    // Get the player bar x from the page x
                    var left =  elm[0].getBoundingClientRect().left;
                    var x = Math.min(Math.max(0,pagex - left),elm[0].clientWidth);

                    // Get the percentage of the bar
                    var xpercent = x / elm[0].clientWidth;
                    return xpercent;
                };

                youtubePlayerCtrl.getPlayer().then(function(){
                    var $videoElm = youtubePlayerCtrl.getVideoElement();

                    elm.on('mousedown', function(e) {
                        // If it wasn't a left click, end
                        if (e.button !== 0) {
                            return;
                        }

                        var p = getPercentageFromPageX(e.pageX);
                        slideDown(scope,{$percentage: p});

                        // Create a blocker div, so that the iframe doesn't eat the mouse up events
                        var $blocker = angular.element('<div></div>');
                        $blocker.css('position', 'absolute');
                        $blocker.css('width', $videoElm[0].clientWidth + 'px');
                        $blocker.css('height', $videoElm[0].clientHeight + 'px');
                        $blocker.css('pointer-events', 'false');
                        $blocker.css('top', '0');
                        $videoElm.parent().append($blocker);


                        var documentMouseMove = function(event) {
                            scope.$apply(function(){
                                var p = getPercentageFromPageX(event.pageX);
                                sliderMove(scope,{$percentage: p});
                            });

                        };

                        var documentMouseUp = function(event) {
                            scope.$apply(function() {
                                var p = getPercentageFromPageX(event.pageX);

                                // Remove the event listeners for the drag and drop
                                $document.off('mousemove', documentMouseMove );
                                $document.off('mouseup', documentMouseUp);
                                // remove the div that was blocking the events of the iframe
                                $blocker.remove();

                                sliderUp(scope, {$percentage: p});
                            });

                        };

                        $document.on('mousemove', documentMouseMove );
                        $document.on('mouseup', documentMouseUp);
                    });

                });
            }
        };
    }]);
})(angular);



/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerCurrentQuality',  function() {
        return {
            restrict: 'EA',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    var setPlaybackQuality = function () {
                        var quality;
                        if (attrs.hasOwnProperty('intendedQuality')) {
                            var showRealAuto = false;
                            if (attrs.hasOwnProperty('showRealAuto')) {
                                showRealAuto = true;
                            }
                            quality = player.getHumanIntendedPlaybackQuality(showRealAuto);
                        } else {
                            quality = player.getHumanPlaybackQuality ();
                        }
                        elm.html(quality);
                    };
                    player.on('onPlaybackQualityChange',setPlaybackQuality);
                    player.on('onIntentPlaybackQualityChange',setPlaybackQuality);
                    setPlaybackQuality();
                });
            }
        };
    });
})(angular);



/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerCurrentSpeed',  function() {
        return {
            restrict: 'EA',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    var setPlaybackRate = function () {
                        elm.html(player.getPlaybackRate ());
                    };
                    player.on('onPlaybackRateChange',setPlaybackRate);
                    setPlaybackRate();
                });
            }
        };
    });
})(angular);


/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerCurrentTime',  function() {
        return {
            restrict: 'EA',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    player.onProgress(function(){
                        elm.html(player.getHumanReadableCurrentTime());
                    },250);
                    player.on('seekToCompleted', function(){
                        elm.html(player.getHumanReadableCurrentTime());
                    });
                });
            }
        };
    });
})(angular);


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


/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerPause',  function() {
        return {
            restrict: 'E',
            require: '^youtubePlayer',
            templateUrl: '/template/overlay/player-pause.html',
            transclude: true,
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    elm.on('click', function() {
                        player.pauseVideo();
                    });
                });
            }
        };
    });
})(angular);


/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerPlay',  function() {
        return {
            restrict: 'E',
            require: '^youtubePlayer',
            templateUrl: '/template/overlay/player-play.html',
            transclude: true,
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    elm.on('click', function() {
                        player.playVideo();
                    });
                });
            }
        };
    });
})(angular);


/* global angular, YT */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerProgressBar', [function() {
        return {
            restrict: 'E',
            require: ['^youtubePlayer'],
            templateUrl: '/template/overlay/player-progress-bar.html',

            scope: {

            },
            link: function(scope, elm, attrs, ctrls) {
                var youtubePlayerCtrl = ctrls[0];


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
                    // When someone seeks the video update the progress to the intended seek time
                    player.on('seekToBegin', function(seekTime) {
                        updateProgress(seekTime.newTime);
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
                        } else {
                            player.startLoading(sec);
                        }

                        // If it was playin before, play now as well
                        if (playStatus === YT.PlayerState.PLAYING) {
                            player.playVideo();
                        }
                    };

                    scope.markers = player.getMarkers();
                    player.on('markerListChanged', function () {
                        scope.markers = player.getMarkers();
                    });

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
            scope: {
                marker: '='
            },
            link: function(scope, elm, attrs,youtubePlayerCtrl) {

                youtubePlayerCtrl.getPlayer().then(function(player){
                    var duration = player.getDuration();
                    var marker = scope.marker;
                    // If the marker has extra css, add it
                    if (marker.barCss !== '') {
                        elm.addClass(marker.barCss);
                    }
                    var setRelativeTime = function () {
                        var relativeTime = 100 * marker.startTime / duration;
                        elm.css('left', relativeTime + '%');
                    };
                    setRelativeTime();
                    if (marker.hasOwnProperty('mutable') && marker.mutable) {
                        scope.$watch(
                            function() {
                                return marker.startTime;
                            },
                            function(newTime, oldTime) {
                                if (newTime === oldTime) {
                                    return;
                                }
                                setRelativeTime();
                            }
                        );
                    }

                });
            }
        };
    });
})(angular);


/* global angular, YT */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerRepeatAvailableQuality', ['youtubeQualityMap',  function(youtubeQualityMap) {
        return {
            restrict: 'A',
            template: function (tElm) {
                tElm.removeAttr('player-repeat-available-quality');
                tElm.attr('ng-repeat','$quality in availableQuality');
                return tElm[0].outerHTML;
            },
            replace: true,
            priority: 1000,
            scope: {

            },
            require: '^youtubePlayer',
            link: function(scope, elm, attrs, youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    // Youtube doesnt inform you on the available qualities until loading video
                    var unbind = player.on('onStateChange', function(event) {
                        if (event.data === YT.PlayerState.PLAYING) {
                            unbind();
                            scope.availableQuality = youtubeQualityMap.convertToYoutubeArray(player.getAvailableQualityLevels());
                            if (attrs.hasOwnProperty('reverse')) {
                                scope.availableQuality.reverse();
                            }

                        }
                    });
                    // So default is Auto
                    scope.availableQuality = ['Auto'];

                });
            }

        };
    }]);
})(angular);



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


/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerTotalTime',  function() {
        return {
            restrict: 'EA',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    elm.html(player.getHumanReadableDuration());
                });
            }
        };
    });
})(angular);


/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerVolumeHorizontal',  function() {
        return {
            restrict: 'E',
            require: '^youtubePlayer',
            templateUrl: '/template/overlay/player-volume-horizontal.html',
            transclude: true,
            scope: {},
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                var $volumeBar = angular.element(elm[0].querySelector('.hr-yt-volume-hr-bar')),
                    $settedBar = angular.element(elm[0].querySelector('.hr-yt-setted')),
                    $handle    = angular.element(elm[0].querySelector('.hr-yt-handle'));

                youtubePlayerCtrl.getPlayer().then(function(player){
                    var updateVolumeBar = function(volume) {
                        var handleX = volume * $volumeBar[0].clientWidth - $handle[0].clientWidth / 2  ;
                        handleX = Math.min(Math.max(0, handleX),$volumeBar[0].clientWidth - $handle[0].clientWidth / 2);
                        $settedBar.css('width', volume * 100 + '%');
                        $handle.css('left', handleX + 'px');
                    };
                    scope.toggleMute = function() {
                        player.toggleMute();
                    };
                    scope.onSliderMove = function (volume) {
                        player.setVolume(volume * 100);
                        updateVolumeBar(volume);
                    };

                    scope.onSliderUp = function (volume) {
                        player.setVolume(volume * 100);
                        updateVolumeBar(volume);
                    };
                    scope.$watch(function(){
                        return player.getVolume();
                    }, function(volumeFromModel) {
                        updateVolumeBar(volumeFromModel / 100);
                    });
                });
            }
        };
    });
})(angular);


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



/* global angular */
(function(angular) {


    angular.module('hrAngularYoutube')

    .factory('YoutubeMarkerList',[function () {

        var YoutubeMarkerList = function () {
            this.markersById = {};
            this.player = null;
        };

        YoutubeMarkerList.prototype.getMarkers = function () {
            return this.markersById;
        };
        YoutubeMarkerList.prototype.add = function (marker) {
            this.markersById[marker.id] = marker;
            // Notify who might be interested
            this.player.emit('markerAdd', marker);
            return marker;
        };

        YoutubeMarkerList.prototype.remove = function (id) {
            var marker = this.markersById[id];
            if (marker) {
                delete this.markersById[id];
                // Notify who might be interested
                this.player.emit('markerRemove', marker);
            }
            return marker;
        };

        YoutubeMarkerList.prototype.getMarker = function (id) {
            return this.markersById[id];
        };
        YoutubeMarkerList.prototype.setPlayer = function (player) {
            this.player = player;
        };
        return YoutubeMarkerList;

    }]);


})(angular);

/* global angular */
(function(angular) {


    angular.module('hrAngularYoutube')

    .factory('YoutubeMarker',['youtubeUuid', function (youtubeUuid) {

        /*jshint maxcomplexity:false */
        var YoutubeMarker = function(options) {
            // Set default values
            this.startTime = options.startTime || null;
            this.endTime =  options.endTime || null;
            this.duration = options.duration || null;
            this.handler = options.handler || this.handler || null;
            // Whether this marker should be launched every time the marker pass or just the first time (assuming seeks)
            this.fireOnce = options.fireOnce || false;
            // Launch the marker when the user seeks past the marker time
            this.launchOnSeek = options.launchOnSeek || false;
            // Block when user fast forwards past the marker
            this.blockFF = options.blockFF || false;
            //Wether to show the marker in a status bar
            this.showMarker = typeof options.showMarker !== 'undefined'?options.showMarker : true;
            // Extra css class that can be added to the marker bar
            this.barCss = typeof options.barCss !== 'undefined'?options.barCss:'';

//            this.name =  null;

            this._runCount = 0;
            this._isRunning = false;

            this.player = null;

            // Override with user options
//            angular.extend(this, options);
            this.id = this.id || options.id || youtubeUuid.getHash();

            // Duration implies end time
            if (this.duration !== null) {
                this.endTime = this.startTime + this.duration;
            }
        };

        YoutubeMarker.prototype.setPlayer = function (player) {
            this.player = player;
        };

        YoutubeMarker.prototype.getPlayer = function () {
            return this.player;
        };

        YoutubeMarker.prototype.shouldLaunchOnSeek = function (seekTime) {
            if (this.getLaunchOnSeek()) {
                if (this.hasEndTime()) {
                    return this.inRange(seekTime.newTime);
                } else {
                    return this.startTime >= seekTime.oldTime && this.startTime <= seekTime.newTime;
                }
            }
        };

        YoutubeMarker.prototype.getLaunchOnSeek = function () {
            // Block when fast forward implies launch on seek
            if (this.getBlockOnFF()) {
                return true;
            }

            return this.launchOnSeek;
        };

        YoutubeMarker.prototype.getBlockOnFF = function () {
            // If already fired and we only want to fire once, it shouldn't block
            if (this._runCount > 0 && this.fireOnce ) {
                return false;
            }
            return this.blockFF;
        };

        YoutubeMarker.prototype.hasEndTime = function () {
            return this.endTime !== null;
        };

        YoutubeMarker.prototype.inRange = function (t) {
            // If it doesn't have an end time, it cannot be in range
            if (!this.hasEndTime()) {
                return false;
            }
            return t >= this.startTime && t < this.endTime;
        };

        YoutubeMarker.prototype.startedIn = function (begin, end) {
            // If already fired and we only want to fire once, do nothing
//            if (this._runCount > 0 && this.fireOnce ) {
//                return false;
//            }

            return this.startTime > begin && this.startTime <= end;
        };




        YoutubeMarker.prototype.endedIn = function (begin, end) {
            if (!this.hasEndTime()) {
                return false;
            }
//            // If its not running, it cant end
//            if (!this._isRunning) {
//                return false;
//            }
            return this.endTime > begin && this.endTime <= end;
        };


        YoutubeMarker.prototype.start = function () {
            // If we are already running, dont do anything
            if (this._isRunning) {
                return false;
            }

            // If already fired and we only want to fire once, do nothing
            if (this._runCount > 0 && this.fireOnce ) {
                return false;
            }

            this._runCount++;
            this._isRunning = true;
            // If there is a handler, call it
            if (typeof this.handler === 'function') {
                this.handler();
            }
            return true;
        };

        YoutubeMarker.prototype.end = function () {
            if (this.isRunning()) {
                this._isRunning = false;

                // If there is an end handler call it
                if (typeof this.onEnd === 'function') {
                    this.onEnd();
                }
            }
        };

        YoutubeMarker.prototype.isRunning = function () {
            return this._isRunning;
        };

        return YoutubeMarker;

    }]);


})(angular);

/* global angular, YT  */
(function(angular) {
    'use strict';

    angular.module('hrAngularYoutube')

    .factory('YoutubePlayer', ['$q', '$interval','$rootScope', 'youtubeReadableTime',
             'youtubeQualityMap', 'youtubeUuid','YoutubeMarkerList','hrAngularExtend',
        function ($q, $interval, $rootScope, youtubeReadableTime, youtubeQualityMap,
                  youtubeUuid, YoutubeMarkerList, hrAngularExtend) {


            var YoutubePlayer = function(elmOrId, options) {

                this.options = options;

                var op = angular.copy(options);
                // TODO: Add a fit to parent or something like that
                op.width = '100%';
                op.height = '100%';

                var self = this;

                this.player = new YT.Player(elmOrId, op);

                this.markerList = new YoutubeMarkerList();
                this._muted = false;
                this._volume = 100;
                this._intendedQuality = 'auto';

                this.on('onStateChange', function(event) {
                    if (event.data === YT.PlayerState.PLAYING) {
                        self.setVolume(self.player.getVolume());
                        self._setMuted(self.player.isMuted());
                    }
                });
                // If a marker is added, make sure the marker listener is initialized
                this.on('markerAdd', function(marker) {
                    self._initializeMarkerListener();
                    marker.setPlayer(self);
                });

                // If a marker is removed make sure its stoped
                this.on('markerRemove', function(marker) {
                    marker.end();
                });

            };

            hrAngularExtend.factory(YoutubePlayer);

            // TODO: Inherit better than these :S once i know if this is the way I want to access the object
            angular.forEach([
                'getOptions', 'loadModule', 'loadVideoById', 'loadVideoByUrl', 'cueVideoById', 'cueVideoByUrl', 'cuePlaylist',
                'loadPlaylist', 'playVideo', 'pauseVideo', 'stopVideo', 'seekTo', 'clearVideo',
                'nextVideo', 'previousVideo', 'playVideoAt',
                'setSize', 'getPlaybackRate', 'setPlaybackRate', 'getAvailablePlaybackRates',
                'setLoop', 'setShuffle', 'getVideoLoadedFraction', 'getPlayerState', 'getCurrentTime',
                'getPlaybackQuality', 'setPlaybackQuality', 'getAvailableQualityLevels', 'getDuration',
                'getVideoUrl', 'getVideoEmbedCode', 'getPlaylist', 'getPlaylistIndex', 'getIframe', 'destroy'
                // 'addEventListener', 'removeEventListener','mute',unMute,isMuted,getVolume,setVolume
            ], function(name) {
                YoutubePlayer.prototype[name] = function() {
                    return this.player[name].apply(this.player, arguments);
                };
            });

            YoutubePlayer.prototype.setOverlayElement = function (elm) {
                this._element = elm;
            };

            YoutubePlayer.prototype.getOverlayElement = function () {
                return this._element;
            };


            YoutubePlayer.prototype.getHumanReadableDuration = function () {
                return youtubeReadableTime(this.getDuration());
            };

            YoutubePlayer.prototype.getHumanReadableCurrentTime = function () {
                return youtubeReadableTime(this.getCurrentTime());
            };



            YoutubePlayer.prototype.onProgress = function (fn, resolution) {
                if (typeof resolution === 'undefined') {
                    resolution = 100;
                }
                var promise = null;
                var startInterval = function () {
                    if (promise === null) {
                        promise = $interval(fn, resolution);
                    }
                };
                var stopInterval = function () {

                    $interval.cancel(promise);
                    promise = null;
                };

                var cancel = function() {
                    stopInterval();
                    // TODO: something more to destroy / release stuff.
                };
                this.on('onStateChange', function(event) {
                    if (event.data === YT.PlayerState.PLAYING) {
                        startInterval();
                    } else {
                        stopInterval();
                    }
                });

                if (this.getPlayerState() === YT.PlayerState.PLAYING) {
                    startInterval();
                }
                return cancel;
            };



            /**
             * Its like seekTo, but fires an event when the seek is complete
             */
            YoutubePlayer.prototype.eventSeekTo = function (sec, allowSeekAhead) {
                var self = this;
                var initialTime = this.player.getCurrentTime();

                // If there is a blocking marker, don't allow to seek further than it
                angular.forEach(self.markerList.getMarkers(), function(marker) {
                    // If its not blocking, we dont care
                    if (!marker.getBlockOnFF()) {
                        return;
                    }

                    // If the marker is in the seek time, force the sec to be at the marker time
                    if (marker.startedIn(initialTime, sec)) {
                        sec = marker.startTime;
                    }
                });

                // Seek to sec
                this.player.seekTo(sec, allowSeekAhead);
                // Inform of the intent to seek
                self.emit('seekToBegin', {newTime: sec, oldTime: initialTime});

                var seekPromise = $q.defer();
                // Check on a time interval that the seek has been completed
                var promise = $interval(function() {
                    var currentTime = self.player.getCurrentTime();
                    var seekCompleted = false;


                    if (sec < initialTime ) {
                        // If we intent to go backwards, we complete when current time is lower
                        // than the initial one
                        if (currentTime < initialTime) {
                            seekCompleted = true;
                        }

                    } else {
                        // If we intent to go forward, we complete once we pass the intended mark
                        if ( currentTime >= sec ) {
                            seekCompleted = true;
                        }
                    }
                    // There may be a third scenario where the player is paused, you pushed
                    // forward and it complete but just next to sec.

                    // Once its complete, for whatever reason, fire the event and cancel this interval
                    if (seekCompleted) {
                        $interval.cancel(promise);
                        var ans = {newTime: sec, oldTime: initialTime};
                        self.emit('seekToCompleted', ans);
                        seekPromise.resolve(ans);
                    }
                }, 50);
                return seekPromise.promise;
            };

            YoutubePlayer.prototype.startLoading = function (sec) {
                var self = this;
                var unregister;
                var pauseAfterStart = function (event) {
                    if (event.data === YT.PlayerState.PLAYING) {
                        if (typeof sec === 'number') {
                            self.eventSeekTo(sec, true);
                        }
                        unregister();
                        self.player.pauseVideo();
                    }
                };
                unregister = this.on('onStateChange', pauseAfterStart);
                this.player.playVideo();
            };

            YoutubePlayer.prototype._initializeEventListener = function () {
                if (this._eventsInitialized ) {
                    return;
                }
                var self = this;
                this._eventHash = youtubeUuid.getHash();
                var events = ['onStateChange', 'onPlaybackQualityChange', 'onPlaybackRateChange',
                              'onError', 'onApiChange', 'onReady'];
                angular.forEach(events, function(name) {
                    self.player.addEventListener(name, function(data) {
                        self.emit(name,data);
                    });
                });
                this._eventsInitialized = true;
            };


            YoutubePlayer.prototype.on = function (name, handler) {
                this._initializeEventListener();

                return $rootScope.$on(this._eventHash + name, function(e, eventData) {
                    handler(eventData);
                });
            };

            YoutubePlayer.prototype.emit = function(name, data) {
                $rootScope.$emit(this._eventHash + name, data);
            };

            YoutubePlayer.prototype._initializeMarkerListener = function () {
                // Only initialize markers once
                if ( this._markerListener ) {
                    return;
                }
                this._markerListener = true;

                var runMarker = function (marker) {
                    if (marker.start()) {
                        // Emit an event with the marker
                        self.emit('markerRun', marker);
                    }
                };
                var stopMarker = function (marker) {
                    marker.end();
                    // Emit an event with the marker
                    self.emit('markerStop', marker);
                };



                var self = this;
                var lastMarkerTime = -1;
                this.onProgress(function() {
                    var currentTime = self.getCurrentTime();
                    var newLastTime = lastMarkerTime;
                    angular.forEach(self.markerList.getMarkers(), function(marker) {
                        // If the marker time has past and we haven't launched this marker yet
                        if (marker.startedIn(lastMarkerTime, currentTime) ) {
                            runMarker(marker);
                            newLastTime = Math.max(newLastTime, marker.startTime);
                        }
                        // If the marker has ended
                        if (marker.endedIn(lastMarkerTime, currentTime) && marker.isRunning()) {
                            stopMarker(marker);
                            newLastTime = Math.max(newLastTime, marker.endTime);
                        }
                    });
                    lastMarkerTime = newLastTime;
                });

                this.on('seekToCompleted', function(seekTime){
                    angular.forEach(self.markerList.getMarkers(), function(marker) {
                        if (marker.isRunning()) {
                            // If the marker is running and the seek throws it out of range, stop it
                            if (!marker.inRange(seekTime.newTime)) {
                                stopMarker(marker);
                            }
                        }else {
                            // If the marker is not running, see if we need to start it
                            if (marker.shouldLaunchOnSeek(seekTime)) {
                                runMarker(marker);
                            }
                        }

                    });
                    lastMarkerTime = seekTime.newTime;
                });
            };

            // TODO: Revisit... I think with the addond of the player factory this
            // shouldnt be needed
            YoutubePlayer.prototype.setMarkerList = function (list) {
                this._initializeMarkerListener();
                this.markerList = list;
                this.markerList.setPlayer(this);
                this.emit('markerListChanged');
            };

            YoutubePlayer.prototype.addMarker = function (marker) {
                return this.markerList.add(marker);
            };

            YoutubePlayer.prototype.removeMarker = function (markerId) {
                return this.markerList.removeById(markerId);
            };

            YoutubePlayer.prototype.getMarkers = function () {
                return this.markerList.getMarkers();
            };
            YoutubePlayer.prototype.getMarker = function (id) {
                return this.markerList.getMarker(id);
            };


            YoutubePlayer.prototype.setVolume = function (volume) {
                // If volume is 0, then set as muted, if not is unmuted
                this._setMuted(volume === 0);
                this._volume = volume;
                this.player.setVolume(volume);
            };

            YoutubePlayer.prototype.getVolume = function () {
                if (this._muted) {
                    return 0;
                }
                return this._volume;
            };

            YoutubePlayer.prototype._setMuted = function (muted) {
                var changed = this._muted !== muted;
                this._muted = muted;
                if (changed) {
                    this.emit('muteChange');
                }
            };

            YoutubePlayer.prototype.mute = function () {
                this._setMuted(true);
                this.player.mute();
            };

            YoutubePlayer.prototype.unMute = function () {
                this._setMuted(false);
                this.player.unMute();
            };



            YoutubePlayer.prototype.isMuted = function () {
                return this._muted;
            };

            YoutubePlayer.prototype.toggleMute = function () {
                if (this.isMuted()) {
                    this.unMute();
                } else {
                    this.mute();
                }
            };

            YoutubePlayer.prototype.getHumanPlaybackQuality = function () {
                return youtubeQualityMap.convertToYoutube(this.player.getPlaybackQuality());
            };


            YoutubePlayer.prototype.getHumanIntendedPlaybackQuality = function (showRealAuto) {
                var ans = youtubeQualityMap.convertToYoutube(this._intendedQuality);
                if (ans === 'Auto' && showRealAuto && this.getHumanPlaybackQuality() !== 'Auto') {
                    ans += ' ('+ this.getHumanPlaybackQuality() +')';
                }
                return ans;
            };

            YoutubePlayer.prototype.setHumanPlaybackQuality = function (q) {
                var quality = youtubeQualityMap.convertFromYoutube(q);
                this.setPlaybackQuality(quality);
                this.emit('onIntentPlaybackQualityChange');
            };
            YoutubePlayer.prototype.setPlaybackQuality = function (q) {
                this._intendedQuality = q;
                this.player.setPlaybackQuality(q);
            };


            return YoutubePlayer;
        }
    ]);


})(angular);

(function() {
    'use strict';

    angular
        .module('hrAngularYoutube')
        .factory('youtubeQualityMap', youtubeQualityMapService);

    /**
     * @ngdoc service
     * @name hrAngularYoutube.factory:youtubeQualityMap
     *
     * @description
     * TODO: Describe this service
     *
     */
    youtubeQualityMapService.$inject = [];

    function youtubeQualityMapService () {
        var map = {
            'hd1080' : '1080p',
            'hd720' : '720p',
            'large' : '480p',
            'medium' : '360p',
            'small' : '240p',
            'tiny' : '144p',
            'auto' : 'Auto'
        };

        var inverseMap = {};

        initialize();

        return {
            convertToYoutube: convertToYoutube,
            convertFromYoutube: convertFromYoutube,
            convertToYoutubeArray: convertToYoutubeArray
        };

        ///////////////////////////////////////////

        function initialize () {
            var inverse;
            for (var q in map) {
                inverse = map[q];
                inverseMap[inverse] = q;
            }

        }

        function _doConvertToYoutube(q) {
            var ans = map[q];
            if (!ans) {
                ans = 'Auto';
            }
            return ans;
        }

        /**
         * @ngdoc method
         * @name convertToYoutube
         * @methodOf hrAngularYoutube.factory:youtubeQualityMap
         *
         * @description
         * TODO: convertToYoutube description
        */
        function convertToYoutube (q) {
            return _doConvertToYoutube(q);
        }

        /**
         * @ngdoc method
         * @name convertFromYoutube
         * @methodOf hrAngularYoutube.factory:youtubeQualityMap
         *
         * @description
         * TODO: convertFromYoutube description
        */
        function convertFromYoutube (q) {
            var ans = inverseMap[q];
            if (!ans) {
                ans = 'default';
            }
            return ans;
        }

        /**
         * @ngdoc method
         * @name convertToYoutubeArray
         * @methodOf hrAngularYoutube.factory:youtubeQualityMap
         *
         * @description
         * TODO: convertToYoutubeArray description
        */

        function convertToYoutubeArray (arr) {
            var ans = [];
            for (var i = 0; i<arr.length; i++) {
                ans.push(_doConvertToYoutube(arr[i]));
            }
            return ans;
        }
    }
})();

/* global angular */
(function(angular) {


    angular.module('hrAngularYoutube')

    .factory('youtubeReadableTime', function () {

        return function  (t) {
            t = Math.floor(t);
            var seconds = t % 60;
            var minutes = Math.floor(t / 60);
            var hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
            if ( hours > 0 ) {
                return hours + ':' + String('00' + minutes).slice(-2) + ':' + String('00' + seconds).slice(-2);
            } else {
                return minutes + ':' + String('00' + seconds).slice(-2);
            }
        };
    });


})(angular);

/* global angular */
(function(angular) {


    angular.module('hrAngularYoutube')

    .factory('YoutubeTemplateMarker', ['$rootScope','$compile','YoutubeMarker','$q','$http','$templateCache',
                                       function($rootScope, $compile,YoutubeMarker, $q,$http,$templateCache) {
        var YoutubeTemplateMarker = function (options) {
            YoutubeMarker.call(this, options);

            this._elm = null;
            this._scope = null;
            this._parentScope = options.scope || $rootScope;
            this._parentElm = options.parent;
            this._addMethod = options.addMethod || 'append';
            this.template = options.template || null;
            this.link = options.link || this.link || null;


            this._loadTemplate(options);
        };

        angular.extend(YoutubeTemplateMarker.prototype, YoutubeMarker.prototype);

       YoutubeTemplateMarker.prototype.setParent = function (parent) {
           this._parentElm = parent;
       };
       YoutubeTemplateMarker.prototype.getParent = function () {
           return this._parentElm;
       };

       YoutubeTemplateMarker.prototype.setParentScope = function (scope) {
           this._parentScope = scope;
       };
       YoutubeTemplateMarker.prototype.getParentScope = function () {
           return this._parentScope;
       };

        YoutubeTemplateMarker.prototype.handler = function () {
            var self = this;

            // Make sure we have somewhere to insert it
            if (!this._parentElm) {
                this._parentElm = this.player.getOverlayElement();
            }

            // Create a new isolated scope
            this._scope = this._parentScope.$new(true);
            // Create the element from the template
            this.template.then(function(template) {
                // Add the element where its supposed to be
                var elm = angular.element(template);
                self._parentElm[self._addMethod](elm);

                // Compile and link it
                self._elm = $compile(elm)(self._scope);

                // Call the optional marker link function to allow logic in the scope
                if (typeof self.link === 'function') {
                    self.link(self._scope);
                }
            });
        };

        YoutubeTemplateMarker.prototype._loadTemplate = function (options) {
            if (options.hasOwnProperty('template')) {
                this.template = $q.when(options.template);
            } else if (options.hasOwnProperty('templateUrl')) {
                this.template = $http.get(options.templateUrl, { cache: $templateCache }).then(function(response) {
                    return response.data;
                });
            }
        };

        // When the marker ends, remove the template
        YoutubeTemplateMarker.prototype.onEnd = function () {
            this.destroy();
        };

        YoutubeTemplateMarker.prototype.destroy = function () {
            if (this._elm !== null) {
                this._scope.$destroy();
                this._elm.remove();
                this._scope = null;
                this._elm = null;
            }
        };

        return YoutubeTemplateMarker;
    }]);


})(angular);

/* global angular */
(function(angular) {
    'use strict';

    angular.module('hrAngularYoutube')

    .provider('youtube', function () {
        var defaultOptions = {
            playerVars: {
                origin: location.origin + '/',
                enablejsapi: 1
            }
        };

        var autoload = true;
        this.setAutoLoad = function (auto) {
            autoload = auto;
        };

        this.setOptions = function (options) {
            defaultOptions = options;
        };

        this.getOptions = function () {
            return defaultOptions;
        };

        this.setOption = function (name, value) {
            defaultOptions[name] = value;
        };

        this.setPlayerVarOption = function (name, value) {
            defaultOptions.playerVars[name] = value;
        };

        this.$get = ['$window','$q', '$injector', function ($window, $q, $injector) {

            var apiLoaded = $q.defer();

            var apiLoadedPromise = apiLoaded.promise;


            // Youtube callback when API is ready
            $window.onYouTubeIframeAPIReady = function () {
                apiLoaded.resolve();
            };


            return {
                loadPlayer: function (playerFactoryName,elmOrId, options) {

                    return apiLoadedPromise.then(function(){
                        var YoutubePlayer = $injector.get(playerFactoryName);

                        var videoReady = $q.defer();
                        var newOptions = {};
                        // Override main options
                        angular.extend(newOptions, angular.copy(defaultOptions), options);
                        // Override player var options
                        newOptions.playerVars = {}; // For some reason if I dont reset this angular.extend doesnt work as expected
                        angular.extend(newOptions.playerVars, angular.copy(defaultOptions.playerVars), options.playerVars);

                        var player = new YoutubePlayer(elmOrId, newOptions);
                        player.on('onReady', function() {
                            videoReady.resolve(player);
                        });
                        return videoReady.promise;
                    });

                },
                getAutoLoad: function () {
                    return autoload;
                }

            };
        }];

    });


})(angular);

(function() {
    'use strict';

    angular
        .module('hrAngularYoutube')
        .factory('youtubeUuid', youtubeUuidService);

    /**
     * @ngdoc service
     * @name hrAngularYoutube.factory:youtubeUuid
     *
     * @description
     * Provides unique identifier service
     *
     */
    youtubeUuidService.$inject = [];

    function youtubeUuidService () {

        return {
            getHash: getHash
        };

        ///////////////////////////////////////////

        function initialize () {
            console.log(globalServiceVariable);
        }

        /**
         * @ngdoc method
         * @name getHash
         * @methodOf hrAngularYoutube.factory:youtubeUuid
         *
         * @description
         * Creates a hash string that follows the UUID standard
        */
        function getHash () {
            return Math.floor((1 + Math.random()) * 0x10000)
                               .toString(16)
                               .substring(1);
        }
    }
})();
