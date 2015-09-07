/**
 * @fileOverview Requirejs module containing base antie.devices.anim.css3.propertymap class.
 *
 * @license Copyright (c) 2015 British Broadcasting Corporation. All rights reserved. License available at: https://github.com/fmtvp/tal/blob/master/LICENSE
 */

require.def(
    'antie/devices/anim/css3/propertymap',
    [
        'antie/class',
        'antie/devices/anim/css3/prefix/sniffer'
    ],
    function (Class, Sniffer) {
        "use strict";

        /*
         * Abstracts browser specific prefixes for css3 transition attributes
         */
        return Class.extend(
            {
                init: function(prefix) {
                    this.sniffer = new Sniffer();
                    this.prefix = (typeof prefix === 'string') ? prefix : this.sniffer.sniff(navigator);
                    this.transitionEndEvents = this._getTransitionEndEvents(this.prefix);
                    this._setPrefixes(this, this.prefix);
                },

                _properties: [
                    "transition",
                    "transition-property",
                    "transition-duration",
                    "transition-timing-function",
                    "transition-delay",
                    "transform"
                ],

                _getTransitionEndEvents: function(prefix) {
                    var endEvents;
                    switch (prefix){
                        case "-webkit-":
                            endEvents = ["webkitTransitionEnd"];
                            break;
                        case "-moz-":
                            endEvents = ["transitionend"];
                            break;
                        case "-o-":
                            endEvents = ["oTransitionEnd", "otransitionend"];
                            break;
                        default:
                            endEvents = ["transitionend"];
                        }
                    return endEvents;
                },

                _addPrefix: function(original, prefix) {
                    var modified;
                    if (prefix !== "") {
                        modified = prefix + original;
                    }
                    return modified;
                },

                _setPrefixes: function(applyTo, prefix) {
                    var i;
                    for(i = 0; i !== this._properties.length; i += 1) {
                        applyTo[this._properties[i]] = this._addPrefix(this._properties[i], prefix);
                    }
                }
            }
        );

    }
);