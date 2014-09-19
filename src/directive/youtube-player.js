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
