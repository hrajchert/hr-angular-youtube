/* global angular */
(function(angular) {


    angular.module('hrAngularYoutube')

    .factory('YoutubeTemplateMarker', ['$rootScope','$compile','YoutubeMarker', function($rootScope, $compile,YoutubeMarker) {
        var YoutubeTemplateMarker = function (player, options) {
            this._player = player;
            this._elm = null;
            this._scope = null;
            this.link = null;
            YoutubeMarker.call(this, options);
        };

        angular.extend(YoutubeTemplateMarker.prototype, YoutubeMarker.prototype);

        YoutubeTemplateMarker.prototype.handler = function () {
            // Create a new isolated scope
            this._scope = $rootScope.$new(true);
            // Create the element from the template
            this._elm = $compile(this.template)(this._scope);
            // Add it as an overlay
            this._player.getOverlayElement().append(this._elm);
            // Call the link function to allow logic in the scope
            if (typeof this.link === 'function') {
                this.link(this._player, this._scope);
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
