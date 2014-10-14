/* global angular */
(function(angular) {


    angular.module('hrAngularYoutube')

    .factory('youtubeQualityMap', function () {
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
        var inverse;
        for (var q in map) {
            inverse = map[q];
            inverseMap[inverse] = q;
        }

        function _doConvertToYoutube(q) {
            var ans = map[q];
            if (!ans) {
                ans = 'Auto';
            }
            return ans;
        }
        return {
            convertToYoutube : function (q) {
                return _doConvertToYoutube(q);
            },
            convertFromYoutube: function (q) {
                var ans = inverseMap[q];
                if (!ans) {
                    ans = 'default';
                }
                return ans;
            },
            convertToYoutubeArray : function (arr) {
                var ans = [];
                for (var i = 0; i<arr.length; i++) {
                    ans.push(_doConvertToYoutube(arr[i]));
                }
                return ans;
            }
        };
    });


})(angular);
