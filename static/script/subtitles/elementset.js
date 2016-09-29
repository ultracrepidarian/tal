/**
 * @fileOverview An implementation of Set.
 * @author ultracrepidarian
 */
define(
    'antie/subtitles/elementset',
    [
        'antie/class'
    ],
    function(Class) {
        'use strict';

        /**
         * An implementation of a set. Set is not available in PhantomJS and doubtless
         * other JS engines too.
         *
         * TODO Should something like this be used to stand in for Set when it's not there?
         *
         * @param {antie.subtitles.ElementSet} [anotherSet]
         *        if this is specified, its contents are copied into the new set
         * @class
         * @name antie.subtitles.ElementSet
         * @extends antie.Class
         */
        var ElementSet = Class.extend(/** @lends antie.subtitles.ElementSet.prototype */ {
            /**
             * @constructor
             * @ignore
             */
            init: function(anotherSet) {
                if (anotherSet) {
                    this._elements = anotherSet._elements.slice();
                } else {
                    this._elements = [];
                }
            },

            /**
             * Checks if an element is a member of the set.
             *
             * @param {any} element
             *        The element to be be checked
             *
             * @returns {Boolean} true if element is a member of the set,
             *                    false if not
             */
            contains: function(element) {
                for (var i = 0; i < this._elements.length; i++) {
                    if (this._elements[i] === element) {
                        return true;
                    }
                }

                return false;
            },

            /**
             * Adds a new element to the set, if it is not already a member.
             *
             * @param {any} element
             *        The element to be added
             */
            add: function(element) {
                if (element) {
                    for (var i = 0; i < this._elements.length; i++) {
                        if (this._elements[i] === element) {
                            return;
                        }
                    }

                    this._elements.push(element);
                }
            },

            /**
             * Removes an element from the set, if is a member.
             *
             * @param {any} element
             *        The element to be deleted
             */
            delete: function(element) {
                if (element) {
                    for (var i = 0; i < this._elements.length; i++) {
                        if (this._elements[i] === element) {
                            this._elements.splice(i, 1);
                        }
                    }
                }
            },

            /**
             * Returns the set's alements as an array.
             *
             * @returns {any[]} an array of the set's elements
             */
            toArray: function() {
                return this._elements.slice();
            }
        });

        return ElementSet;
    }
);
