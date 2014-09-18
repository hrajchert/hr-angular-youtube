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
  $templateCache.put('/template/overlay/player-progress-bar.html',
    '<div yt-slider="onSliderUp($percentage)"\n' +
    '     yt-slider-down="onSliderDown()"\n' +
    '     yt-slider-move="onSliderMove($percentage)"\n' +
    '     style="width:100%;height:100%;">\n' +
    '        <div class="hr-yt-played"></div>\n' +
    '        <div class="hr-yt-loaded"></div>\n' +
    '        <div class="hr-yt-handle"></div>\n' +
    '</div>\n' +
    '');
}]);
})();
