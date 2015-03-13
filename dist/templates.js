(function(module) {
try {
  module = angular.module('hrAngularYoutubeTpls');
} catch (e) {
  module = angular.module('hrAngularYoutubeTpls', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/template/youtubePlayer.html',
    '<div class="hr-yt-wrapper">\n' +
    '    <div class="hr-yt-video-place-holder"></div>\n' +
    '    <div class="hr-yt-overlay" ng-transclude=""></div>\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('hrAngularYoutubeTpls');
} catch (e) {
  module = angular.module('hrAngularYoutubeTpls', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/template/overlay/hover-indicator.html',
    '<div class="hr-hover-indicator">\n' +
    '    <span ng-bind="time"></span>\n' +
    '</div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('hrAngularYoutubeTpls');
} catch (e) {
  module = angular.module('hrAngularYoutubeTpls', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/template/overlay/player-panel.html',
    '<div ng-transclude=""></div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('hrAngularYoutubeTpls');
} catch (e) {
  module = angular.module('hrAngularYoutubeTpls', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/template/overlay/player-pause.html',
    '<div style="display: inherit" ng-transclude=""></div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('hrAngularYoutubeTpls');
} catch (e) {
  module = angular.module('hrAngularYoutubeTpls', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/template/overlay/player-play.html',
    '<div style="display: inherit" ng-transclude=""></div>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('hrAngularYoutubeTpls');
} catch (e) {
  module = angular.module('hrAngularYoutubeTpls', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/template/overlay/player-progress-bar.html',
    '<div yt-slider="onSliderUp($percentage)"\n' +
    '     yt-slider-down="onSliderDown()"\n' +
    '     yt-slider-move="onSliderMove($percentage)"\n' +
    '     style="width:100%;height:100%;">\n' +
    '        <div class="hr-yt-played"></div>\n' +
    '        <div class="hr-yt-loaded"></div>\n' +
    '        <div class="hr-yt-handle"></div>\n' +
    '</div>\n' +
    '<span ng-repeat="marker in markers" class="hr-yt-marker" ng-if="marker.showMarker" marker="marker">\n' +
    '    </span>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('hrAngularYoutubeTpls');
} catch (e) {
  module = angular.module('hrAngularYoutubeTpls', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/template/overlay/player-volume-horizontal.html',
    '<div ng-click="toggleMute()" class="ng-transclude"></div>\n' +
    '    <div class="hr-yt-volume-hr-bar"\n' +
    '         yt-slider-move="onSliderMove($percentage)"\n' +
    '         yt-slider="onSliderUp($percentage)">\n' +
    '    <div class="hr-yt-setted"></div>\n' +
    '    <div class="hr-yt-handle"></div>\n' +
    '</div>\n' +
    '');
}]);
})();
