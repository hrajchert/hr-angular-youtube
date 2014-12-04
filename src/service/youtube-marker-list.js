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
