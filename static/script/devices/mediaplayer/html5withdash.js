/**
 * @fileOverview Requirejs module containing device modifier for HTML5 media playback
 *
 * @preserve Copyright (c) 2014 British Broadcasting Corporation
 * (http://www.bbc.co.uk) and TAL Contributors (1)
 *
 * (1) TAL Contributors are listed in the AUTHORS file and at
 *     https://github.com/fmtvp/TAL/AUTHORS - please extend this file,
 *     not this notice.
 *
 * @license Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * All rights reserved
 * Please contact us for an alternative licence
 */

define(
    'antie/devices/mediaplayer/html5withdash',
    [
        'antie/devices/device',
        'antie/devices/mediaplayer/compositeplayer',
        'antie/devices/mediaplayer/html5player',
        'antie/devices/mediaplayer/dashplayer'
    ],
    function(Device, CompositePlayer, Html5Player, DashPlayer) {
        'use strict';

        var bitrateLookupTable = {
            '704' : 1570,
            '960' : 2812,
            '1280' : 5070,
            '1920' : 8000
        }
        var instance = new CompositePlayer(new Html5Player(bitrateLookupTable));
        instance.registerPlayer('application/dash+xml', new DashPlayer());

        // Mixin this MediaPlayer implementation, so that device.getMediaPlayer() returns the correct implementation for the device
        Device.prototype.getMediaPlayer = function() {
            return instance;
        };
    }
);
