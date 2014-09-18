(function(module) {
try {
  module = angular.module('hrAngularYoutubeTpls');
} catch (e) {
  module = angular.module('hrAngularYoutubeTpls', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/template/overlay/hover-indicator.html',
    '<div class="hr-hover-indicator">\n' +
    '    <span ng-bind="time"></span>\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('hrAngularYoutubeTpls');
} catch (e) {
  module = angular.module('hrAngularYoutubeTpls', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/template/overlay/player-progress-bar.html',
    '<div yt-slider="onSliderUp($percentage)"\n' +
    '     yt-slider-down="onSliderDown()"\n' +
    '     yt-slider-move="onSliderMove($percentage)"\n' +
    '     style="width:100%;height:100%;">\n' +
    '        <div class="hr-yt-played"></div>\n' +
    '        <div class="hr-yt-loaded"></div>\n' +
    '        <div class="hr-yt-handle"></div>\n' +
    '</div>\n' +
    '');
}]);
})();

/* global angular */
(function(angular) {

    console.log('main.js');
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
    angular.module('hrAngularYoutube', ['hrAngularYoutubeTpls'])

    .run(['youtube', function (youtube) {
        if (youtube.getAutoLoad()) {
            // Add the iframe api to the dom
            var tag = document.createElement('script');
            tag.src = '//www.youtube.com/iframe_api';
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
            playerVarAttrs = ['autohide', 'autoplay', 'cc_load_policy', 'color', 'controls',
                              'disablekb', 'enablejsapi', 'end', 'fs', 'iv_load_policy',
                              'list', 'listType', 'loop', 'modestbranding', 'origin', 'playerapiid',
                              'playlist', 'playsinline', 'rel', 'showinfo', 'start', 'theme'];
        return {
            restrict: 'EA',
            require: ['youtubePlayer', '?ngModel'],
            template: '<div class="hr-yt-wrapper">' +
                      '  <div class="hr-yt-video-place-holder"></div>' +
                      '  <div class="hr-yt-overlay" ng-transclude=""></div>' +
                      '</div>',
            scope: {
                videoId: '='
            },
            transclude: true,
            controller: ['$scope','$q', function($scope, $q) {
                var player = $q.defer();

                this.setPlayer = function (p) {
                    player.resolve(p);
                };
                this.getPlayer = function () {
                    return player.promise;
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

                var player = null;
                var playerPromise = null;

                elm.css('position','relative');
                elm.css('display','block');

                // Save the overlay element in the controller so child directives can use it
                // TODO: check this out again
                youtubePlayerCtrl.setOverlayElement(elm);

                var $videoDiv = elm[0].querySelector('.hr-yt-video-place-holder');
                var $outerDiv = angular.element(elm[0].querySelector('.hr-yt-wrapper'));
                var $overlayElm = angular.element(elm[0].querySelector('.hr-yt-overlay'));

                var options = {
                    playerVars: {}
                };

                playerAttrs.forEach(function(a) {
                    if (typeof attrs[a] !== 'undefined') {
                        options[a] = attrs[a];
                    }
                });
                playerVarAttrs.forEach(function(a) {
                    if (typeof attrs[a] !== 'undefined') {
                        options.playerVars[a] = attrs[a];
                    }

                });
                var createVideo = function() {
                    options.videoId = scope.videoId;
                    if (!options.hasOwnProperty('width') && !options.hasOwnProperty('height') ) {
                        options.height = '390';
                        options.width = '640';
                    }
                    elm.css('height',convertToUnits(options.height));
                    elm.css('width',convertToUnits(options.width));

                    playerPromise = youtube.loadPlayer($videoDiv, options).then(function(p) {
                        player = p;
                        youtubePlayerCtrl.setPlayer(player);

                        player.setFullScreenElement($outerDiv[0]);
                        player.setOverlayElement($overlayElm);

                        if (typeof ngModelCtrl !== 'undefined') {
                            ngModelCtrl.$setViewValue(player);
                        }
                        return p;
                    });

                };

                scope.$watch('videoId',function sourceChangeEvent(id) {
                    if (typeof id === 'undefined') {
                        return;
                    }
                    if (playerPromise === null) {
                        createVideo();
                    } else {
                        playerPromise.then(function(p){
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
                    scope.$watch(function(){
                        return [elm[0].clientWidth, elm[0].clientHeight].join('x');
                    }, resizeWithAspectRatio);

                }

                scope.$on('$destroy', function() {
                    youtubePlayerCtrl.setPlayer(null);
                    player.destroy();
                    player = null;
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
            template: '<div ng-transclude=""></div>',
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
            template: '<div style="display: inherit" ng-transclude=""></div>',
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
            template: '<div style="display: inherit" ng-transclude=""></div>',
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
                        console.log('super move!',p);
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
    .directive('playerToggleFullscreen',  function() {
        return {
            restrict: 'E',
            require: '^youtubePlayer',
            template: '<div style="display: inherit" ng-transclude=""></div>',
            transclude: true,
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                youtubePlayerCtrl.getPlayer().then(function(player){
                    elm.on('click', function() {
                        player.toggleFullscreen();
                    });
                });
            }
        };
    });
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
            template: '<div ng-click="toggleMute()" class="ng-transclude"></div>'+
                      '<div class="hr-yt-volume-hr-bar"' +
                      '     yt-slider-move="onSliderMove($percentage)"' +
                      '     yt-slider="onSliderUp($percentage)">'+
                      '  <div class="hr-yt-setted"></div>'+
                      '  <div class="hr-yt-handle"></div>'+
                      '</div>',
            transclude: true,
            scope: {},
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                var $volumeBar = angular.element(elm[0].querySelector('.hr-yt-volume-hr-bar')),
                    $settedBar = angular.element(elm[0].querySelector('.hr-yt-setted')),
                    $handle    = angular.element(elm[0].querySelector('.hr-yt-handle'));

                youtubePlayerCtrl.getPlayer().then(function(player){
                    console.log('Volume player', player.getVolume());

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

    .directive('showIfFullscreenEnabled', ['$animate', function($animate) {
        return {
            restrict: 'A',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                // By default hide
                $animate.addClass(elm, 'ng-hide');
                youtubePlayerCtrl.getPlayer().then(function(player){
                    if (player.fullscreenEnabled()) {
                        $animate.removeClass(elm, 'ng-hide');
                    } else {
                        $animate.addClass(elm, 'ng-hide');
                    }
                });
            }
        };
    }])
    .directive('showIfFullscreen', ['$animate', function($animate) {
        return {
            restrict: 'A',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                // By default hide
                $animate.addClass(elm, 'ng-hide');
                youtubePlayerCtrl.getPlayer().then(function(player){
                    var hideOrShow = function () {
                        var show = player.isFullscreen();
                        if (attrs.showIfFullscreen === 'true') {
                            show = !show;
                        }

                        if ( show ) {
                            $animate.removeClass(elm, 'ng-hide');
                        } else {
                            $animate.addClass(elm, 'ng-hide');
                        }
                    };
                    hideOrShow();
                    player.on('fullscreenchange', hideOrShow);
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
                    scope.$watch(function(){
                        return player.isMuted();
                    }, hideOrShow);
                });
            }
        };
    }])
    ;

})(angular);



/* global angular */
(function(angular) {


    angular.module('hrAngularYoutube')

    .factory('YoutubeMarker', function () {


        var YoutubeMarker = function(options) {
            // Set default values
            this.time = null;
            this.endTime = null;
            this.duration = null;
            this.handler = this.handler || null;
            // Whether this marker should be launched every time the marker pass or just the first time (assuming seeks)
            this.fireOnce = false;
            // Launch the marker when the user seeks past the marker time
            this.launchOnSeek = false;
            // Block when user fast forwards past the marker
            this.blockFF = false;
            //Wether to show the marker in a status bar
            this.showMarker = true;
            // Extra css class that can be added to the marker bar
            this.barCss = '';

            // TODO: Put generate hash here
            this.name = null;

            this._runCount = 0;
            this._isRunning = false;

            // Override with user options
            angular.extend(this, options);

            // Duration implies end time
            if (this.duration !== null) {
                this.endTime = this.time + this.duration;
            }
        };

        YoutubeMarker.prototype.shouldLaunchOnSeek = function () {
            // Block when fast forward implies launch on seek
            if (this.blockFF === true) {
                return true;
            }

            return this.launchOnSeek;
        };

        YoutubeMarker.prototype.hasEndTime = function () {
            return this.endTime !== null;
        };

        YoutubeMarker.prototype.inRange = function (t) {
            // If it doesn't have an end time, it cannot be in range
            if (!this.hasEndTime()) {
                return false;
            }
            return t >= this.time && t < this.endTime;
        };

        YoutubeMarker.prototype.startedIn = function (begin, end) {
            // If already fired and we only want to fire once, do nothing
            if (this._runCount > 0 && this.fireOnce ) {
                return false;
            }

            return this.time > begin && this.time <= end;
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
            // If already fired and we only want to fire once, do nothing
//            if (this._runCount > 0 && this.fireOnce ) {
//                return false;
//            }

            this._runCount++;
            this._isRunning = true;
            // If there is a handler, call it
            if (typeof this.handler === 'function') {
                this.handler();
            }
            return true;
        };

        YoutubeMarker.prototype.end = function () {
            this._isRunning = false;

            // If there is an end handler call it
            if (typeof this.onEnd === 'function') {
                this.onEnd();
            }
        };

        YoutubeMarker.prototype.isRunning = function () {
            return this._isRunning;
        };

        return YoutubeMarker;

    });


})(angular);

/* global angular, YT, screenfull */
(function(angular) {

    function generateHash() {
        return Math.floor((1 + Math.random()) * 0x10000)
                                   .toString(16)
                                   .substring(1);
    }




    angular.module('hrAngularYoutube')

    .provider('youtube', function youtubeProvider () {

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


        this.$get = ['$window','$q', '$interval','$rootScope', 'youtubeReadableTime',
                     function ($window, $q, $interval, $rootScope, youtubeReadableTime) {
            var apiLoaded = $q.defer();

            var apiLoadedPromise = apiLoaded.promise;

            var YoutubePlayer = function(elmOrId, playerOptions) {
                var options = {};
                // Override main options
                angular.extend(options, angular.copy(defaultOptions), playerOptions);
                // Override player var options
                options.playerVars = {}; // For some reason if I dont reset this angular.extend doesnt work as expected
                angular.extend(options.playerVars, angular.copy(defaultOptions.playerVars), playerOptions.playerVars);


                this.options = options;

                var op = angular.copy(options);
                // TODO: Add a fit to parent or something like that
                op.width = '100%';
                op.height = '100%';

                var self = this;
                if (this.fullscreenEnabled()) {
                    document.addEventListener(screenfull.raw.fullscreenchange, function() {
                        if (self.isFullscreen()) {
                            angular.element(self._fullScreenElem).addClass('fullscreen');
                        } else {
                            angular.element(self._fullScreenElem).removeClass('fullscreen');
                        }
                        self.emit('fullscreenchange');
                    });
                }
                this.player = new YT.Player(elmOrId, op);

                this.markersByName = {};
                this._muted = false;
                this._volume = 100;

                this.on('onStateChange', function(event) {
                    if (event.data === YT.PlayerState.PLAYING) {
                        self._muted = self.player.isMuted();
                        self.setVolume(self.player.getVolume());
                    }
                });
                // TODO: Maybe add a markersByTime for performance
            };

            // TODO: Inherit better than these :S once i know if this is the way I want to access the object
            angular.forEach([
                'loadVideoById', 'loadVideoByUrl', 'cueVideoById', 'cueVideoByUrl', 'cuePlaylist',
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


            // TODO: See how to add a default, or if to make a full-screen directive
            YoutubePlayer.prototype.setFullScreenElement = function (elm) {
                this._fullScreenElem = elm;
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

            YoutubePlayer.prototype.requestFullscreen = function () {
                if (this.fullscreenEnabled()) {
                    screenfull.request(this._fullScreenElem);
                    this.emit('fullscreenEnabled');
                    return true;
                }
                return false;
            };

            YoutubePlayer.prototype.toggleFullscreen = function () {
                if (this.fullscreenEnabled()) {
                    var isFullscreen = screenfull.isFullscreen;
                    screenfull.toggle(this._fullScreenElem);
                    if (isFullscreen) {
                        this.emit('fullscreenDisabled');
                    } else {
                        this.emit('fullscreenEnabled');
                    }
                    return true;
                }
                return false;
            };

            YoutubePlayer.prototype.isFullscreen = function () {
                if (this.fullscreenEnabled()) {
                    return screenfull.isFullscreen;
                }
                return false;
            };


            YoutubePlayer.prototype.fullscreenEnabled = function () {
                if (typeof screenfull !== 'undefined') {
                    return screenfull.enabled;
                }
                return false;
            };


            /**
             * Its like seekTo, but fires an event when the seek is complete
             */
            YoutubePlayer.prototype.eventSeekTo = function (sec, allowSeekAhead) {
                var self = this;
                var initialTime = this.player.getCurrentTime();

                // If there is a blocking marker, don't allow to seek further than it
                angular.forEach(self.markersByName, function(marker) {
                    // If its not blocking, we dont care
                    if (marker.blockFF === false) {
                        return;
                    }

                    // If the marker is in the seek time, force the sec to be at the marker time
                    if (marker.startedIn(initialTime, sec)) {
                        sec = marker.time;
                    }
                });

                // Seek to sec
                this.player.seekTo(sec, allowSeekAhead);

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
                        self.emit('seekToCompleted', {newTime: sec, oldTime: initialTime});
                        $interval.cancel(promise);
                    }
                }, 50);

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
                this._eventHash = generateHash();
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
                var lastMarkerTime = 0;
                this.onProgress(function() {
                    var currentTime = self.getCurrentTime();
                    var newLastTime = lastMarkerTime;
                    angular.forEach(self.markersByName, function(marker) {
                        // If the marker time has past and we haven't launched this marker yet
                        if (marker.startedIn(lastMarkerTime, currentTime)) {
                            runMarker(marker);
                            newLastTime = Math.max(newLastTime, marker.time);
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
                    angular.forEach(self.markersByName, function(marker) {
                        if (marker.isRunning()) {
                            // If the marker is running and the seek throws it out of range, stop it
                            if (!marker.inRange(seekTime.newTime)) {
                                stopMarker(marker);
                            }
                        }else {
                            // If the marker is not running, see if we need to start it
                            if (marker.shouldLaunchOnSeek()) {
                                if (marker.hasEndTime() && marker.inRange(seekTime.newTime) ||
                                    !marker.hasEndTime() && marker.startedIn(seekTime.oldTime, seekTime.newTime)) {
                                    runMarker(marker);
                                }
                            }
                        }

                    });
                    lastMarkerTime = seekTime.newTime;
                });
            };

            YoutubePlayer.prototype.addMarker = function (marker) {
                this._initializeMarkerListener();

                if (!marker.hasOwnProperty('name') || marker.name === null) {
                    marker.name = generateHash();
                }

                this.markersByName[marker.name] = marker;
                this.emit('markerAdd', marker);
            };

            YoutubePlayer.prototype.removeMarker = function (marker) {
                delete this.markersByName[marker.name];
            };
            YoutubePlayer.prototype.getMarkers = function () {
                return this.markersByName;
            };
            YoutubePlayer.prototype.getMarker = function (name) {
                return this.markersByName[name];
            };


            YoutubePlayer.prototype.setVolume = function (volume) {
                // If volume is 0, then set as muted, if not is unmuted
                this._muted = volume === 0;
                this._volume = volume;
                this.player.setVolume(volume);
            };

            YoutubePlayer.prototype.getVolume = function () {
                if (this._muted) {
                    return 0;
                }
                return this._volume;
            };

            YoutubePlayer.prototype.mute = function () {
                this._muted = true;
                this.player.mute();
            };

            YoutubePlayer.prototype.unMute = function () {
                this._muted = false;
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

            // Youtube callback when API is ready
            $window.onYouTubeIframeAPIReady = function () {
                apiLoaded.resolve();
            };


            return {
                loadPlayer: function (elmOrId, options) {
                    return apiLoadedPromise.then(function(){
                        var videoReady = $q.defer();
                        var player = new YoutubePlayer(elmOrId, options);
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
        var YoutubeTemplateMarker = function (player, options) {
            this._player = player;
            this._elm = null;
            this._scope = null;
            this._parentElm = options.parent || player.getOverlayElement();
            this._addMethod = options.addMethod || 'append';
            this.template = null;
            this.link = this.link || null;

            YoutubeMarker.call(this, options);

            this._loadTemplate(options);
        };

        angular.extend(YoutubeTemplateMarker.prototype, YoutubeMarker.prototype);

        YoutubeTemplateMarker.prototype.handler = function () {
            var self = this;
            // Create a new isolated scope
            this._scope = $rootScope.$new(true);
            // Create the element from the template
            this.template.then(function(template) {
                self._elm = $compile(template)(self._scope);
                // Add it as an overlay
                if (self._addMethod === 'append') {
                    self._parentElm.append(self._elm);
                } else if (self._addMethod === 'prepend') {
                    self._parentElm.prepend(self._elm);
                }

                // Call the link function to allow logic in the scope
                if (typeof self.link === 'function') {
                    self.link(self._player, self._scope);
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
