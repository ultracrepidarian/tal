define(
    'antie/subtitles/timedtextattributes',
    [
        'antie/class',
        'antie/subtitles/timestamp'
    ],
    function(Class, Timestamp) {
        'use strict';

        var descriptors = {
            backgroundColor: {
                inheritable: false,
                style:       true,
                default:     'transparent',
                appliesTo:   [ 'body', 'div', 'p', 'region', 'span' ]
            },
            color: {
                inheritable: true,
                style:       true,
                default:     'white',  // TODO What should the default be?
                appliesTo:   [ 'span' ]
            },
            direction: {
                inheritable: true,
                style:       true,
                default:     'ltr',
                appliesTo:   [ 'p', 'span' ]
            },
            display: {
                inheritable: false,
                style:       true,
                default:     'auto',
                appliesTo:   [ 'body', 'div', 'p', 'region', 'span' ]
            },
            displayAlign: {
                inheritable: false,
                style:       true,
                default:     'before',
                appliesTo:   [ 'region' ]
            },
            extent: {
                inheritable: false,
                style:       true,
                default:     'auto',
                appliesTo:   [ 'tt', 'region' ]
            },
            fontFamily: {
                inheritable: true,
                style:       true,
                default:     'default',
                appliesTo:   [ 'span' ]
            },
            fontSize: {
                inheritable: true,
                style:       true,
                default:     '1c',
                appliesTo:   [ 'span' ]
            },
            fontStyle: {
                inheritable: true,
                style:       true,
                default:     'normal',
                appliesTo:   [ 'span' ]
            },
            fontWeight: {
                inheritable: true,
                style:       true,
                default:     'normal',
                appliesTo:   [ 'span' ]
            },
            lineHeight: {
                inheritable: true,
                style:       true,
                default:     'normal',
                appliesTo:   [ 'p' ]
            },
            opacity: {
                inheritable: false,
                style:       true,
                default:     1.0,
                appliesTo:   [ 'region' ]
            },
            origin: {
                inheritable: false,
                style:       true,
                default:     'auto',
                appliesTo:   [ 'region' ]
            },
            overflow: {
                inheritable: false,
                style:       true,
                default:     'hidden',
                appliesTo:   [ 'region' ]
            },
            padding: {
                inheritable: false,
                style:       true,
                default:     '0px',
                appliesTo:   [ 'region' ]
            },
            showBackground: {
                inheritable: false,
                style:       true,
                default:     'always',
                appliesTo:   [ 'region' ]
            },
            textAlign: {
                inheritable: true,
                style:       true,
                default:     'start',
                appliesTo:   [ 'p' ]
            },
            textDecoration: {
                inheritable: true,
                style:       true,
                default:     'none',
                appliesTo:   [ 'span' ]
            },
            textOutline: {
                inheritable: true,
                style:       true,
                default:     'none',
                appliesTo:   [ 'span' ]
            },
            unicodeBidi: {
                inheritable: false,
                style:       true,
                default:     'normal',
                appliesTo:   [ 'p', 'span' ]
            },
            visibility: {
                inheritable: true,
                style:       true,
                default:     'visible',
                appliesTo:   [ 'body', 'div', 'p', 'region', 'span' ]
            },
            wrapOption: {
                inheritable: true,
                style:       true,
                default:     'wrap',
                appliesTo:   [ 'span' ]
            },
            writingMode: {
                inheritable: false,
                style:       true,
                default:     'lrtb',
                appliesTo:   [ 'region' ]
            },
            zIndex: {
                inheritable: false,
                style:       true,
                default:     'auto',
                appliesTo:   [ 'region' ]
            }
        };

        /**
         * Attribute values.
         *
         * @class
         * @name antie.subtitles.TimedTextAttributes
         * @extends antie.Class
         */
        var TimedTextAttributes = Class.extend(/** @lends antie.subtitles.TimedTextAttributes.prototype */{
            init: function() {
                this._attributeMap = {};
            },

            /**
             * Sets the value of an attribute.
             *
             * @param {String} name
             *        The name of the attribute
             *
             * @param {any} value
             *        The new value of the attribute
             * @public
             */
            setAttribute: function(name, value) {
                // if (typeof name !== 'string' || !TimedTextAttributes.TYPE.hasOwnProperty(name)) {
                //     throw new Error('TimedTextAttributes.setAttribute unknown attribute name:' + name);
                // }
                //
                // if (value) {
                //     if (!this._isMatchingType(value, TimedTextAttributes.TYPE[name])) {
                //         throw new Error('TimedTextAttributes.setAttribute attribute ' + name + '\'s value is the wrong type - ' + typeof value + ': ' + value);
                //     }
                // }

                if (this._attributeMap[name]) {
                    throw new Error('TimedTextAttributes.setAttribute attempting to set attribute ' + name + '\'s value more than once');
                }

                this._attributeMap[name] = value;

            },

            /**
             * Returns the value of an attribute.
             *
             * @param {String} name
             *        The name of the attribute
             *
             * @returns {?any} the value of the named attribute, or null if it has not been set
             * @public
             */
            getAttribute: function(name) {
                var value = this._attributeMap[name];
                if (value !== undefined && value !== null) {
                    return value;
                } else if (this.isStyleAttribute(name) && this._attributeMap.style) {
                    for (var i = 0; i < this._attributeMap.style.length; i++) {
                        value = this._attributeMap.style[i].getAttribute(name);
                        if (value !== undefined && value !== null) {
                            return value;
                        }
                    }
                }

                // Return default value if there is one
                switch (name) {
                case 'cellResolution':
                    return {columns: 32, rows: 15};
                case 'clockMode':
                    return 'utc';
                case 'dropMode':
                    return 'nonDrop';
                case 'frameRate':
                    return 30;
                case 'frameRateMultiplier':
                    return {numerator: 1, denominator: 1};
                case 'markerMode':
                    return 'discontinuous';
                case 'pixelAspectRatio':
                    return {width: 1, height: 1};
                case 'subFrameRate':
                    return 1;
                case 'tickRate':
                    return this._attributeMap.frameRate ? this._attributeMap.frameRate * this.getAttribute('subFrameRate') : 1;
                case 'timeBase':
                    return 'media';
                case 'timeContainer':
                    return 'par';
                default:
                    return null;
                }
            },

            /**
             * Returns the default value for an attribute.
             *
             * @param {String} name
             *        The name of the attribute
             *
             * @returns {?any} the dault value for the named attribute, or null if it has none
             * @public
             */
            getDefault: function(name) {
                if (descriptors.hasOwnProperty(name)) {
                    return descriptors[name].default;
                } else {
                    return false;
                }
            },

            /**
             * Checks if an attribute can be inherited from an element's parent.
             *
             * @param {String} name
             *        The name of the attribute
             *
             * @returns {Boolean} true if the named attribute can be inherited,
             *                    false if not
             * @public
             */
            isInheritable: function(name) {
                if (descriptors.hasOwnProperty(name)) {
                    return descriptors[name].inheritable;
                } else {
                    return false;
                }
            },

            /**
             * Checks if an attribute's value can be obtained from a <style> element if
             * one is referenced.
             *
             * @param {String} name
             *        The name of the attribute
             *
             * @returns {Boolean} true if the named attribute's value can be obtained from a referenced <style> element,
             *                    false if not
             * @public
             */
            isStyleAttribute: function(name) {
                if (descriptors.hasOwnProperty(name)) {
                    return descriptors[name].style;
                } else {
                    return false;
                }
            },

            /**
             * Returns the list of element types the named attribute applies to.
             *
             * @param {String} name
             *        The name of the attribute
             *
             * @returns {String[]} list of element types the named attribute applies to
             * @public
             */
            appliesTo: function(name) {
                if (descriptors.hasOwnProperty(name)) {
                    return descriptors[name].appliesTo;
                } else {
                    return [];
                }
            },

            /**
             * Checks an attribute's value is of the correct type.
             *
             * @param {any} attributeValue
             *        The value of the attribute to be checked
             *
             * @param {antie.subtitles.TimedTextAttributes.TYPE} attributeType
             *        Type definition to check the attribute's value against
             *
             * @returns {Boolean} true if attributeValue matches attributeType,
             *                    false otherwise
             * @private
             */
            _isMatchingType: function(attributeValue, attributeType) {
                if (typeof attributeType === 'object' && attributeType instanceof RegExp) {
                    return attributeType.test(attributeValue);
                } else {
                    return (attributeValue instanceof attributeType);
                }
            },

            /**
             * Returns the start/end time, rounded to the nearest millisecond, of
             * the attributes' element, or null if the element has no begin/end
             * times of its own (inherited times are ignored).
             *
             * @returns {{beginMilliseconds: Number, endMilliseconds: Number}}
             *          the begin/end of the element's display interval
             * @public
             */
            getTimingInterval: function() {
                if (!this.getAttribute('begin') && !this.getAttribute('end')) {
                    return null;
                }

                var beginMilliseconds = this.getAttribute('begin') ? this.getAttribute('begin').getMilliseconds() : 0;

                var endMilliseconds;
                if (this.getAttribute('end')) {
                    endMilliseconds = this.getAttribute('end').getMilliseconds();
                } else if (this.getAttribute('dur')) {
                    endMilliseconds = beginMilliseconds + this.getAttribute('dur').getMilliseconds();
                } else {
                    endMilliseconds = Infinity;
                }

                return {
                    'beginMilliseconds': beginMilliseconds,
                    'endMilliseconds': endMilliseconds
                };
            }

        });

        /**
         * @name antie.subtitles.TimedTextAttributes.TYPE
         * @enum {(class|String|RegExp)}
         * @readonly
         */
        TimedTextAttributes.TYPE = {
            begin: Timestamp,
            end:   Timestamp,
            dur:   Timestamp,
            frameRate: /^\d+$/
        };

        TimedTextAttributes.NAMESPACE = {
            frameRate: 'ttp'
        };

        return TimedTextAttributes;
    }
);
