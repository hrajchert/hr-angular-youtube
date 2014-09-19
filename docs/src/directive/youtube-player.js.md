**Warning:**
This is executed on every digest cycle and it doesn't even handle correctly the element change, as the element can change size after the cycle.
Check if needed or add an option to add it separately or even separete this as another directive.
{:.alert .alert-danger }

{%code_warning
    "src" : "src/directive/youtube-player.js",
    "priority" : 1,
    "ref" : {
        "text" : "unit !== newUnit"
    }
%}
