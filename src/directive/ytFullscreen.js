/* global angular, screenfull */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('ytFullscreen',['$parse', function($parse) {
        return {
            restrict: 'A',
            require: 'ytFullscreen',
            controller: ['$scope', function($scope) {
                var _elm;
                var self = this;
                this.setFullScreenElement = function (elm) {
                    _elm = elm;
                };

                this.onFullscreenChange = function (handler) {
                    return $scope.$on('fullscreenchange', handler);
                };



                this.requestFullscreen = function () {
                    if (this.fullscreenEnabled()) {
                        screenfull.request(_elm);
                        $scope.$emit('fullscreenEnabled');
                        return true;
                    }
                    return false;
                };

                this.removeFullscreen = function () {
                    if (this.fullscreenEnabled()) {
                        if (this.isFullscreen()) {
                            this.toggleFullscreen();
                        }
                    }
                };

                this.toggleFullscreen = function () {
                    if (this.fullscreenEnabled()) {
                        var isFullscreen = screenfull.isFullscreen;
                        screenfull.toggle(_elm);
                        if (isFullscreen) {
                            $scope.$emit('fullscreenDisabled');
                        } else {
                            $scope.$emit('fullscreenEnabled');
                        }
                        return true;
                    }
                    return false;
                };

                this.isFullscreen = function () {
                    if (this.fullscreenEnabled()) {
                        return screenfull.isFullscreen;
                    }
                    return false;
                };


                this.fullscreenEnabled = function () {
                    if (typeof screenfull !== 'undefined') {
                        return screenfull.enabled;
                    }
                    return false;
                };

                if (this.fullscreenEnabled()) {
                    document.addEventListener(screenfull.raw.fullscreenchange, function() {
                        if (self.isFullscreen()) {
                            angular.element(self._fullScreenElem).addClass('fullscreen');
                        } else {
                            angular.element(self._fullScreenElem).removeClass('fullscreen');
                        }
                        $scope.$emit('fullscreenchange');
                    });

                }

            }],
            link: function(scope, elm, attrs, ctrl) {
                // If the directive has a value, add the controller to the scope under that name
                if (attrs.ytFullscreen && attrs.ytFullscreen !== '') {
                    var p = $parse(attrs.ytFullscreen);
                        p.assign(scope, ctrl);
                }
                ctrl.setFullScreenElement(elm[0]);
            }

        };
    }]);
})(angular);

