
**Warning:**
This is copy pasted from ytSlider
{:.alert .alert-danger }

{%code_warning
    "src" : "src/overlay/playerProgressBar.js",
    "priority" : 1,
    "ref" : {
        "text" : "var getPercentageFromPageX ="
    }
%}

**Warning:**
I don't like having an event on the scope for something and a function in the player for other things, but I don't want to make 2-way binding for this
as I suspect the main use for this will be static markers
{:.alert .alert-danger }

{%code_warning
    "src" : "src/overlay/playerProgressBar.js",
    "priority" : 1,
    "ref" : {
        "text" : "scope.$on('markerChangeTime'"
    }
%}
