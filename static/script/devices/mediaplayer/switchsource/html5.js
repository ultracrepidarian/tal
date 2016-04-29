/**
 * @fileOverview Requirejs module containing device modifier for html5 source switching player
 *
 * @preserve Copyright (c) 2016 British Broadcasting Corporation
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
    'antie/devices/mediaplayer/switchsource/default',
    [
        'antie/class',
        'antie/runtimecontext',
        'antie/devices/device',
        'antie/devices/mediaplayer/mediaplayer'
    ],
    function (Class, RuntimeContext, Device, MediaPlayer) {
        'use strict';

        /**
         * Source switching player for devices that have cannot handle multiple video elements
         * Implements all functions of the underlying {antie.devices.mediaplayer.MediaPlayer} plus
         * addAlternateSource and playAlternateSource functions.
         * @name antie.devices.mediaplayer.switchsource.default
         * @class
         * @extends antie.Class
         */
        var HTML5SourceSwitchingPlayer = Class.extend({
            init: function () {
                this._mediaPlayer = RuntimeContext.getDevice().getMediaPlayer();
            },

            setSource: function (mediaType, sourceUrl, mimeType) {
                this._mediaPlayer.setSource(mediaType, sourceUrl, mimeType);
            },

            /**
             * Set the alternate media resource to be played when playAlternateSource is called.
             * @param {antie.devices.mediaplayer.MediaPlayer.TYPE} mediaType Value from the MediaPlayer.TYPE enum; audio or video.
             * @param {String} url location of the media resource to play
             * @param {String} mimeType type of media resource
             */
            setAlternateSource: function (mediaType, sourceUrl, mimeType) {
                this._mediaPlayer._setAlternateSource(mediaType, sourceUrl, mimeType);
            },

            /**
             * Play the alternate source from the time specified, the previous playing position, or the default position.
             * The currently playing source becomes the alternate.
             * @param {Number} [seconds] The optional time value to play the alternate source from.
             */
            playAlternateSource: function (seconds) {
                this._mediaPlayer._playAlternateSource(seconds);
            },

            beginPlayback: function () {
                this._mediaPlayer.beginPlayback();
            },

            beginPlaybackFrom: function (offset) {
                this._mediaPlayer.beginPlaybackFrom(offset);
            },

            playFrom: function (offset) {
                this._mediaPlayer.playFrom(offset);
            },

            pause: function () {
                this._mediaPlayer.pause();
            },

            resume: function () {
                this._mediaPlayer.resume();
            },

            stop: function () {
                this._mediaPlayer.stop();
            },

            reset: function () {
                this._mediaPlayer.reset();
            },

            getState: function () {
                return this._mediaPlayer.getState();
            },

            getSource: function () {
                return this._mediaPlayer.getSource();
            },

            getCurrentTime: function () {
                return this._mediaPlayer.getCurrentTime();
            },

            getSeekableRange: function () {
                return this._mediaPlayer.getSeekableRange();
            },

            getMimeType: function () {
                return this._mediaPlayer.getMimeType();
            },

            addEventCallback: function (thisArg, callback) {
                this._mediaPlayer.addEventCallback(thisArg, callback);
            },

            removeEventCallback: function (thisArg, callback) {
                this._mediaPlayer.removeEventCallback(thisArg, callback);
            },

            removeAllEventCallbacks: function () {
                this._mediaPlayer.removeAllEventCallbacks();
            },

            getPlayerElement: function () {
                return this._mediaPlayer.getPlayerElement();
            }
        });

        var instance;

        Device.prototype.getSourceSwitchingPlayer = function () {
            if (!instance) {
                instance = new HTML5SourceSwitchingPlayer();
            }
            return instance;
        };
    }
);
