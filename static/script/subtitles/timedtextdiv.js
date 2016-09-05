/**
 * @fileOverview A head element in a Timed Text document
 * @author ultracrepidarian
 */
define(
    'antie/subtitles/timedtextdiv',
    [
        'antie/subtitles/timedtextelement'
    ],
    function (TimedTextElement) {
        'use strict';

        /**
         * A head element in a Timed Text document
         *
         * @class
         * @name antie.subtitles.TimedTextDiv
         * @extends antie.Class
         */
        var TimedTextDiv = TimedTextElement.extend(/** @lends antie.subtitles.TimedTextDiv.prototype */ {

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

        return TimedTextDiv;
    }
);
