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

                this.player = new YT.Player(elmOrId, op);
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
                    return true;
                }
                return false;
            };

            YoutubePlayer.prototype.fullscreenEnabled = function () {
                if (typeof screenfull !== 'undefined') {
                    return screenfull.enabled;
                }
                return false;
            };

            // YoutubePlayer.prototype.on = function (name, scope, handler) {
            //     var self = this;
            //     var newHandler = function() {
            //         var args = arguments;
            //         scope.$apply(function() {
            //             handler.apply(self.player, args);
            //         });
            //     };
            //     this.player.addEventListener(name, newHandler);
            // };

            YoutubePlayer.prototype.startLoading = function (sec) {
                var self = this;
                var unregister;
                var pauseAfterStart = function (event) {
                    if (event.data === YT.PlayerState.PLAYING) {
                        if (typeof sec === 'number') {
                            self.player.seekTo(sec, true);
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
                this._eventHash = Math.floor((1 + Math.random()) * 0x10000)
                                   .toString(16)
                                   .substring(1);
                var events = ['onStateChange', 'onPlaybackQualityChange', 'onPlaybackRateChange',
                              'onError', 'onApiChange', 'onReady'];
                angular.forEach(events, function(name) {
                    self.player.addEventListener(name, function(data) {
                        $rootScope.$emit(self._eventHash + name, data);
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
            template: '<div class="youtubeOuterDiv"><div class="youtubeInnerDiv"></div><div class="youtubeOverlay" ng-transclude=""></div></div>',
            scope: {
                videoId: '=',
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
                elm.css('position','relative');
                elm.css('display','block');

                // Save the overlay element in the controller so child directives can use it
                youtubePlayerCtrl.setOverlayElement(elm);

                var $videoDiv = elm[0].querySelector('.youtubeInnerDiv');
                var $outerDiv = angular.element(elm[0].querySelector('.youtubeOuterDiv'));

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

                    player = youtube.loadPlayer($videoDiv, options).then(function(p) {
                        player = p;
                        youtubePlayerCtrl.setPlayer(player);

                        player.setFullScreenElement($outerDiv[0]);

                        if (typeof ngModelCtrl !== 'undefined') {
                            ngModelCtrl.$setViewValue(player);
                        }
                    });

                };

                scope.$watch('videoId',function sourceChangeEvent(id) {
                    if (typeof id === 'undefined') {
                        return;
                    }
                    if (player === null) {
                        createVideo();
                    } else {
                        player.then(function(p){
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
