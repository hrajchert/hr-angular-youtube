
Move this code into a separate directive somehow. I don't like having a dependency on the screenful library.

{%code_todo
    "src" : "src/service/youtube-player.js",
    "priority" : 4,
    "ref" : {
        "text" : "YoutubePlayer.prototype.fullscreenEnabled"
    }
%}


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
