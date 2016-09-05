/**
 * @fileOverview A span element in a Timed Text document
 * @author ultracrepidarian
 */
define(
    'antie/subtitles/timedtextspan',
    [
        'antie/subtitles/timedtextelement'
    ],
    function (TimedTextElement) {
        'use strict';

        /**
         * A span element in a Timed Text document
         *
         * @class
         * @name antie.subtitles.TimedTextSpan
         * @extends antie.Class
         */
        var TimedTextSpan = TimedTextElement.extend(/** @lends antie.subtitles.TimedTextSpan.prototype */ {

            /**
             *
             *
             * @constructor
             * @ignore
             */
            init: function () {
            },

            /**
             * Cleans out this instance ready for garbage collection.  This
             * instance cannot be used after this.
             */
            destroy : function() {
            }
        });

        return TimedTextSpan;
    }
);
