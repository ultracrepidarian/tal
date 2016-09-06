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
         * The xml namespaces for TTML elements. As specified in
         *
         *   http://www.w3.org/TR/ttml2/
         *   http://www.w3.org/TR/ttaf1-dfxp/
         *   http://www.w3.org/TR/2010/CR-ttaf1-dfxp-20100223/
         *
         * @name antie.subtitles.TimedTextElement.NAMESPACE
         * @enum {String}
         * @readonly
         */
        TimedTextElement.NAMESPACE = {
            xml: 'http://www.w3.org/XML/1998/namespace',
            tt:  'http://www.w3.org/ns/ttml',
            ttp: 'http://www.w3.org/ns/ttml#parameter',
            tts: 'http://www.w3.org/ns/ttml#styling',
            ttm: 'http://www.w3.org/ns/ttml#metadata'
        };

        /**
         * The xml namespaces for TTML elements. As specified in
         *
         *   http://www.w3.org/TR/2006/CR-ttaf1-dfxp-20061116
         *
         * @name antie.subtitles.TimedTextElement.NAMESPACE_2006CR
         * @enum {String}
         * @readonly
         */
        TimedTextElement.NAMESPACE_2006CR = {
            tt:  'http://www.w3.org/2006/10/ttaf1',
            ttp: 'http://www.w3.org/2006/10/ttaf1#parameter',
            tts: 'http://www.w3.org/2006/10/ttaf1#style',
            ttm: 'http://www.w3.org/2006/10/ttaf1#metadata'
        };

        /**
         * The xml namespaces for TTML elements. As specified in
         *
         *   http://www.w3.org/TR/2006/WD-ttaf1-dfxp-20060427/
         *
         * @name antie.subtitles.TimedTextElement.NAMESPACE_2006WD
         * @enum {String}
         * @readonly
         */
        TimedTextElement.NAMESPACE_2006WD = {
            tt:  'http://www.w3.org/2006/04/ttaf1',
            ttp: 'http://www.w3.org/2006/04/ttaf1#parameter',
            tts: 'http://www.w3.org/2006/04/ttaf1#style',
            ttm: 'http://www.w3.org/2006/04/ttaf1#metadata'
        };

        return TimedTextElement;
    }
);
