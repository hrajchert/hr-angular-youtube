(function() {
    'use strict';

    angular
        .module('hrAngularYoutube')
        .factory('youtubeUuid', youtubeUuidService);

    /**
     * @ngdoc service
     * @name hrAngularYoutube.factory:youtubeUuid
     *
     * @description
     * Provides unique identifier service
     *
     */
    youtubeUuidService.$inject = [];

    function youtubeUuidService () {

        return {
            getHash: getHash
        };

        ///////////////////////////////////////////

        function initialize () {
            console.log(globalServiceVariable);
        }

        /**
         * @ngdoc method
         * @name getHash
         * @methodOf hrAngularYoutube.factory:youtubeUuid
         *
         * @description
         * Creates a hash string that follows the UUID standard
        */
        function getHash () {
            return Math.floor((1 + Math.random()) * 0x10000)
                               .toString(16)
                               .substring(1);
        }
    }
})();
