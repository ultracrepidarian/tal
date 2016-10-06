/**
 * @fileOverview Transforms attribute values.
 * @author ultracrepidarian
 */
define(
    'antie/subtitles/attributetransformer',
    [
        'antie/class'
    ],
    function(Class) {
        'use strict';

        /**
         * @callback antie.subtitles.AttributeTransformer.reporter
         *
         * @description Called to report an error in an attribute's value.
         *
         * @param {String} message
         *        The message to be reported
         */

        /**
         * Transforms attribute values.
         *
         * @param {antie.subtitles.AttributeTransformer.reporter} report
         *        Called if there is a problem with the value of an attribute
         *
         * @class
         * @name antie.subtitles.AttributeTransformer
         * @extends antie.Class
         */
        var AttributeTransformer = Class.extend(/** @lends antie.subtitles.AttributeTransformer.prototype */ {
            /**
             * @constructor
             * @ignore
             */
            init: function(report) {
                if (report && typeof report !== 'function') {
                    throw new Error('AttributeTransformer expected report parameter to be a function but it was: ' + typeof report + ': ' + report);
                }

                this._report = report;
            },

            /**
             * Transforms an attribute. Returns null if the attribute is not valid.
             * Subclasses should override this method.
             *
             * @param {String} name
             *        The name of the attribute
             *
             * @param {String} value
             *        The value to be transformed
             * @public
             */
            transform: function(name, value) {
                if (value) { }  // Fool ESLint into thinking we've referenced all our parameters
                return null;
            },


            /**
             * @param {String} name
             *        The name of the attribute
             *
             * @param {String} value
             *        The value of the attribute
             *
             * @param {String[]} enumeration
             *        Array of valid values for this attribute
             *
             * @returns {?String} the value of the attribute, if valid,
             *                    null if not
             * @protected
             */
            transformEnumeratedAttribute: function(name, value, enumeration) {
                for (var i = 0; i < enumeration.length; i++) {
                    if (value === enumeration[i]) {
                        return value;
                    }
                }

                this._report(name + ' attribute should be one of "' + enumeration.join('","') + '" but was: "' + value + '"');
                return null;
            },

            /**
             * Transforms a string representation of a positive integer into a number.
             *
             * @param {String} name
             *        The name of the attribute
             *
             * @param {String} value
             *        The value of the attribute
             *
             * @returns {?Number} positive integer if the parameter parses OK,
             *                    null if not
             * @protected
             */
            transformPositiveInteger: function(name, value) {
                if (/^\d+$/.test(value)) {
                    var intValue = parseInt(value);
                    if (intValue > 0) {
                        return intValue;
                    } else {
                        this._report(name + ' attribute should be positive, but was: ' + value);
                    }
                } else {
                    this._report(name + ' attribute should be a positive integer, but was: ' + value);
                }

                return null;
            },

            /**
             * Transforms a string representation of two positive integers (separated by a space)
             * into an array of two numbers.
             *
             * @param {String} name
             *        The name of the attribute
             *
             * @param {String} value
             *        The value of the attribute
             *
             * @returns {?Number[]} array of 2 positive integers if the parameter parses OK,
             *                      null if not
             * @protected
             */
            transformTwoPositiveIntegers: function(name, value) {
                var matches = /^\s*(\d+)\s+(\d+)\s*$/.exec(value);
                if (matches) {
                    var first = parseInt(matches[1]);
                    var second = parseInt(matches[2]);
                    if (first > 0 && second > 0) {
                        return [ first, second ];
                    } else {
                        this._report(name + ' attribute should be two positive numbers separated by a space, but was: ' + value);
                    }
                } else {
                    this._report(name + ' attribute should be two numbers separated by a space, but was: ' + value);
                }

                return null;
            },

            /**
             * Reports a message.
             *
             * @param {String} message
             *        The message to report
             * @protected
             */
            report: function(message) {
                if (this._report) {
                    this._report(message);
                }
            }
        });

        return AttributeTransformer;
    }
);
