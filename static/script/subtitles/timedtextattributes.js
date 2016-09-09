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
                if (typeof name !== 'string' || !TimedTextAttributes.TYPE.hasOwnProperty(name)) {
                    throw new Error('TimedTextAttributes.setAttribute unknown attribute name:' + name);
                }

                if (value) {
                    if (!this._isMatchingType(value, TimedTextAttributes.TYPE[name])) {
                        throw new Error('TimedTextAttributes.setAttribute attribute ' + name + '\'s value is the wrong type - ' + typeof value + ': ' + value);
                    }
                }

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
                if (typeof name !== 'string' || !TimedTextAttributes.TYPE.hasOwnProperty(name)) {
                    throw new Error('TimedTextAttributes.setAttribute unknown attribute name:' + name);
                }
                return this._attributeMap[name] || null;
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
                return (attributeValue instanceof attributeType);
            },

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
         * @enum {(class|String)}
         * @readonly
         */
        TimedTextAttributes.TYPE = {
            begin: Timestamp,
            end:   Timestamp,
            dur:   Timestamp
        };

        return TimedTextAttributes;
    }
);
