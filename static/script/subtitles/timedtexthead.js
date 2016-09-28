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
         * @extends antie.subtitles.TimedTextElement
         */
        var TimedTextHead = TimedTextElement.extend(/** @lends antie.subtitles.TimedTextHead.prototype */ {

            /**
             * @constructor
             * @ignore
             */
            init: function (styling, layout, parent) {
                this._styling = styling;
                this._layout = layout;

                var children = [];
                if (styling) {
                    children.push(styling);
                }
                if (layout) {
                    children.push(layout);
                }
                this._super(TimedTextElement.NODE_NAME.head, parent, children);
            },

            getStyling: function() {
                return this._styling;
            },

            getLayout: function() {
                return this._layout;
            },

            /**
             * Cleans out this instance ready for garbage collection.  This
             * instance cannot be used after this.
             */
            destroy : function() {
                this._super.destroy();
                this._styling = null;
                this._layout = null;
            }
        });

        return TimedTextHead;
    }
);
