/**
 * @fileOverview Sample code only - constrains fontSize/lineHeight to specified bounds.
 * @author ultracrepidarian
 */
define(
    'antie/subtitles/attributetransformertextsize',
    [
        'antie/subtitles/attributetransformercss3'
    ],
    function(AttributeTransformerCss3) {
        'use strict';

        /**
         * Minimum font height in pixels.
         */
        var FONT_MIN_PX = 22;

        /**
         * Maximum font height in pixels.
         */
        var FONT_MAX_PX = 36;

        /**
         * Minimum line height in pixels.
         */
        var LINE_HEIGHT_MIN_PX = 25;

        /**
         * Maximum line height in pixels.
         */
        var LINE_HEIGHT_MAX_PX = 39;

        /**
         * Sample code only - constrains fontSize/lineHeight to specified bounds. Only
         * constrains sizes supplied in pixels, e.g.
         *   fontSize="5px" --> fontSize: { height: "22px" }
         * but other units are left as is, e.g.
         *   fontSize="0.25em" --> fontSize: { height: "0.25em" }
         *
         * @example
         *   var transformer = new AttributeTransformerTextSize(function(message) { logger.warn(message); });
         *   var timedText = new TtmlParser(transformer).parse(ttmlXmlDoc);
         *
         * @param {antie.subtitles.AttributeTransformer.reporter} report
         *        Called if there is a problem with the value of an attribute
         *
         * @class
         * @name antie.subtitles.AttributeTransformerTextSize
         * @extends antie.subtitles.AttributeTransformerCss3
         */
        var AttributeTransformerTextSize = AttributeTransformerCss3.extend(/** @lends antie.subtitles.AttributeTransformerTextSize.prototype */ {
            /**
             * @constructor
             * @ignore
             */
            init: function(report) {
                init.base.call(this, report);
            },

            /**
             * Transforms an attribute. Returns null if the attribute is not valid.
             *
             * @param {String} name
             *        The name of the attribute
             *
             * @param {String} value
             *        The value to be transformed
             *
             * @return {?any} a representation of the attribute, with font/line sizes restricted to the specified bounds,
             *                or null if the attribute's value is not valid
             * @public
             * @override
             */
            transform: function(name, value) {
                var result =  transform.base.call(this, name, value);
                var matches;
                var pixels;

                switch (name) {

                case 'lineHeight':
                    if (result) {
                        matches = /^(\d+)px$/.exec(result);
                        if (matches) {
                            pixels = parseInt(matches[1]);
                            if (pixels < LINE_HEIGHT_MIN_PX) {
                                result = LINE_HEIGHT_MIN_PX + 'px';
                            } else if  (pixels > LINE_HEIGHT_MAX_PX) {
                                result = LINE_HEIGHT_MAX_PX + 'px';
                            }
                        }
                    }
                    break;

                case 'fontSize':
                    if (result) {
                        // Only the font height is relevant in CSS3
                        matches = /^(\d+)px$/.exec(result.height);
                        if (matches) {
                            pixels = parseInt(matches[1]);
                            if (pixels < FONT_MIN_PX) {
                                result.height = FONT_MIN_PX + 'px';
                            } else if  (pixels > FONT_MAX_PX) {
                                result.height = FONT_MAX_PX + 'px';
                            }
                        }
                    }
                    break;

                default:
                    break;
                }

                return result;
            }
        });

        return AttributeTransformerTextSize;
    }
);
