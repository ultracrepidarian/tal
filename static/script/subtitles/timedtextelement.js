/**
 * @fileOverview The Base class for a timed text element
 * @author ultracrepidarian
 */
define(
    'antie/subtitles/timedtextelement',
    [
        'antie/class'
    ],
    function (Class) {
        'use strict';

        /**
         * The Base class for a timed text element
         *
         * @class
         * @name antie.subtitles.TimedTextElement
         * @extends antie.Class
         */
        var TimedTextElement = Class.extend(/** @lends antie.subtitles.TimedTextElement.prototype */ {

            /**
             * Constructs a new timed text instance from a TTML XML document.
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

        /**
         * The xml namespaces for TTML elements
         *
         * @name antie.subtitles.TimedTextElement.NAMESPACE
         * @enum {String}
         * @readonly
         *
         */
        TimedTextElement.NAMESPACE = {
            xml: 'http://www.w3.org/XML/1998/namespace',
            tt:  'http://www.w3.org/ns/ttml',
            ttp: 'http://www.w3.org/ns/ttml#parameter',
            tts: 'http://www.w3.org/ns/ttml#styling',
            ttm: 'http://www.w3.org/ns/ttml#metadata'
        };

        return TimedTextElement;
    }
);
