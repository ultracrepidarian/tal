
/**
 * @fileOverview Requirejs module containing the antie.widgets.Subtitles class.
 *
 * @preserve Copyright (c) 2013 British Broadcasting Corporation
 * (http://www.bbc.co.uk) and TAL Contributors (1)
 *
 * (1) TAL Contributors are listed in the AUTHORS file and at
 *     https://github.com/fmtvp/TAL/AUTHORS - please extend this file,
 *     not this notice.
 *
 * @license Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * All rights reserved
 * Please contact us for an alternative licence
 */

define(
    'antie/widgets/subtitles',
    [
        'antie/widgets/widget',
        'antie/subtitles/timedtextelement'
    ],
    function(Widget, TimedTextElement) {
        'use strict';

        /**
         *
         * @name antie.widgets.Subtitles
         * @class
         * @extends antie.widgets.Widget
         * @param {String} [id] The unique ID of the widget. If excluded, a temporary internal ID will be used (but not included in any output).
         * @param {antie.subtitles.TimedText} timedText the object containing ttml information
         * @param {Function} getMediaTimeCallback a function that will return the current playpoint of the media in seconds
         * @param {Number} [mediaPollMilliseconds=200] number of milliseconds between polls of the current media time
        */
        var Subtitles = Widget.extend(/** @lends antie.widgets.Subtitles.prototype */ {
            /**
             * @constructor
             * @ignore
             */
            init: function(id, timedText, getMediaTimeCallback, mediaPollMilliseconds) {
                init.base.call(this, id);

                this._timedText = timedText;
                this._getMediaTimeCallback = getMediaTimeCallback;

                if (typeof mediaPollMilliseconds === 'undefined' ) {
                    this._mediaPollMilliseconds = 200;
                } else if (typeof mediaPollMilliseconds === 'number' && mediaPollMilliseconds > 0) {
                    this._mediaPollMilliseconds = mediaPollMilliseconds;
                } else {
                    throw new Error('mediaPollMilliseconds should be a non negative number, but was ' + typeof mediaPollMilliseconds + ': ' + mediaPollMilliseconds);
                }

                this._activeElements = [];
                this._regions = {};

            },
            /**
             * Renders the widget and any child widgets to device-specific output.
             * @param {antie.devices.Device} device The device to render to.
             * @returns A device-specific object that represents the widget as displayed on the device (in a browser, a DOMElement);
             */
            render: function(device) {
                if (!this.outputElement) {
                    this.outputElement = device.createContainer(this.id, ['subtitlesContainer']);
                }
                return this.outputElement;
            },

            /**
             * Starts displaying the captions and starts an interval Timer
             * to keep them updating
             */
            start: function () {
                this._createRegions();
                this.update();

                if(!this._updateInterval){
                    this._updateInterval = setInterval(this.update.bind(this), this._mediaPollMilliseconds);
                }
            },
            /**
             * Stops displaying the captions and clears the interval timer
             */
            stop: function () {
                this._activeElements = [];
                this._removeCaptions();
                this._regions = {};

                if(this._updateInterval){
                    clearInterval(this._updateInterval);
                    this._updateInterval = null;
                }
            },

            /**
             * Get a region HTML element by id, when a reference has been added
             * previously to the this._regions object
             *
             * @private
             * @param {String} id the id of the region
             * @returns {HtmlElement} the region
             */
            _getRegionById: function(id){
                if(this._regions.hasOwnProperty(id)){
                    return this._regions[id];
                }
                return null;
            },

            /**
             * Update the subtitles on screen with those that are current
             * according to the time of the mediaPlayer
             */
            update: function(){
                if (!this._getMediaTimeCallback) {
                    // clean up
                    this.stop();
                } else {
                    var time = this._getMediaTimeCallback();
                    this._updateCaptions(time);
                }
            },

            /**
             * Update the subtitles on screen with those that are current
             * according to the time of the mediaPlayer
             * @private
             * @param {Integer} time The time (in seconds) to show the captions for.
             */
            _updateCaptions: function (time) {
                var currentActiveElements = this._timedText.getActiveElements(time);
                // if the two arrays are equal there is no need to refresh the content
                if(!this._arraysEqual(currentActiveElements, this._activeElements)){
                    this._activeElements = currentActiveElements;
                    // // Clear out old captions
                    this._removeCaptions();

                    this._createRegions();

                    // Add new captions
                    this._addCaptions(this._activeElements);
                }
            },

            /**
             * Clear the outputElement so there are no subtitles on the screen
             * @private
             */
            _removeCaptions: function () {
                var device = this.getCurrentApplication().getDevice();
                device.clearElement(this.outputElement);
                this._regions = {};
            },

            /**
             * Add subtitles to the output element
             * @private
             * @param {Array} [antie.subtitles.TimedTextElement] activeElements
             *                  the array of active timedTextElements to display.
             */
            _addCaptions: function (activeElements) {
                var device = this.getCurrentApplication().getDevice();

                for(var i = 0; i < activeElements.length; i++){
                    var element = this._createElementTree(activeElements[i]);
                    var domRegion = null;

                    if(activeElements[i].getAttribute('region')){
                        // try and find the region to append this new element to
                        // if it has a region specified
                        domRegion = this._getRegionById(activeElements[i].getAttribute('region').getAttribute('id'));
                    }

                    if(domRegion){
                        device.appendChildElement(domRegion, element);
                    } else {
                        device.appendChildElement(this.outputElement, element);
                    }
                }
            },

            /**
             * create the regions described in the timedText instance, append
             * them to the DOM and add a reference to each so they can be retrieved
             * later
             * @private
             */
            _createRegions: function(){
                var device = this.getCurrentApplication().getDevice();

                if(this._timedText.getHead() && this._timedText.getHead().getLayout()){
                    var regions = this._timedText.getHead().getLayout().getChildren();
                    for(var i = 0; i < regions.length; i++){
                        var region = this._createElementTree(regions[i]);
                        // keep a reference to the region so we can append to it later
                        this._regions[regions[i].getAttribute('id')] = region;

                        device.appendChildElement(this.outputElement, region);
                    }
                }
            },

            /**
             * Recurse through an active timed text element and it's children and
             * create the dom node structure to be displayed in the widget
             * @private
             * @param {TimedTextLement} timedTextElement the active element
             * @returns {HTMLElement} the root HTML element with childNodes corresponding
             *                        to the children of the timedTextElement
             */
            _createElementTree: function(timedTextElement){
                //create this node
                var node = this._createElement(timedTextElement);
                //set the styling on it
                this._setStylingOnElement(node, timedTextElement);

                // create the child nodes and attach them to this one, if there
                // are no children then it will just fall through and return
                var children = timedTextElement.getChildren();
                for(var i = 0; i < children.length; i++){

                    // call this function recursively on the child nodes to create
                    // the whole tree
                    node.appendChild(this._createElementTree(children[i]));
                }

                // return this node to be attached to its parent node or the output element
                return node;
            },

            /**
             * Create and return an HTMLNode for a corresponding TimedTextElement using
             * the device abstraction layer
             * @private
             * @param {TimedTextLement} timedTextElement the single element to create
             *                         an HTMLNode for
             * @returns {HTMLElement} the basic HTML element
             */
            _createElement: function(timedTextElement){
                var device = this.getCurrentApplication().getDevice();
                var newElement;

                if(!timedTextElement || !timedTextElement.getNodeName){
                    return;
                }

                // create the element itself
                switch(timedTextElement.getNodeName()){
                case TimedTextElement.NODE_NAME.br:
                    newElement = device.createLineBreak();
                    // newElement.style.visibility = 'visible';
                    break;
                case TimedTextElement.NODE_NAME.div:
                    newElement = device.createContainer();
                    // newElement.style.visibility = 'visible';
                    break;
                case TimedTextElement.NODE_NAME.region:
                    newElement = device.createContainer();
                    // newElement.style.visibility = 'collapse'; // we dont want to actually draw a big black box over half the screen, or do we???
                    break;
                case TimedTextElement.NODE_NAME.p:
                    newElement = device.createParagraph(null, ['subtitlesParagraphElement']);
                    // newElement.style.visibility = 'visible';
                    newElement.style.width = '100%';
                    break;
                case TimedTextElement.NODE_NAME.span:
                    newElement = device.createSpan(null, ['subtitlesSpanElement']);
                    // newElement.style.visibility = 'visible';
                    break;
                case TimedTextElement.NODE_NAME.text:
                    newElement = device.createTextNode(timedTextElement.getText());
                    break;
                default:
                    return;
                }

                return newElement;
            },

            /**
             * Set the styling on an htmlElement to match those of the provided
             * TimedTextObject
             *
             * @param {HTMLElement} htmlElement the HTML element to set the styling on
             * @param {TimedTextElement} timedTextElement the name of the attribute to set i.e. 'backgroundColour'
             *
             */
            _setStylingOnElement: function(htmlElement, timedTextElement){
                // add the styling
                for (var style in Subtitles.SUPPORTED_STYLES){
                    if (Subtitles.SUPPORTED_STYLES.hasOwnProperty(style)){
                        // if the supported attribute is set on the TimedTextElement then set
                        // it also on the new HTML element
                        var attributeValue = timedTextElement.getAttribute(style);
                        if (attributeValue){
                            if (style === 'fontSize'){
                                // the fontSize value is an object with {width:.. height..}
                                this._setStyleAttributeOnElement(htmlElement, Subtitles.SUPPORTED_STYLES[style], attributeValue.height);
                            } else if (style === 'padding'){
                                this._setStyleAttributeOnElement(htmlElement, Subtitles.SUPPORTED_STYLES[style], attributeValue.join(' '));
                            } else if (style === 'extent'){
                                this._setStyleAttributeOnElement(htmlElement, 'width', attributeValue.width);
                                this._setStyleAttributeOnElement(htmlElement, 'height', attributeValue.height);
                            } else if (style === 'origin'){
                                this._setStyleAttributeOnElement(htmlElement, 'position', 'absolute');
                                this._setStyleAttributeOnElement(htmlElement, 'left', attributeValue.left);
                                this._setStyleAttributeOnElement(htmlElement, 'top', attributeValue.top);
                            } else if (style === 'displayAlign'){
                                //TODO - make this non webkit specific
                                this._setStyleAttributeOnElement(htmlElement, 'display', '-webkit-flex');
                                switch(attributeValue){
                                case 'before':
                                    this._setStyleAttributeOnElement(htmlElement, '-webkit-align-items', 'flex-start');
                                    break;
                                case 'after':
                                    this._setStyleAttributeOnElement(htmlElement, '-webkit-align-items', 'flex-end');
                                    break;
                                case 'center':
                                    this._setStyleAttributeOnElement(htmlElement, '-webkit-align-items', 'center');
                                    break;
                                }
                            } else if (style === 'textOutline'){
                                this._setStyleAttributeOnElement(htmlElement, '-webkit-text-stroke', [attributeValue.outlineThickness, attributeValue.color].join(' '));
                            } else {
                                this._setStyleAttributeOnElement(htmlElement, Subtitles.SUPPORTED_STYLES[style], attributeValue);
                            }
                        }
                    }
                }
            },

            /**
             * set the value of a named styled attribute of an HTMLElement
             *
             * @param {HTMLElement} element the HTML element to set the styling on
             * @param {String} attribute the name of the attribute to set i.e. 'backgroundColour'
             * @param {String} value the value to set the named attribute to
             *
             */
            _setStyleAttributeOnElement: function(element, attribute, value){
                if(element && element.style && value){
                    element.style[attribute] = value;
                }
            },

            /**
            * function to compare whether two arrays contain the same elements
            * This is useful in the case where you have a shallow copy of the
            * array, where arrayA === arrayB would evaluate to false, even through
            * the elements they contain are the same, and in the same order
            *
            * @param {Array} arrayA the first array to compare
            * @param {Array} arrayB the second array to compare
            * @returns {Boolean} whether the arrays have equal elements
            */
            _arraysEqual: function(arrayA, arrayB){
                if (arrayA === arrayB){
                    return true;
                }
                if (arrayA === null || arrayB === null) {
                    return false;
                }
                if (arrayA.length !== arrayB.length) {
                    return false;
                }

                for (var i = 0; i < arrayA.length; ++i) {
                    if (arrayA[i] !== arrayB[i]) {
                        return false;
                    }
                }
                return true;
            },

            /**
             * Destroys the widget and clears timers
             * @private
             */
            destroy: function () {
                if(this._updateInterval){
                    clearInterval(this._updateInterval);
                    this._updateInterval = null;
                }

                this._timedText = null;
                this._getMediaTimeCallback = null;
                this._activeElements = null;
            }
        });

        Subtitles.SUPPORTED_STYLES = {
            'backgroundColor'     : 'backgroundColor',
            'color'               : 'color',
            'direction'           : 'direction',
            'display'             : 'display',
            'displayAlign'        : 'displayAlign',
            'extent'              : 'extent',
            'fontFamily'          : 'fontFamily',
            'fontSize'            : 'fontSize',
            'fontStyle'           : 'fontStyle',
            'fontWeight'          : 'fontWeight',
            'lineHeight'          : 'lineHeight',
            'opacity'             : 'opacity',
            'origin'              : 'origin',
            'overflow'            : 'overflow',
            'padding'             : 'padding',
            'showBackground'      : 'showBackground',
            'textAlign'           : 'textAlign',
            'textDecoration'      : 'textDecoration',
            'textOutline'         : 'textOutline',
            'unicodeBidi'         : 'unicodeBidi',
            'visibility'          : 'visibility',
            'wrapOption'          : 'wrapOption',
            'writingMode'         : 'writingMode',
            'zIndex'              : 'zIndex'
        };

        return Subtitles;
    }
);
