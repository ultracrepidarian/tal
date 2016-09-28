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
         * @extends antie.subtitles.TimedTextElement
         */
        var TimedTextBody = TimedTextElement.extend(/** @lends antie.subtitles.TimedTextBody.prototype */ {

            /**
             * 
             * @param {antie.subtitles.timedtextelement} [parent]
             *        the parent of the element
             * 
             * @param {antie.subtitles.TimedTextElement[]} children
             *        The children of this element
             *
             * @constructor
             */
            init: function (parent, children) {
                this._super(TimedTextElement.NODE_NAME.body, parent, children);
            },

            /**
             * Cleans out this instance ready for garbage collection.  This
             * instance cannot be used after this.
             * @public
             */
            destroy : function() {
                this._super.destroy();
            }
        });

        return TimedTextBody;
    }
);
