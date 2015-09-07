/**
 * @fileOverview Requirejs module containing base antie.devices.anim.css3.prefix.sniffer class.
 *
 * @license Copyright (c) 2015 British Broadcasting Corporation. All rights reserved. License available at: https://github.com/fmtvp/tal/blob/master/LICENSE
 *
 * @deprecated IPTV-352 this class, which used to be a private method on propertymap.js, is marked for eradication.
 */

require.def(
    'antie/devices/anim/css3/prefix/sniffer',
    [
        'antie/class'
    ],
    function(Class) {
        "use strict";
        return Class.extend(
            {
                sniff: function(navigator) {
                    if (/WebKit/.test(navigator.userAgent) ) {
                        return "-webkit-";
                    }
                    if (/Gecko/.test(navigator.userAgent) ) {
                        return "-moz-";
                    }
                    if (/Opera/.test(navigator.userAgent) ) {
                        return "-o-";
                    }
                    return "";
                }
            }
        )
    }
);
