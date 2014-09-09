/* global angular */
(function(angular) {
    angular.module('hrAngularYoutube')
    .directive('ytSlider',['$parse','$document',  function($parse, $document) {
        return {
            restrict: 'A',
            require: '^youtubePlayer',
            link: function(scope, elm, attrs,youtubePlayerCtrl) {
                var slideDown  = $parse(attrs.ytSliderDown),
                    sliderMove = $parse(attrs.ytSliderMove),
                    sliderUp   = $parse(attrs.ytSlider);

                var getPercentageFromPageX = function (pagex) {
                    // Get the player bar x from the page x
                    var left =  elm[0].getBoundingClientRect().left;
                    var x = Math.min(Math.max(0,pagex - left),elm[0].clientWidth);

                    // Get the percentage of the bar
                    var xpercent = x / elm[0].clientWidth;
                    return xpercent;
                };

                youtubePlayerCtrl.getPlayer().then(function(){
                    var $videoElm = youtubePlayerCtrl.getVideoElement();

                    elm.on('mousedown', function(e) {
                        // If it wasn't a left click, end
                        if (e.button !== 0) {
                            return;
                        }

                        var p = getPercentageFromPageX(e.pageX);
                        slideDown(scope,{$percentage: p});

                        // Create a blocker div, so that the iframe doesn't eat the mouse up events
                        var $blocker = angular.element('<div></div>');
                        $blocker.css('position', 'absolute');
                        $blocker.css('width', $videoElm[0].clientWidth + 'px');
                        $blocker.css('height', $videoElm[0].clientHeight + 'px');
                        $blocker.css('pointer-events', 'false');
                        $blocker.css('top', '0');
                        $videoElm.parent().append($blocker);


                        var documentMouseMove = function(event) {
                            scope.$apply(function(){
                                var p = getPercentageFromPageX(event.pageX);
                                sliderMove(scope,{$percentage: p});
                            });

                        };

                        var documentMouseUp = function(event) {
                            scope.$apply(function() {
                                var p = getPercentageFromPageX(event.pageX);

                                // Remove the event listeners for the drag and drop
                                $document.off('mousemove', documentMouseMove );
                                $document.off('mouseup', documentMouseUp);
                                // remove the div that was blocking the events of the iframe
                                $blocker.remove();

                                sliderUp(scope, {$percentage: p});
                            });

                        };

                        $document.on('mousemove', documentMouseMove );
                        $document.on('mouseup', documentMouseUp);
                    });

                });
            }
        };
    }]);
})(angular);

