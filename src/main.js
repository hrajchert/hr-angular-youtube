/* global angular */
(function(angular) {
    // Add a default handler to avoid missing the event. This can happen if you add the script manually,
    // which can be useful for performance
    if (typeof window.onYouTubeIframeAPIReady === 'undefined') {
        window.onYouTubeIframeAPIReady = function () {
            setTimeout(function(){
                window.onYouTubeIframeAPIReady();
            }, 100);
        };
    }

    // Do not touch the next comment, is used by gulp to inject template as dependency if needed
    angular.module('hrAngularYoutube', ['hrAngularExtend'/*--TEMPLATE-DEPENDENCIES--*/])

    .run(['youtube', function (youtube) {
        if (youtube.getAutoLoad()) {
            // Add the iframe api to the dom
            var tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';

            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }]);

})(angular);

