/**
 * @fileOverview A paragraph element in a Timed Text document
 * @author ultracrepidarian
 */
define(
    'antie/subtitles/timedtextparagraph',
    [
        'antie/subtitles/timedtextelement'
    ],
    function (TimedTextElement) {
        'use strict';

        /**
         * A paragraph element in a Timed Text document
         *
         * @class
         * @name antie.subtitles.TimedTextParagraph
         * @extends antie.Class
         */
        var TimedTextParagraph = TimedTextElement.extend(/** @lends antie.subtitles.TimedTextParagraph.prototype */ {

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

        return TimedTextParagraph;
    }
);
