
**Warning:**
I don't like this directive. I would prefer to use ng-show directly but I cannot access the player object from the transclusion
{:.alert .alert-danger }

{%code_warning
    "src" : "src/overlay/showDirectives.js",
    "priority" : 1,
    "ref" : {
        "text" : "showIfFullscreenEnabled"
    }
%}

Refactor this and other show-if directives into one, just like angular does for ng-click or ng-show/hide

{%code_todo
    "src" : "src/overlay/showDirectives.js",
    "priority" : 3,
    "ref" : {
        "text" : ".directive('showIfMuted'"
    }
%}
