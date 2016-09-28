/**
 * @fileOverview The subtitles for a piece of content
 * @author ultracrepidarian
 */
define(
    'antie/subtitles/timedtext',
    [
        'antie/subtitles/elementset',
        'antie/subtitles/timedtextelement'
    ],
    function (ElementSet, TimedTextElement) {
        'use strict';

        /**
         * The subtiles for a piece of content, parsed from a TTML file.
         *
         * @class
         * @name antie.subtitles.TimedText
         * @extends antie.subtitles.TimedTextElement
         */
        var TimedText = TimedTextElement.extend(/** @lends antie.subtitles.TimedText.prototype */ {
            /**
             * Constructs a new timed text instance from a TTML XML document.
             *
             * @param {antie.subtitles.timedtexthead} head 
             *        the parsed <head> tag
             *        
             * @param {antie.subtitles.timedtextbody} body 
             *        the parsed <body> tag
             *        
             * @param {antie.subtitles.timedtextelement} [parent]
             *        the parent of the element
             * 
             * @constructor
             */
            init: function (head, body, parent) {
                this._head = head;
                this._body = body;

                var children = [];
                if (head) {
                    children.push(head);
                }
                if (body) {
                    children.push(body);
                }
                this._super(TimedTextElement.NODE_NAME.tt, parent, children);
            },

            /**
             * Returns the <head> child.
             *
             * @returns {TimedTextHead} the <head> child
             */
            getHead: function() {
                return this._head;
            },

            /**
             * Returns the <body> child.
             *
             * @returns {TimedTextBody} the <body> child
             */
            getBody: function() {
                return this._body;
            },

            /**
             * Adds element to a timepoint (new or existing) at the given time.
             *
             * @param {TimedTextElement} element
             *        The element to be added
             *
             * @param {Number} milliseconds
             *        The time in milliseconds
             * @private
             */
            _addElementAtTime: function(element, milliseconds)  {
                if (this._timePoints.length > 0 && this._timePoints[this._timePoints.length - 1].milliseconds === milliseconds) {
                    this._timePoints[this._timePoints.length - 1].active.add(element);
                } else {
                    var active;
                    if (this._timePoints.length > 0) {
                        active = new ElementSet(this._timePoints[this._timePoints.length - 1].active);
                    } else {
                        active = new ElementSet();
                    }

                    active.add(element);
                    this._timePoints.push({
                        'milliseconds': milliseconds,
                        'seconds': milliseconds / 1000,
                        'active': active
                    });
                }
            },

            /**
             * Removes element from timepoint (new or existing) at the given time.
             * If there is no timepoint at this time a new one is created, containing
             * all the currently active elements except element.
             *
             * @param {TimedTextElement} element
             *        The element to be removed
             *
             * @param {Number} milliseconds
             *        The time in milliseconds
             * @private
             */
            _removeElementAtTime: function(element, milliseconds)  {
                if (this._timePoints.length > 0 && this._timePoints[this._timePoints.length - 1].milliseconds === milliseconds) {
                    this._timePoints[this._timePoints.length - 1].active.delete(element);
                } else {
                    var active;
                    if (this._timePoints.length > 0) {
                        active = new ElementSet(this._timePoints[this._timePoints.length - 1].active);
                    } else {
                        active = new ElementSet();
                    }
                    active.delete(element);
                    this._timePoints.push({
                        'milliseconds': milliseconds,
                        'seconds': milliseconds / 1000,
                        'active': active
                    });
                }
            },

            /**
             * Initialises all the timepoints so {@link antie.subtitles.TimedTextElement#getActiveElements}
             * has something to work off.
             */
            initialiseActiveElements: function() {
                var beginnings = this.getTimingPoints().sort(function(a, b) {
                    return a.beginMilliseconds - b.beginMilliseconds;
                });
                var endings = beginnings.slice().sort(function(a, b) {
                    return a.endMilliseconds - b.endMilliseconds;
                });

                this._timePoints = [];
                for (var i = 0, j = 0; i < beginnings.length || j < endings.length;) {
                    if (!(i < beginnings.length)) {
                        // We have run out of beginnings (but not endings)
                        this._removeElementAtTime(endings[j].element, endings[j].endMilliseconds);
                        j += 1;
                    } else if (!(j < endings.length)) {
                        // We have run out of endings (but not beginnings). Can this happen?
                        this._addElementAtTime(beginnings[i].element, beginnings[i].beginMilliseconds);
                        i += 1;
                    } else {
                        // We have both beginnings and endings still to process
                        if (beginnings[i].beginMilliseconds <= endings[j].endMilliseconds) {
                            this._addElementAtTime(beginnings[i].element, beginnings[i].beginMilliseconds);
                            i += 1;
                        } else {
                            this._removeElementAtTime(endings[j].element, endings[j].endMilliseconds);
                            j += 1;
                        }
                    }
                }

                this._lastSeen = 0;
            },

            /**
             * @param {Number} seconds
             *        Number of seconds into the media
             * @returns {TimedTextElement[]} elements that should be onscreen at the specified time
             * @public
             */
            getActiveElements: function(seconds) {
                if (!this._timePoints || this._timePoints.length === 0) {
                    return [];
                }

                if (seconds < this._timePoints[this._lastSeen].seconds) {
                    this._lastSeen = 0;
                }
                for (var i = this._lastSeen; i < this._timePoints.length; i++) {
                    if (seconds < this._timePoints[i].seconds) {
                        if (i === 0) {
                            return [];
                        }
                        this._lastSeen = i - 1;
                        return this._timePoints[this._lastSeen].active.toArray();
                    }
                }

                this._lastSeen = this._timePoints.length - 1;
                return this._timePoints[this._lastSeen].active.toArray();
            },

            /**
             * Cleans out this instance ready for garbage collection.  This
             * instance cannot be used after this.
             */
            destroy: function() {
                this._super.destroy();
                this._head = null;
                this._body = null;
            }
        });

        return TimedText;
    }
);
