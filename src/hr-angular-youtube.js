/* global angular, YT, screenfull */
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

    function generateHash() {
        return Math.floor((1 + Math.random()) * 0x10000)
                                   .toString(16)
                                   .substring(1);
    }

    function convertToUnits(u) {
        // If its numbers, interpret pixels
        if (typeof u === 'number' || /^\d+$/.test(u)) {
            return u + 'px';
        }
        return u;
    }

    function youtubeReadableTime (t) {
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
    }

    angular.module('hrAngularYoutube', [])

    .run(['youtube', function (youtube) {
        if (youtube.getAutoLoad()) {
            // Add the iframe api to the dom
            var tag = document.createElement('script');
            tag.src = '//www.youtube.com/iframe_api';
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }])
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


        this.$get = ['$window','$q', '$interval','$rootScope', function ($window, $q, $interval, $rootScope) {
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
                // Poner un if fit to parent, o algo asi
                op.width = '100%';
                op.height = '100%';

                if (this.fullscreenEnabled()) {
                    var self = this;
                    document.addEventListener(screenfull.raw.fullscreenchange, function() {
                        self.emit('fullscreenchange');
                    });
                }

                this.player = new YT.Player(elmOrId, op);

                this.markersByName = {};
                // TODO: Maybe add a markersByTime for performance
            };

            // TODO: Inherit better than these :S once i know if this is the way I want to access the object
            angular.forEach([
                'loadVideoById', 'loadVideoByUrl', 'cueVideoById', 'cueVideoByUrl', 'cuePlaylist',
                'loadPlaylist', 'playVideo', 'pauseVideo', 'stopVideo', 'seekTo', 'clearVideo',
                'nextVideo', 'previousVideo', 'playVideoAt', 'mute', 'unMute', 'isMuted', 'setVolume',
                'getVolume', 'setSize', 'getPlaybackRate', 'setPlaybackRate', 'getAvailablePlaybackRates',
                'setLoop', 'setShuffle', 'getVideoLoadedFraction', 'getPlayerState', 'getCurrentTime',
                'getPlaybackQuality', 'setPlaybackQuality', 'getAvailableQualityLevels', 'getDuration',
                'getVideoUrl', 'getVideoEmbedCode', 'getPlaylist', 'getPlaylistIndex', 'getIframe', 'destroy'
                // 'addEventListener', 'removeEventListener'
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
                    if (!marker.hasOwnProperty('blockFF') || marker.blockFF === false) {
                        return;
                    }

                    // If the marker is in the seek time, force the sec to be at the marker time
                    if (marker.time < sec && marker.time > initialTime) {
                        sec = marker.time;
                    }
                });

                // Seek to sec
                this.player.seekTo(sec, allowSeekAhead);

                // Check on a time interval that the seek has been completed
                var promise = $interval(function() {
                    var currentTime = self.player.getCurrentTime();
                    var seekCompleted = false;

                    // This can be made in fewer lines, but its easier to debug this way
                    // if the current time is lower than the initial time, it means you
                    // seek back, and its now complete
                    if (currentTime < initialTime) {
                        seekCompleted = true;
                    }
                    // if not, you pushed forward, and if you are bigger than the sec you tried
                    // to push to, then you also have complete
                    else if ( currentTime >= sec ) {
                        seekCompleted = true;
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
                if ( this._markerListener ) {
                    return;
                }
                var launchMarker = function (marker) {
                    // If the marker has a handler, call it
                    if (marker.hasOwnProperty('handler')) {
                        marker.handler.apply(marker);
                    }
                    // Emit an event with the marker launch
                    self.emit('markerLaunch', marker);
                };

                var self = this;
                var lastMarkerTime = 0;
                this.onProgress(function() {
                    var currentTime = self.getCurrentTime();
                    // If the video was seek to a previous time than the last marker,
                    // activate it once again
                    if (lastMarkerTime > currentTime) {
                        lastMarkerTime = currentTime;
                    }

                    var newLastTime = lastMarkerTime;
                    angular.forEach(self.markersByName, function(marker) {
                        // If the marker time has past and we haven't launched this marker yet
                        if (marker.time < currentTime && marker.time > lastMarkerTime) {
                            launchMarker(marker);
                            newLastTime = Math.max(newLastTime, marker.time);
                        }
                    });
                    lastMarkerTime = newLastTime;
                });

                this.on('seekToCompleted', function(seekTime){

                    angular.forEach(self.markersByName, function(marker) {
                        if (!marker.hasOwnProperty('launchOnSeek') || marker.launchOnSeek === false) {
                            return;
                        }
                        if (marker.time <= seekTime.newTime && marker.time > seekTime.oldTime) {
                            launchMarker(marker);
                        }
                    });
                    lastMarkerTime = seekTime.newTime;

                });

                this._markerListener = true;
            };

            YoutubePlayer.prototype.addMarker = function (marker) {
                this._initializeMarkerListener();

                if (!marker.hasOwnProperty('name')) {
                    marker.name = generateHash();
                }
                if (marker.hasOwnProperty('blockFF') && marker.blockFF === true) {
                    marker.launchOnSeek = true;
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

    })
    .directive('youtubePlayer', ['youtube', function (youtube) {
        var playerAttrs = ['id', 'height', 'width'],
            playerVarAttrs = ['autohide', 'autoplay', 'cc_load_policy', 'color', 'controls',
                              'disablekb', 'enablejsapi', 'end', 'fs', 'iv_load_policy',
                              'list', 'listType', 'loop', 'modestbranding', 'origin', 'playerapiid',
                              'playlist', 'playsinline', 'rel', 'showinfo', 'start', 'theme'];
        return {
            restrict: 'EA',
            require: ['youtubePlayer', '?ngModel'],
            template: '<div class="youtubeOuterDiv">' +
                      '  <div class="youtubeInnerDiv"></div>' +
                      '  <div class="youtubeOverlay" ng-transclude=""></div>' +
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
                        $videoElm = angular.element(this.getOverlayElement()[0].querySelector('.youtubeInnerDiv'));
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

                var $videoDiv = elm[0].querySelector('.youtubeInnerDiv');
                var $outerDiv = angular.element(elm[0].querySelector('.youtubeOuterDiv'));
                var $overlayElm = angular.element(elm[0].querySelector('.youtubeOverlay'));

                $outerDiv.css('width', '100%');
                $outerDiv.css('height', '100%');

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

                    angular.element(window).unbind('resize', resizeWithAspectRatio);
                });

            }
        };
    }]);


})(angular);
