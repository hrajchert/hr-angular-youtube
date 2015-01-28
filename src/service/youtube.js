/* global angular */
(function(angular) {
    'use strict';

    angular.module('hrAngularYoutube')

    .provider('youtube', function () {
        var defaultOptions = {
            playerVars: {
                origin: location.origin + '/',
                enablejsapi: 1
            }
        };

        var autoload = true;
        this.setAutoLoad = function (auto) {
            autoload = auto;
        };

        this.setOptions = function (options) {
            defaultOptions = options;
        };

        this.getOptions = function () {
            return defaultOptions;
        };

        this.setOption = function (name, value) {
            defaultOptions[name] = value;
        };

        this.setPlayerVarOption = function (name, value) {
            defaultOptions.playerVars[name] = value;
        };

        this.$get = ['$window','$q', '$injector', function ($window, $q, $injector) {

            var apiLoaded = $q.defer();

            var apiLoadedPromise = apiLoaded.promise;


            // Youtube callback when API is ready
            $window.onYouTubeIframeAPIReady = function () {
                apiLoaded.resolve();
            };


            return {
                loadPlayer: function (playerFactoryName,elmOrId, options) {

                    return apiLoadedPromise.then(function(){
                        var YoutubePlayer = $injector.get(playerFactoryName);

                        var videoReady = $q.defer();
                        var newOptions = {};
                        // Override main options
                        angular.extend(newOptions, angular.copy(defaultOptions), options);
                        // Override player var options
                        newOptions.playerVars = {}; // For some reason if I dont reset this angular.extend doesnt work as expected
                        angular.extend(newOptions.playerVars, angular.copy(defaultOptions.playerVars), options.playerVars);

                        var player = new YoutubePlayer(elmOrId, newOptions);
                        player.on('onReady', function() {
                            videoReady.resolve(player);
                        });
                        return videoReady.promise;
                    });

                },
                getAutoLoad: function () {
                    return autoload;
                }

            };
        }];

    });


})(angular);
