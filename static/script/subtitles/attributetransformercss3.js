/**
 * @fileOverview Transforms attribute values to those used in CSS3.
 * @author ultracrepidarian
 */
define(
    'antie/subtitles/attributetransformercss3',
    [
        'antie/runtimecontext',
        'antie/subtitles/attributetransformer'
    ],
    function(RuntimeContext, AttributeTransformer) {
        'use strict';

        /**
         * Transforms attribute values to those used in CSS3.
         *
         * @param {antie.subtitles.AttributeTransformer.reporter} report
         *        Called if there is a problem with the value of an attribute
         *
         * @class
         * @name antie.subtitles.AttributeTransformerCss3
         * @extends antie.subtitles.AttributeTransformer
         */
        var AttributeTransformerCss3 = AttributeTransformer.extend(/** @lends antie.subtitles.AttributeTransformerCss3.prototype */ {
            /**
             * @constructor
             * @ignore
             */
            init: function(report) {
                init.base.call(this, report);
                var device = RuntimeContext.getDevice();
                if (device.getConfig().accessibility && device.getConfig().accessibility.captions) {
                    this._captionsConfig = device.getConfig().accessibility.captions;
                } else {
                    this._captionsConfig = {};
                }
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
             * @return {?any} a more CSS3 representation of the attribute,
             *                or null if the attribute's value is not valid
             * @public
             * @override
             */
            transform: function(name, value) {
                var result;
                var valueArray;

                switch (name) {

                // XML attributes, e.g. xml:id
                case 'id':
                case 'lang':
                    result = value;
                    break;

                case 'space':
                    result = this.transformEnumeratedAttribute(name, value, [ 'default', 'preserve' ]);
                    break;


                // Parameter attributes, e.g. ttp:cellResolution
                case 'cellResolution':
                    valueArray = this.transformTwoPositiveIntegers(name, value);
                    if (valueArray) {
                        result = {columns: valueArray[0], rows: valueArray[1]};
                    }
                    break;

                case 'clockMode':
                    result = this.transformEnumeratedAttribute(name, value, [ 'local', 'gps', 'utc' ]);
                    break;

                case 'dropMode':
                    result = this.transformEnumeratedAttribute(name, value, [ 'dropNTSC', 'dropPAL', 'nonDrop' ]);
                    break;

                case 'frameRate':
                    result = this.transformPositiveInteger(name, value);
                    break;

                case 'frameRateMultiplier':
                    valueArray = this.transformTwoPositiveIntegers(name, value);
                    if (valueArray) {
                        result = {numerator: valueArray[0], denominator: valueArray[1]};
                    }
                    break;

                case 'markerMode':
                    result = this.transformEnumeratedAttribute(name, value, [ 'continuous', 'discontinuous' ]);
                    break;

                case 'pixelAspectRatio':
                    valueArray = this.transformTwoPositiveIntegers(name, value);
                    if (valueArray) {
                        result = {width: valueArray[0], height: valueArray[1]};
                    }
                    break;

                case 'profile':
                    result = value;
                    break;

                case 'subFrameRate':
                    result = this.transformPositiveInteger(name, value);
                    break;

                case 'tickRate':
                    result = this.transformPositiveInteger(name, value);
                    break;

                case 'timeBase':
                    result = this.transformEnumeratedAttribute(name, value, [ 'media', 'smpte', 'clock' ]);
                    break;


                // Style attributes, e.g. tts:backgroundColor
                case 'backgroundColor':
                    result = this._transformColour(value);
                    break;

                case 'color':
                    result = this._transformColour(value);
                    break;

                case 'direction':
                    result = this.transformEnumeratedAttribute(name, value, [ 'ltr', 'rtl' ]);
                    break;

                case 'display':
                    result = this.transformEnumeratedAttribute(name, value, [ 'auto', 'none' ]);
                    break;

                case 'displayAlign':
                    result = this.transformEnumeratedAttribute(name, value, [ 'before', 'center', 'after' ]);
                    break;

                case 'extent':
                    if (value === 'auto') {
                        result = value;
                    } else {
                        valueArray = value.split(/\s+/);
                        if (valueArray && valueArray.length === 2) {
                            if (this.transformNonNegativeLength(valueArray[0]) && this.transformNonNegativeLength(valueArray[1])) {
                                result = {width: valueArray[0], height: valueArray[1]};
                            }
                        }
                    }
                    break;

                case 'fontFamily':
                    result = this.transformFontFamily(value);
                    break;

                case 'fontSize':
                    valueArray = value.split(/\s+/);
                    if (valueArray && valueArray.length === 2) {
                        if (this.transformNonNegativeLength(valueArray[0]) && this.transformNonNegativeLength(valueArray[1])) {
                            result = {width: valueArray[0], height: valueArray[1]};
                        }
                    } else if (valueArray && valueArray.length === 1) {
                        if (this.transformNonNegativeLength(valueArray[0])) {
                            result = {width: valueArray[0], height: valueArray[0]};
                        }
                    }
                    break;

                case 'fontStyle':
                    result = this.transformEnumeratedAttribute(name, value, [ 'normal', 'italic', 'oblique' ]);
                    break;

                case 'fontWeight':
                    result = this.transformEnumeratedAttribute(name, value, [ 'normal', 'bold' ]);
                    break;

                case 'lineHeight':
                    result = value === 'normal' ? 'normal' : this.transformNonNegativeLength(value);
                    break;

                case 'opacity':
                    result = parseFloat(value);
                    break;

                case 'origin':
                    if (value === 'auto') {
                        result = value;
                    } else {
                        valueArray = value.split(/\s+/);
                        if (valueArray && valueArray.length === 2) {
                            if (this.transformLength(valueArray[0]) && this.transformLength(valueArray[1])) {
                                result = {left: valueArray[0], top: valueArray[1]};
                            }
                        }
                    }
                    break;

                case 'overflow':
                    result = this.transformEnumeratedAttribute(name, value, [ 'visible', 'hidden' ]);
                    break;

                case 'padding':
                    valueArray = value.split(/\s+/);
                    if (valueArray && valueArray.length > 0 && valueArray.length <= 4) {
                        result = valueArray;
                        for (var j = 0; j < valueArray.length; j++) {
                            if (!this.transformNonNegativeLength(valueArray[j])) {
                                result = null;      // Parsing here is just to protect against injection attacks
                            }
                        }
                    }
                    break;

                case 'showBackground':
                    result = this.transformEnumeratedAttribute(name, value, [ 'always', 'whenActive' ]);
                    break;

                case 'textAlign':
                    result = this.transformEnumeratedAttribute(name, value, [ 'left', 'center', 'right', 'start', 'end' ]);
                    break;

                case 'textDecoration':
                    if (value === 'none') {
                        result = 'none';
                    } else {
                        valueArray = value.split(/\s+/);
                        if (valueArray && valueArray.length > 0) {
                            result = [];
                            for (var k = 0; k < valueArray.length; k++) {
                                switch (valueArray[k]) {

                                case 'underline':
                                case 'overline':
                                    result.push(valueArray[k]);
                                    break;

                                case 'lineThrough':
                                    result.push('line-through');
                                    break;

                                case 'noUnderline':
                                case 'noOverline':
                                case 'noLineThrough':
                                    // There is currently no CSS3 way to turn these off if a parent element has switched them on
                                    break;

                                default:
                                    this.report(name + ' attribute should be one of "none" or a space separated list of "underline", "noUnderline", "overline", "noOverline", "lineThrough", "noLineThrough" but was: "' + value + '"');
                                    break;
                                }

                            }

                            if (result.length > 0) {
                                result = result.join(' ');
                            } else {
                                result = null;  // Just use the default
                            }
                        }
                    }
                    break;

                case 'textOutline':
                    // An optional colour, a tickness and an optional blur radius
                    if (value === 'none') {
                        result = 'none';
                    } else {

                        valueArray = value.split(/\s+/);
                        if (valueArray && valueArray.length > 0 && valueArray.length <= 3) {
                            result = {
                                color: null,
                                outlineThickness: null,
                                blurRadius: null
                            };

                            for (var m = 0; m < valueArray.length; m++) {
                                // The first element might be an optional colour
                                if (m === 0) {
                                    var colour = this._transformColour(valueArray[m]);
                                    if (colour) {
                                        result.color = colour;
                                        continue;
                                    } else if (valueArray.length === 3) {  // It really should have been a colour
                                        result = null;
                                        break;
                                    }
                                }

                                if (this.transformNonNegativeLength(valueArray[m])) {
                                    if (result.outlineThickness === null) {
                                        result.outlineThickness = valueArray[m];
                                    } else {
                                        result.blurRadius = valueArray[m];
                                    }
                                } else {
                                    result = null;
                                    break;
                                }
                            }
                        }
                    }
                    break;

                case 'unicodeBidi':
                    result = this.transformEnumeratedAttribute(name, value, [ 'normal', 'embed', 'bidiOverride' ]);
                    if (result === 'bidiOverride') {
                        result = 'bidi-override';
                    }
                    break;

                case 'visibility':
                    result = this.transformEnumeratedAttribute(name, value, [ 'visible', 'hidden' ]);
                    break;

                case 'wrapOption':
                    result = this.transformEnumeratedAttribute(name, value, [ 'wrap', 'noWrap' ]);
                    break;

                case 'writingMode':
                    result = this.transformEnumeratedAttribute(name, value, [ 'lrtb', 'rltb', 'tbrl', 'tblr', 'lr', 'rl', 'tb' ]);
                    break;

                case 'zIndex':
                    if (value === 'auto') {
                        result = 'auto';
                    } else if (/^(\+|-)?\d+$/.test(value)) {
                        result = parseInt(value);
                    }
                    break;

                default:
                    result = null;
                    break;
                }

                return result;
            },


            /**
             * Parses a TTML colour value into a CSS3 equivalent.
             *
             * @param {String} value
             *        the colour value to be parsed
             * @private
             */
            _transformColour: function(value) {
                if (typeof value !== 'string') {
                    return null;
                }

                if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                    // 6 digit hex colour
                    return value;
                } else if (/^#[0-9a-fA-F]{8}$/.test(value)) {
                    // 8 digit hex colour+opacity
                    var result = 'rgba(';
                    for (var i = 0; i < 3; i++) {
                        var index = 2 * i + 1;
                        result += parseInt(value.substring(index, index + 2), 16) + ',';
                    }
                    result += (parseInt(value.substring(7, 9), 16) / 255).toFixed(2);  // Convert to CSS3 opacity, e.g. 'FF' to '1.00'
                    return result + ')';
                } else if (/^rgb\(\d+,\d+,\d+\)$/.test(value)) {
                    // rgb() colour
                    return value;
                }  else if (/^rgba\(\d+,\d+,\d+,\d+\)$/.test(value)) {
                    // rgba() color and opacity (but opacity ranges between 0 and 255, not 0.0 and 1.0)
                    return value.replace(/,(\d+)\)/, function(match, p1) {
                        return ',' + (p1 / 255).toFixed(2) + ')';  // Convert to CSS3 opacity, e.g. '255' to '1.00'
                    });
                } else if (value.toLowerCase() === 'transparent') {
                    return 'rgba(0,0,0,0.0)';       // Munge this while 'transparent' has no CSS support
                } else if (/^[a-zA-Z]+$/.test(value)) {
                    // Named colour?
                    return value;
                } else {
                    return null;
                }
            },

            /**
             * Validates a string representation of a length.
             *
             * @param {String} value
             *        The value of the attribute
             *
             * @returns {?String} the value if it parses OK,
             *                    null if not
             * @protected
             */
            transformLength: function(value) {
                if (/^(\+|-)?(\d*\.)?\d+(px|em|c|%)$/.test(value)) {
                    return value;
                } else {
                    return null;
                }
            },

            /**
             * Validates a string representation of a non-negative length.
             *
             * @param {String} value
             *        The value of the attribute
             *
             * @returns {?String} the value if it parses OK as a non-negative length,
             *                    null if not
             * @protected
             */
            transformNonNegativeLength: function(value) {
                if (this.transformLength(value) && !/^\-/.test(value)) {
                    return value;
                } else {
                    return null;
                }
            },

            /**
             * Transforms a font name to a list of font families available on the device.
             *
             * @param {String} value
             *        The font family name
             *
             * @returns {?String} the new, device specific, font families if any were specified,
             *                    the value, as is, if not
             * @protected
             */
            transformFontFamily: function(value) {
                if (value && typeof value === 'string') {
                    if (this._captionsConfig.fontMap) {
                        return this._captionsConfig.fontMap[value] || this._captionsConfig.fontMap.unknown || value;
                    } else {
                        return value;
                    }
                }

                return null;
            }
        });

        return AttributeTransformerCss3;
    }
);
