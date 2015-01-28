**Warning:**
The youtube iframe API has a bug that doesn't show correctly the mute status if the video is paused, so I have to keep an inner
state myself
{:.alert .alert-danger }

{%code_warning
    "src" : "src/service/youtube-player.js",
    "priority" : 4,
    "ref" : {
        "text" : "YoutubePlayer.prototype.isMuted "
    }
%}

**Warning:**
This is setting a handler that must be removed manually, I can add logic to first, add it to a player event list, then, on object destroy
remove all handlers from the rootScope
{:.alert .alert-danger }

{%code_warning
    "src" : "src/service/youtube-player.js",
    "priority" : 9,
    "ref" : {
        "text" : "return $rootScope.$on"
    }
%}
