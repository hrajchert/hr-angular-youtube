
**Warning:**
This is executed on every digest cycle and it doesn't even handle correctly the element change, as the element can change size after the cycle.
Check if needed or add an option to add it separately or even separete this as another directive.
{:.alert .alert-danger }

{%code_warning
    "src" : "src/hr-angular-youtube.js",
    "priority" : 1,
    "ref" : {
        "text" : "return [elm[0].clientWidth"
    }
%}
Move this code into a separate directive somehow. I don't like having a dependency on the screenful library.

{%code_todo
    "src" : "src/hr-angular-youtube.js",
    "priority" : 4,
    "ref" : {
        "text" : "YoutubePlayer.prototype.fullscreenEnabled"
    }
%}
