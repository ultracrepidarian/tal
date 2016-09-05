/**
 * @fileOverview A region element in a Timed Text document
 * @author ultracrepidarian
 */
define(
    'antie/subtitles/timedtextregion',
    [
        'antie/subtitles/timedtextelement'
    ],
    function (TimedTextElement) {
        'use strict';

        /**
         * A region element in a Timed Text document
         *
         * @class
         * @name antie.subtitles.TimedTextRegion
         * @extends antie.Class
         */
        var TimedTextRegion = TimedTextElement.extend(/** @lends antie.subtitles.TimedTextRegion.prototype */ {

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

        return TimedTextRegion;
    }
);
