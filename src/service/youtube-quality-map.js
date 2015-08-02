(function() {
    'use strict';

    angular
        .module('hrAngularYoutube')
        .factory('youtubeQualityMap', youtubeQualityMapService);

    /**
     * @ngdoc service
     * @name hrAngularYoutube.factory:youtubeQualityMap
     *
     * @description
     * TODO: Describe this service
     *
     */
    youtubeQualityMapService.$inject = [];

    function youtubeQualityMapService () {
        var map = {
            'hd1080' : '1080p',
            'hd720' : '720p',
            'large' : '480p',
            'medium' : '360p',
            'small' : '240p',
            'tiny' : '144p',
            'auto' : 'Auto'
        };

        var inverseMap = {};

        initialize();

        return {
            convertToYoutube: convertToYoutube,
            convertFromYoutube: convertFromYoutube,
            convertToYoutubeArray: convertToYoutubeArray
        };

        ///////////////////////////////////////////

        function initialize () {
            var inverse;
            for (var q in map) {
                inverse = map[q];
                inverseMap[inverse] = q;
            }

        }

        function _doConvertToYoutube(q) {
            var ans = map[q];
            if (!ans) {
                ans = 'Auto';
            }
            return ans;
        }

        /**
         * @ngdoc method
         * @name convertToYoutube
         * @methodOf hrAngularYoutube.factory:youtubeQualityMap
         *
         * @description
         * TODO: convertToYoutube description
        */
        function convertToYoutube (q) {
            return _doConvertToYoutube(q);
        }

        /**
         * @ngdoc method
         * @name convertFromYoutube
         * @methodOf hrAngularYoutube.factory:youtubeQualityMap
         *
         * @description
         * TODO: convertFromYoutube description
        */
        function convertFromYoutube (q) {
            var ans = inverseMap[q];
            if (!ans) {
                ans = 'default';
            }
            return ans;
        }

        /**
         * @ngdoc method
         * @name convertToYoutubeArray
         * @methodOf hrAngularYoutube.factory:youtubeQualityMap
         *
         * @description
         * TODO: convertToYoutubeArray description
        */

        function convertToYoutubeArray (arr) {
            var ans = [];
            for (var i = 0; i<arr.length; i++) {
                ans.push(_doConvertToYoutube(arr[i]));
            }
            return ans;
        }
    }
})();
