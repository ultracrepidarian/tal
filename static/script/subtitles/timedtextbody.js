/**
 * @fileOverview The body of a TTML file
 * @author ultracrepidarian
 */
define(
    'antie/subtitles/timedtextbody',
    [
        'antie/subtitles/timedtextelement'
    ],
    function (TimedTextElement) {
        'use strict';

        /**
         * Class to hold the contents in the body of a TTML file
         *
         * @class
         * @name antie.subtitles.TimedTextBody
         * @extends antie.Class
         */
        var TimedTextBody = TimedTextElement.extend(/** @lends antie.subtitles.TimedTextBody.prototype */ {

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

        return TimedTextBody;
    }
);
