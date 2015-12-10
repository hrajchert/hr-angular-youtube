/* global angular */
(function(angular) {


    angular.module('hrAngularYoutube')

    .factory('YoutubeMarker',['youtubeUuid', function (youtubeUuid) {

        /*jshint maxcomplexity:false */
        var YoutubeMarker = function(options) {
            // Set default values
            this.startTime = options.startTime || null;
            this.endTime =  options.endTime || null;
            this.duration = options.duration || null;
            this.handler = options.handler || this.handler || null;
            // Whether this marker should be launched every time the marker pass or just the first time (assuming seeks)
            this.fireOnce = options.fireOnce || false;
            // Launch the marker when the user seeks past the marker time
            this.launchOnSeek = options.launchOnSeek || false;
            // Block when user fast forwards past the marker
            this.blockFF = options.blockFF || false;
            //Wether to show the marker in a status bar
            this.showMarker = typeof options.showMarker !== 'undefined'?options.showMarker : true;
            // Extra css class that can be added to the marker bar
            this.barCss = typeof options.barCss !== 'undefined'?options.barCss:'';

//            this.name =  null;

            this._runCount = 0;
            this._isRunning = false;

            this.player = null;

            // Override with user options
//            angular.extend(this, options);
            this.id = this.id || options.id || youtubeUuid.getHash();

            // Duration implies end time
            if (this.duration !== null) {
                this.endTime = this.startTime + this.duration;
            }
        };

        YoutubeMarker.prototype.setPlayer = function (player) {
            this.player = player;
        };

        YoutubeMarker.prototype.getPlayer = function () {
            return this.player;
        };

        YoutubeMarker.prototype.shouldLaunchOnSeek = function (seekTime) {
            if (this.getLaunchOnSeek()) {
                if (this.hasEndTime()) {
                    return this.inRange(seekTime.newTime);
                } else {
                    return this.startTime >= seekTime.oldTime && this.startTime <= seekTime.newTime;
                }
            }
        };

        YoutubeMarker.prototype.getLaunchOnSeek = function () {
            // Block when fast forward implies launch on seek
            if (this.getBlockOnFF()) {
                return true;
            }

            return this.launchOnSeek;
        };

        YoutubeMarker.prototype.getBlockOnFF = function () {
            // If already fired and we only want to fire once, it shouldn't block
            if (this._runCount > 0 && this.fireOnce ) {
                return false;
            }
            return this.blockFF;
        };

        YoutubeMarker.prototype.hasEndTime = function () {
            return this.endTime !== null;
        };

        YoutubeMarker.prototype.inRange = function (t) {
            // If it doesn't have an end time, it cannot be in range
            if (!this.hasEndTime()) {
                return false;
            }
            return t >= this.startTime && t < this.endTime;
        };

        YoutubeMarker.prototype.startedIn = function (begin, end) {
            // If already fired and we only want to fire once, do nothing
//            if (this._runCount > 0 && this.fireOnce ) {
//                return false;
//            }

            return this.startTime > begin && this.startTime <= end;
        };




        YoutubeMarker.prototype.endedIn = function (begin, end) {
            if (!this.hasEndTime()) {
                return false;
            }
//            // If its not running, it cant end
//            if (!this._isRunning) {
//                return false;
//            }
            return this.endTime > begin && this.endTime <= end;
        };


        YoutubeMarker.prototype.start = function () {
            // If we are already running, dont do anything
            if (this._isRunning) {
                return false;
            }

            // If already fired and we only want to fire once, do nothing
            if (this._runCount > 0 && this.fireOnce ) {
                return false;
            }

            this._runCount++;
            this._isRunning = true;
            // If there is a handler, call it
            if (typeof this.handler === 'function') {
                this.handler();
            }
            return true;
        };

        YoutubeMarker.prototype.end = function () {
            if (this.isRunning()) {
                this._isRunning = false;

                // If there is an end handler call it
                if (typeof this.onEnd === 'function') {
                    this.onEnd();
                }
            }
        };

        YoutubeMarker.prototype.isRunning = function () {
            return this._isRunning;
        };

        return YoutubeMarker;

    }]);


})(angular);
