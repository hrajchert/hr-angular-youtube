/* global angular */
(function(angular) {


    angular.module('hrAngularYoutube')

    .factory('youtubeReadableTime', function () {

        return function  (t) {
            t = Math.floor(t);
            var seconds = t % 60;
            var minutes = Math.floor(t / 60);
            var hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
            if ( hours > 0 ) {
                return hours + ':' + String('00' + minutes).slice(-2) + ':' + String('00' + seconds).slice(-2);
            } else {
                return minutes + ':' + String('00' + seconds).slice(-2);
            }
        };
    });


})(angular);
