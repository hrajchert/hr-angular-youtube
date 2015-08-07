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
