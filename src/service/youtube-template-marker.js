/* global angular */
(function(angular) {


    angular.module('hrAngularYoutube')

    .factory('YoutubeTemplateMarker', ['$rootScope','$compile','YoutubeMarker','$q','$http','$templateCache',
                                       function($rootScope, $compile,YoutubeMarker, $q,$http,$templateCache) {
        var YoutubeTemplateMarker = function (player, options) {
            this._player = player;
            this._elm = null;
            this._scope = null;

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
                self._player.getOverlayElement().append(self._elm);

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
