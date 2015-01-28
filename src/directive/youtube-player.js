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
