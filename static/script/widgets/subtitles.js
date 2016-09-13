
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
         * @param {antie.subtitles.TimedText} media Media widget which will be playing the content that the captions are associated with.
         * @param {antie.widgets.Media} media Media widget which will be playing the content that the captions are associated with.
        */
        var Subtitles = Widget.extend(/** @lends antie.widgets.Subtitles.prototype */ {
            /**
             * @constructor
             * @ignore
             */
            init: function(id, timedText, getMediaTimeCallback) {
                this._super(id);

                this._timedText = timedText;
                this._getMediaTimeCallback = getMediaTimeCallback;
                this._activeElements = [];

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
                this.update();

                if(!this._updateInterval){
                    this._updateInterval = setInterval(this.update.bind(this), 750);
                }
            },
            /**
             * Stops displaying the captions and clears the interval timer
             */
            stop: function () {
                this._removeCaptions();

                if(this._updateInterval){
                    clearInterval(this._updateInterval);
                    this._updateInterval = null;
                }
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
                    device.appendChildElement(this.outputElement, element);
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
            _createElement: function(element){
                var device = this.getCurrentApplication().getDevice();
                switch(element.getNodeName()){
                case TimedTextElement.NODE_NAME.br:
                    return device.createLineBreak();
                case TimedTextElement.NODE_NAME.div:
                    return device.createContainer();
                case TimedTextElement.NODE_NAME.p:
                    return device.createParagraph();
                case TimedTextElement.NODE_NAME.span:
                    return device.createSpan();
                case TimedTextElement.NODE_NAME.text:
                    return device.createTextNode(element.getText());
                default:
                    return null;
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

        return Subtitles;
    }
);
