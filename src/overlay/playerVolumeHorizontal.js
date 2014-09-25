/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('playerVolumeHorizontal',  function() {
        return {
            restrict: 'E',
            require: '^youtubePlayer',
            template: '<div ng-click="toggleMute()" class="ng-transclude"></div>'+
                      '<div class="hr-yt-volume-hr-bar"' +
                      '     yt-slider-move="onSliderMove($percentage)"' +
                      '     yt-slider="onSliderUp($percentage)">'+
                      '  <div class="hr-yt-setted"></div>'+
                      '  <div class="hr-yt-handle"></div>'+
                      '</div>',
            transclude: true,
            scope: {},
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                var $volumeBar = angular.element(elm[0].querySelector('.hr-yt-volume-hr-bar')),
                    $settedBar = angular.element(elm[0].querySelector('.hr-yt-setted')),
                    $handle    = angular.element(elm[0].querySelector('.hr-yt-handle'));

                youtubePlayerCtrl.getPlayer().then(function(player){
                    var updateVolumeBar = function(volume) {
                        var handleX = volume * $volumeBar[0].clientWidth - $handle[0].clientWidth / 2  ;
                        handleX = Math.min(Math.max(0, handleX),$volumeBar[0].clientWidth - $handle[0].clientWidth / 2);
                        $settedBar.css('width', volume * 100 + '%');
                        $handle.css('left', handleX + 'px');
                    };
                    scope.toggleMute = function() {
                        player.toggleMute();
                    };
                    scope.onSliderMove = function (volume) {
                        player.setVolume(volume * 100);
                        updateVolumeBar(volume);
                    };

                    scope.onSliderUp = function (volume) {
                        player.setVolume(volume * 100);
                        updateVolumeBar(volume);
                    };
                    scope.$watch(function(){
                        return player.getVolume();
                    }, function(volumeFromModel) {
                        updateVolumeBar(volumeFromModel / 100);
                    });
                });
            }
        };
    });
})(angular);

