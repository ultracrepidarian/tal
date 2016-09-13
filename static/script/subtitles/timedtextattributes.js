define(
    'antie/subtitles/timedtextattributes',
    [
        'antie/class',
        'antie/subtitles/timestamp'
    ],
    function(Class, Timestamp) {
        'use strict';

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
                var value = this._attributeMap[name] || null;
                if (value) {
                    return value;
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
                default:
                    return value;
                }
            },

            /**
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
