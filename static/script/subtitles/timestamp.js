/**
 * @fileOverview A media timestamp.
 * @author ultracrepidarian
 */
define(
    'antie/subtitles/timestamp',
    [
        'antie/class',
        'antie/subtitles/errors/ttmlparseerror'
    ],
    function (Class, TtmlParseError) {
        'use strict';

        var MULTIPLIER = {
            h: 60 * 60,
            m: 60,
            s: 1,
            ms: 1/1000
        };

        /**
         * A media timestamp.
         *
         * @class
         * @name antie.subtitles.Timestamp
         * @extends antie.Class
         */
        var Timestamp = Class.extend(/** @lends antie.subtitles.Timestamp.prototype */ {

            /**
             * Constructs a new timestamp instance.
             *
             * @param {String} timeString
             *        The time as a string
             *
             * @param {Number} [framerate=30]
             *        The framerate to use when calculating times from SMPTE frames
             *
             * @constructor
             * @ignore
             */
            init: function (timeString, framerate) {
                if (typeof timeString !== 'string') {
                    throw new TtmlParseError('Timestamp should be a string but was ' + typeof timeString + ': ' + timeString);
                }
                this._framerate = typeof framerate === 'number' && framerate > 0 ? framerate : 30;
                this._seconds = this._parseTime(timeString);
            },

            getMilliseconds: function() {
                return Math.round(this._seconds * 1000);
            },

            /**
             * Constructs a new timestamp instance.
             *
             * @param {String} timeString The time as a string
             *
             * @returns {Number} parsed time in seconds
             */
            _parseTime: function(timeString) {
                var match;

                match = /^(\d+):(\d\d):(\d\d(\.\d+)?)$/.exec(timeString);
                if (match) {
                    return parseInt(match[1])*MULTIPLIER.h + parseInt(match[2]*MULTIPLIER.m) + parseFloat(match[3]);
                }

                match = /^(\d+(\.\d+)?)(h|m|s|ms)$/.exec(timeString);
                if (match) {
                    return parseFloat(match[1]) * MULTIPLIER[match[3]];
                }

                match = /^(\d+):(\d\d):(\d\d):(\d\d)$/.exec(timeString);
                if (match) {
                    // TODO Cope with drop frames
                    return parseInt(match[1])*MULTIPLIER.h + parseInt(match[2]*MULTIPLIER.m) + parseInt(match[3]) + parseInt(match[4]) / this._framerate;
                }

                throw new TtmlParseError('Invalid timestamp: ' + timeString);
            }

        });

        return Timestamp;
    }
);
