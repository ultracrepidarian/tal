/**
 * @fileOverview A head element in a Timed Text document
 * @author postmaterialist
 */
define(
    'antie/subtitles/timedtexthead',
    [
        'antie/subtitles/timedtextelement'
    ],
    function (TimedTextElement) {
        'use strict';

        /**
         * A head element in a Timed Text document
         *
         * @class
         * @name antie.subtitles.TimedTextHead
         * @extends antie.Class
         */
        var TimedTextHead = TimedTextElement.extend(/** @lends antie.subtitles.TimedTextHead.prototype */ {

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

        return TimedTextHead;
    }
);
