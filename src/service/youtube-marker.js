/* global angular */
(function(angular) {


    angular.module('hrAngularYoutube')

    .factory('YoutubeMarker', function () {


        var YoutubeMarker = function(options) {
            // Set default values
            this.time = null;
            this.endTime = null;
            this.duration = null;
            this.handler = this.handler || null;
            // Whether this marker should be launched every time the marker pass or just the first time (assuming seeks)
            this.fireOnce = false;
            // Launch the marker when the user seeks past the marker time
            this.launchOnSeek = false;
            // Block when user fast forwards past the marker
            this.blockFF = false;
            //Wether to show the marker in a status bar
            this.showMarker = true;

            // TODO: Put generate hash here
            this.name = null;

            this._runCount = 0;
            this._isRunning = false;

            // Override with user options
            angular.extend(this, options);

            // Duration implies end time
            if (this.duration !== null) {
                this.endTime = this.time + this.duration;
            }
        };

        YoutubeMarker.prototype.shouldLaunchOnSeek = function () {
            // Block when fast forward implies launch on seek
            if (this.blockFF === true) {
                return true;
            }

            return this.launchOnSeek;
        };

        YoutubeMarker.prototype.hasEndTime = function () {
            return this.endTime !== null;
        };

        YoutubeMarker.prototype.inRange = function (t) {
            // If it doesn't have an end time, it cannot be in range
            if (!this.hasEndTime()) {
                return false;
            }
            return t >= this.time && t <= this.endTime;
        };

        YoutubeMarker.prototype.startedIn = function (begin, end) {
            // If already fired and we only want to fire once, do nothing
            if (this._runCount > 0 && this.fireOnce ) {
                return false;
            }

            return this.time > begin && this.time <= end;
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
            // If already fired and we only want to fire once, do nothing
//            if (this._runCount > 0 && this.fireOnce ) {
//                return false;
//            }

            this._runCount++;
            this._isRunning = true;
            // If there is a handler, call it
            if (typeof this.handler === 'function') {
                this.handler();
            }
            return true;
        };

        YoutubeMarker.prototype.end = function () {
            this._isRunning = false;

            // If there is an end handler call it
            if (typeof this.onEnd === 'function') {
                this.onEnd();
            }
        };

        YoutubeMarker.prototype.isRunning = function () {
            return this._isRunning;
        };

        return YoutubeMarker;

    });


})(angular);
