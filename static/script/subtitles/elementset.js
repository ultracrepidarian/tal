define(
    'antie/subtitles/elementset',
    [
        'antie/class'
    ],
    function(Class) {
        'use strict';

        var ElementSet = Class.extend({
            init: function(anotherSet) {
                if (anotherSet) {
                    this._elements = anotherSet._elements.slice();
                } else {
                    this._elements = [];
                }
            },

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

            delete: function(element) {
                if (element) {
                    for (var i = 0; i < this._elements.length; i++) {
                        if (this._elements[i] === element) {
                            this._elements.splice(i, 1);
                        }
                    }
                }
            },

            toArray: function() {
                return this._elements.slice();
            }
        });

        return ElementSet;
    }
);
