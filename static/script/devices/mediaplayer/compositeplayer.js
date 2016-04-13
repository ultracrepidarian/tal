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
    'antie/devices/mediaplayer/compositeplayer',
    [
        'antie/runtimecontext',
        'antie/devices/device',
        'antie/devices/mediaplayer/mediaplayer',
        'antie/devices/mediaplayer/html5',
        'antie/devices/mediaplayer/dashplayer'
    ],
    function(RuntimeContext, Device, MediaPlayer, Html5Player, DashPlayer) {
        'use strict';

        /**
         * MediaPlayer implementation which allow player registration based on mime type
         * @name antie.devices.mediaplayer.CompositePlayer
         * @class
         * @extends antie.devices.mediaplayer.MediaPlayer
         */
        var Player = MediaPlayer.extend({

            init: function(defaultPlayer) {
                this._super();
                this._player = null;
                this._defaultPlayer = defaultPlayer;
                this._registerCallbacks(this._defaultPlayer);
                this._players = [];
            },

            _registerCallbacks : function( player ) {
                player.addEventCallback(this, function(evt) { this._callbackManager.callAll(evt); });
            },
            
            registerPlayer : function(mimeType, player){
                this._players[mimeType] = player;
                this._registerCallbacks(player);
            },
            
            /**
             * @inheritDoc
             */
            setSource: function(mediaType, url, mimeType) {
                if (!this._player) {
                    this._player = this._players[mimeType];
                    if (!this._player){
                        this._player = this._defaultPlayer;
                    }
                    if (this._player){
                        this._player.setSource(mediaType, url, mimeType);
                    }
                }
            },

            _delegate : function(args){
                var f_name = arguments[0];
                var f_args = Array.prototype.slice.call(arguments, 1);

                var player = this._player;
                if (this._player){
                    return player[f_name].apply(player, f_args);
                } else {
                    this._toError('Cannot ' + f_name + ' while in the empty state');
                }

            },

            /**
             * @inheritDoc
             */
            playFrom: function(seconds) {
                this._delegate('playFrom', seconds);
            },

            /**
             * @inheritDoc
             */
            beginPlayback: function() {
                this._delegate('beginPlayback');
            },

            /**
             * @inheritDoc
             */
            beginPlaybackFrom: function(seconds) {
                this._delegate('beginPlaybackFrom', seconds);
            },

            /**
             * @inheritDoc
             */
            pause: function() {
                this._delegate('pause');
            },

            /**
             * @inheritDoc
             */
            resume : function() {
                this._delegate('resume');
            },

            /**
             * @inheritDoc
             */
            stop: function() {
                this._delegate('stop');
            },

            /**
             * @inheritDoc
             */
            reset: function() {
                this._delegate('reset');
                this._player = null;
            },

            /**
             * @inheritDoc
             */
            getSource: function() {
                return this._source;
            },

            /**
             * @inheritDoc
             */
            getMimeType: function() {
                return this.mimeType;
            },

            /**
             * @inheritDoc
             */
            getCurrentTime: function() {
                return this._delegate('getCurrentTime');
            },

            /**
             * @inheritDoc
             */
            getSeekableRange: function() {
                return this._delegate('getSeekableRange');
            },

            /**
             * @inheritDoc
             */
            getDuration: function() {
                return this._delegate('getDuration');
            },

            /**
             * @inheritDoc
             */
            getState: function() {
                if (this._player){
                    return this._player.getState();
                } else {
                    return MediaPlayer.STATE.EMPTY;
                }
            },

            /**
             * @inheritDoc
             */
            getPlayerElement: function() {
                if (this._player){
                    return this._player.getPlayerElement();
                }
                return undefined;
            }
        });

        var instance = new Player(new Html5Player());
        instance.registerPlayer('application/dash+xml', new DashPlayer());

        // Mixin this MediaPlayer implementation, so that device.getMediaPlayer() returns the correct implementation for the device
        Device.prototype.getMediaPlayer = function() {
            return instance;
        };
        return Player;
    }
);
