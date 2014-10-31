/* global angular */
(function(angular) {


    angular.module('hrAngularYoutube')

    .factory('youtubeUuid', function () {

        return {
            getHash : function () {
                return Math.floor((1 + Math.random()) * 0x10000)
                                   .toString(16)
                                   .substring(1);
            }
        };
    });


})(angular);
