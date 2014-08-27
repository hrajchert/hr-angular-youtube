I would like to have the generate hash here instead of the service, but generate hash is defined there. Define a utils seems too much. See later

{%code_todo
    "src" : "src/service/youtube-marker.js",
    "priority" : 1,
    "ref" : {
        "text" : "this.name = null"
    }
%}
It would be nice if blockFF can be a function or a value

{%code_todo
    "src" : "src/service/youtube-marker.js",
    "priority" : 3,
    "ref" : {
        "text" : "if (this.blockFF === true) {"
    }
%}
