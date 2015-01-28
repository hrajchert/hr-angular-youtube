'use strict';
/* global angular */

angular.module('hrAngularExtend',[])
.factory('hrAngularExtend', function () {
    var factoryMethods = ['factory', 'extend', 'extendStatic','extendWithStatic'];
    var Factory = function (baseClass) {

        baseClass.factory = Factory;
        baseClass.extend =  function (childClass, mixins) {
            var mix = {};
            if (angular.isArray(mixins)) {
                angular.forEach(mixins, function(m) {
                    angular.extend(mix, m.prototype);
                });
            }
            childClass.prototype = angular.extend({}, mix,baseClass.prototype, childClass.prototype);

            // Static part... not sure about this
            // angular.extend(childClass, baseClass);

            // TODO: revisit this
            if (baseClass.hasOwnProperty('prototypeExtend')) {
                baseClass.prototypeExtend(childClass.prototype);
            }

            return new Factory(childClass);
        };

        baseClass.extendStatic = function (childClass) {
            // angular.extend(childClass, baseClass);
            for (var staticMethod in baseClass) {
                if (factoryMethods.indexOf(staticMethod) === -1) {
                    childClass[staticMethod] = baseClass[staticMethod];
                }
            }
        };

        baseClass.extendWithStatic = function (childClass, mixins) {
            // Extend prototype and make it a factory
            baseClass.extend(childClass, mixins);
            // Extend static from the base
            baseClass.extendStatic(childClass);

            if (angular.isArray(mixins)) {
                angular.forEach(mixins, function(m) {
                    if (m.hasOwnProperty('extendStatic')) {
                        m.extendStatic(childClass);
                    }
                });
            }

        };

        return baseClass;
    };
    var voidFn = function () {
    };
    return new Factory(voidFn);;
});