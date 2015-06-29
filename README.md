Angular Youtube
===============

> Youtube videos with custom configurable controls for Angular.js

Check out the demo and documentation [here](http://hrajchert.github.io/hr-angular-youtube)

## Install

Download via bower or look for the files in the dist folder


    $ bower install --save hr-angular-youtube


Import it to your page


    <script src="bower_components/hr-angular-youtube/dist/hr-angular-youtube.min.js"></script>


Enable it on your app

    angular.module('myModule', ['hrAngularYoutube']);


## Use it

As you can see in the [Basic Example](http://hrajchert.github.io/hr-angular-youtube/#/demo/basic), the `youtube-player` directive
only requires a video-id.

    <youtube-player video-id="'i_mKY2CQ9Kk'"></youtube-player>

Note that the id is a literal in this case, but you can bind the video to a scope variable

## More examples

* In the [Controls Example](http://hrajchert.github.io/hr-angular-youtube/#/demo/controls) you can see how to control the video with externals controls.
* In the [Overlay Example](http://hrajchert.github.io/hr-angular-youtube/#/demo/overlay) you can see how to create custom controls.
* In the [Marker Example](http://hrajchert.github.io/hr-angular-youtube/#/demo/marker) you can see how to add different video markers to the video.


## Features

* Create custom controls or overlay items easily
* Configure all your videos options via attributes or the factory configuration
* Set width or height and adjust the oposite dimension with the aspect ratio of the video

## TODO
Create a configure example that shows how to set the options of this page
`https://developers.google.com/youtube/player_parameters?playerVersion=HTML5` using either the provider or the directive attributes

