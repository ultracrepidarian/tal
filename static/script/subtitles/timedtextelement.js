/**
 * @fileOverview An element in a timed text hierarchy
 * @author ultracrepidarian
 * @author gsmithu
 */
define(
    'antie/subtitles/timedtextelement',
    [
        'antie/class',
        'antie/subtitles/timedtextattributes'
    ],
    function (Class, TimedTextAttributes) {
        'use strict';

        /**
         * An element in a timed text hierarchy.
         *
         * @class
         * @name antie.subtitles.TimedTextElement
         * @extends antie.Class
         */
        var TimedTextElement = Class.extend(/** @lends antie.subtitles.TimedTextElement.prototype */ {

            /**
             * Constructs a new timed text instance from a TTML XML document.
             *
             * @param {antie.subtitles.TimedTextElement.NODE_NAME} nodeName
             *        the name of the node this element represents
             *
             * @param {antie.subtitles.TimedTextElement[]} [children]
             *        the children of this element
             *
             * @constructor
             * @ignore
             */
            init: function (nodeName, children) {
                if (!TimedTextElement.NODE_NAME.hasOwnProperty(nodeName)) {
                    throw new Error('TimedTextElement - Unrecognised node name: ' + nodeName);
                }
                this._nodeName = nodeName;

                if (Array.isArray(children)) {
                    this._children = children;
                    this._setParentOfChildren();
                } else if (!children) {
                    this._children = [];
                } else {
                    throw new Error('TimedTextElement - children should be an array but was: ' + typeof children + '. Value: ' + children);
                }

                this._parent = null;
                this._text = null;
                this._attributes = new TimedTextAttributes();
            },

            /**
             * Returns this element's node name.
             * @returns {String} this element's node name
             * @public
             */
            getNodeName: function() {
                return this._nodeName;
            },

            /**
             * Sets the element's parent
             *
             * @param {antie.subtitles.TimeTextElement} parent
             *        the element's parent
             *
             * @public
             */
            setParent: function(parent) {
                if (typeof parent === 'object' && parent instanceof TimedTextElement) {
                    this._parent = parent;
                } else {
                    throw new Error('TimedTextElement - parent should be a TimedTextElement but was: ' + typeof parent + '. Value: ' + parent);
                }
            },

            /**
             * Returns the element's parent
             * @returns {antie.subtitles.TimeTextElement} the element's parent
             * @public
             */
            getParent: function() {
                return this._parent;
            },

            /**
             * Returns a copy of the element's children.
             * @returns {antie.subtitles.TimeTextElement[]} An array of this element's children
             * @public
             */
            getChildren: function() {
                return this._children.slice();
            },

            /**
             * Returns this element's attributes.
             * @returns {antie.subtitles.TimedTextAttributes} this element's attributes
             * @public
             */
            getAttributes: function() {
                return this._attributes;
            },

            /**
             * Replaces all the element's attributes with those specified.
             *
             * @param {antie.subtitles.TimedTextAttributes} attributes
             *        this element's attributes
             * @public
             */
            setAttributes: function(attributes) {
                if (typeof attributes === 'object' && attributes instanceof TimedTextAttributes) {
                    this._attributes = attributes;
                } else {
                    throw new Error('TimedTextElement - setAttributes not given an instance of antie.subtitles.TimedTextAttributes, was ' + typeof attributes + ': ' + attributes);
                }
            },

            /**
             * Returns the value of an attribute, whether it's applicable to this
             * element type or not.  If it's an inheriable attribute then it
             * will also be searched for on this element's ancestors if it is not
             * present on this element.
             *
             * @param {String} name
             *        The name of the attribute
             *
             * @returns {?any} the value of the named attribute, or null if it has not been set
             * @private
             */
            _getAttributeValue: function(name) {
                var value;
                value = this._attributes.getAttribute(name);
                if (value !== null && value !== undefined) {
                    return value;
                }

                if (this._nodeName === TimedTextElement.NODE_NAME.region) {
                    // If this is a region element then search all its style elements
                    if (this._attributes.isStyleAttribute(name)) {
                        for (var i = 0; i < this._children.length; i++) {
                            var child = this._children[i];
                            if (child.getNodeName() === TimedTextElement.NODE_NAME.style) {
                                value = child._getAttributeValue(name);
                                if (value !== null && value !== undefined) {
                                    return value;
                                }
                            }
                        }
                    }
                } else {
                    // If this is not a region then inheritance goes up - search parents (and then any associated regions)
                    if (this._attributes.isInheritable(name)) {
                        if (this._parent) {
                            value = this._parent._getAttributeValue(name);
                            if (value !== null && value !== undefined) {
                                return value;
                            }
                        }

                        // TODO What to do about a region "inherited" from a descendent?
                        var region = this.getAttributes().getAttribute('region'); // Only search own region attribute (inheritance will search parents')
                        if (region) {
                            value = region._getAttributeValue(name);
                            if (value !== null && value !== undefined) {
                                return value;
                            }
                        }
                    }
                }

                return null;
            },

            /**
             * Returns the value of an attribute.  Will only return values applicable
             * to this element's type.  If it's an inheriable attribute then it
             * will also be searched for on this element's ancestors if it is not
             * present on this element.
             *
             * @param {String} name
             *        The name of the attribute
             *
             * @returns {?any} the value of the named attribute, or null if it has not been set
             * @public
             */
            getAttribute: function(name) {
                if (this._attributes.isApplicableTo(name, this._nodeName)) {
                    return this._getAttributeValue(name);
                } else {
                    return null;
                }
            },

            /**
             * Sets this element's text content - text elements only.
             * @param {String} value this element's text content
             * @public
             */
            setText: function(value) {
                if (typeof value !== 'string') {
                    throw new Error('TimedTextElement.setText requires a string, but got ' + typeof value + ': ' + value);
                }

                if (this._nodeName === TimedTextElement.NODE_NAME.text) {
                    this._text = value;
                } else {
                    throw new Error('Cannot set text for a ' + this._nodeName + ' element');
                }
            },

            /**
             * Returns this element's text content - text elements only.
             * @returns {String} this element's text content
             * @public
             */
            getText: function() {
                return this._text;
            },

            getTimingPoints: function() {
                var interval = this._attributes.getTimingInterval();
                if (interval) {
                    interval.element = this;
                    return [ interval ];
                } else {
                    var timingPoints = [];
                    for (var i = 0; i < this._children.length; i++) {
                        timingPoints = timingPoints.concat(this._children[i].getTimingPoints());
                    }

                    return timingPoints;
                }
            },

            /**
             * Sets the parent of the children elements to be itself
             *
             * @private
             */
            _setParentOfChildren: function () {
                this._children.forEach(
                        function(child) {
                            child.setParent(this);
                        },
                        this
                    );
            },

            /**
             * Cleans out this instance ready for garbage collection.  This
             * instance cannot be used after this.
             * @public
             */
            destroy: function() {
                for (var i = 0; i < this._children.length; i++) {
                    this._children[i].destroy();
                }
                this._children.length = 0;
            }
        });

        /**
         * Valid names for TTML elements.
         * @name antie.subtitles.TimedTextElement.NODE_NAME
         * @enum {String}
         * @readonly
         */
        TimedTextElement.NODE_NAME = {
            body:    'body',
            br:      'br',
            div:     'div',
            head:    'head',
            layout:  'layout',
            p:       'p',
            region:  'region',
            span:    'span',
            style:   'style',
            styling: 'styling',
            text:    'text',
            tt:      'tt'
        };

        return TimedTextElement;
    }
);
