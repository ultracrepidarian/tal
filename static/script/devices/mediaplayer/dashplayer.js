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
    'antie/devices/mediaplayer/dashplayer',
    [
        'antie/runtimecontext',
        'antie/devices/device',
        'antie/devices/mediaplayer/mediaplayer'
    ],
    function(RuntimeContext, Device, MediaPlayer) {
        'use strict';

        /**
         * Main MediaPlayer implementation for use with dash.j.
         * Use this device modifier if a device implements the EME/MSE media playback standard.
         * @name antie.devices.mediaplayer.DashPlayer
         * @class
         * @extends antie.devices.mediaplayer.MediaPlayer
         */
        var Player = MediaPlayer.extend({

            init: function() {
                this._super();
                this._state = MediaPlayer.STATE.EMPTY;
            },

            /**
             * @inheritDoc
             */
            setSource: function(mediaType, url, mimeType) {
                if (this.getState() === MediaPlayer.STATE.EMPTY) {
                    this._type = mediaType;
                    this._source = url;
                    var device = RuntimeContext.getDevice();

                    var idSuffix = 'Video';
                    if (mediaType === MediaPlayer.TYPE.AUDIO || mediaType === MediaPlayer.TYPE.LIVE_AUDIO) {
                        idSuffix = 'Audio';
                    }

                    this._mediaElement = device._createElement(idSuffix.toLowerCase(), 'mediaPlayer' + idSuffix);
                    this._mediaElement.autoplay = false;
                    this._mediaElement.style.position = 'absolute';
                    this._mediaElement.style.top = '0px';
                    this._mediaElement.style.left = '0px';
                    this._mediaElement.style.width = '100%';
                    this._mediaElement.style.height = '100%';

                    var self = this;
                    this._wrapOnFinishedBuffering = function() {
                        self._onFinishedBuffering();
                    }; //jshint ignore:line
                    this._wrapOnError = function() {
                        self._onDeviceError();
                    }; //jshint ignore:line
                    this._wrapOnEndOfMedia = function() {
                        self._onEndOfMedia();
                    }; //jshint ignore:line
                    this._wrapOnDeviceBuffering = function() {
                        self._onDeviceBuffering();
                    }; //jshint ignore:line
                    this._wrapOnStatus = function() {
                        self._onStatus();
                    }; //jshint ignore:line
                    this._wrapOnMetadata = function() {
                        self._onMetadata();
                    }; //jshint ignore:line
                    this._mediaElement.addEventListener('canplay', this._wrapOnFinishedBuffering, false);
                    this._mediaElement.addEventListener('seeked', this._wrapOnFinishedBuffering, false);
                    this._mediaElement.addEventListener('playing', this._wrapOnFinishedBuffering, false);
                    this._mediaElement.addEventListener('error', this._wrapOnError, false);
                    this._mediaElement.addEventListener('ended', this._wrapOnEndOfMedia, false);
                    this._mediaElement.addEventListener('waiting', this._wrapOnDeviceBuffering, false);
                    this._mediaElement.addEventListener('timeupdate', this._wrapOnStatus, false);
                    this._mediaElement.addEventListener('loadedmetadata', this._wrapOnMetadata, false);

                    var appElement = RuntimeContext.getCurrentApplication().getRootWidget().outputElement;
                    device.prependChildElement(appElement, this._mediaElement);

                    // register DASH player
                    this._player = dashjs.MediaPlayer().create();
                    this._player.initialize(this._mediaElement, url, false);
                    this._toStopped();
                } else {
                    this._toError('Cannot set source unless in the \'' + MediaPlayer.STATE.EMPTY + '\' state');
                }
            },

            /**
             * @inheritDoc
             */
            playFrom: function(seconds) {
                this._postBufferingState = MediaPlayer.STATE.PLAYING;
                this._targetSeekTime = seconds;

                switch (this.getState()) {
                case MediaPlayer.STATE.PAUSED:
                case MediaPlayer.STATE.COMPLETE:
                    this._toBuffering();
                    this._playFromIfReady();
                    break;

                case MediaPlayer.STATE.BUFFERING:
                    this._playFromIfReady();
                    break;

                case MediaPlayer.STATE.PLAYING:
                    this._toBuffering();
                    this._targetSeekTime = this._getClampedTimeForPlayFrom(seconds);
                    if (this._isNearToCurrentTime(this._targetSeekTime)) {
                        this._targetSeekTime = undefined;
                        this._toPlaying();
                    } else {
                        this._playFromIfReady();
                    }
                    break;

                default:
                    this._toError('Cannot playFrom while in the \'' + this.getState() + '\' state');
                    break;
                }
            },

            /**
             * @inheritDoc
             */
            beginPlayback: function() {
                this._postBufferingState = MediaPlayer.STATE.PLAYING;
                switch (this.getState()) {
                case MediaPlayer.STATE.STOPPED:
                    this._toBuffering();
                    this._mediaElement.play();
                    break;

                default:
                    this._toError('Cannot beginPlayback while in the \'' + this.getState() + '\' state');
                    break;
                }
            },

            /**
             * @inheritDoc
             */
            beginPlaybackFrom: function(seconds) {
                this._postBufferingState = MediaPlayer.STATE.PLAYING;
                this._targetSeekTime = seconds;

                switch (this.getState()) {
                case MediaPlayer.STATE.STOPPED:
                    this._toBuffering();
                    this._playFromIfReady();
                    break;

                default:
                    this._toError('Cannot beginPlaybackFrom while in the \'' + this.getState() + '\' state');
                    break;
                }
            },

            /**
             * @inheritDoc
             */
            pause: function() {
                this._postBufferingState = MediaPlayer.STATE.PAUSED;
                switch (this.getState()) {
                case MediaPlayer.STATE.PAUSED:
                    break;

                case MediaPlayer.STATE.BUFFERING:
                    if (this._isReadyToPlayFrom()) {
                        // If we are not ready to playFrom, then calling pause would seek to the start of media, which we might not want.
                        this._mediaElement.pause();
                    }
                    break;

                case MediaPlayer.STATE.PLAYING:
                    this._mediaElement.pause();
                    this._toPaused();
                    break;

                default:
                    this._toError('Cannot pause while in the \'' + this.getState() + '\' state');
                    break;
                }
            },

            /**
             * @inheritDoc
             */
            resume : function() {
                this._postBufferingState = MediaPlayer.STATE.PLAYING;
                switch (this.getState()) {
                case MediaPlayer.STATE.PLAYING:
                    break;

                case MediaPlayer.STATE.BUFFERING:
                    if (this._isReadyToPlayFrom()) {
                        // If we are not ready to playFrom, then calling play would seek to the start of media, which we might not want.
                        this._mediaElement.play();
                    }
                    break;

                case MediaPlayer.STATE.PAUSED:
                    this._mediaElement.play();
                    this._toPlaying();
                    break;

                default:
                    this._toError('Cannot resume while in the \'' + this.getState() + '\' state');
                    break;
                }
            },

            /**
             * @inheritDoc
             */
            stop: function() {
                switch (this.getState()) {
                case MediaPlayer.STATE.STOPPED:
                    break;

                case MediaPlayer.STATE.BUFFERING:
                case MediaPlayer.STATE.PLAYING:
                case MediaPlayer.STATE.PAUSED:
                case MediaPlayer.STATE.COMPLETE:
                    this._mediaElement.pause();
                    this._toStopped();
                    break;

                default:
                    this._toError('Cannot stop while in the \'' + this.getState() + '\' state');
                    break;
                }
            },

            /**
             * @inheritDoc
             */
            reset: function() {
                switch (this.getState()) {
                case MediaPlayer.STATE.EMPTY:
                    break;

                case MediaPlayer.STATE.STOPPED:
                case MediaPlayer.STATE.ERROR:
                    this._toEmpty();
                    break;

                default:
                    this._toError('Cannot reset while in the \'' + this.getState() + '\' state');
                    break;
                }
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
                return "application/dash+xml";
            },

            /**
             * @inheritDoc
             */
            getCurrentTime: function() {
                switch (this.getState()) {
                case MediaPlayer.STATE.STOPPED:
                case MediaPlayer.STATE.ERROR:
                    break;

                default:
                    if (this._mediaElement) {
                        return this._mediaElement.currentTime;
                    }
                    break;
                }
                return undefined;
            },

            /**
             * @inheritDoc
             */
            getSeekableRange: function() {
                switch (this.getState()) {
                case MediaPlayer.STATE.STOPPED:
                case MediaPlayer.STATE.ERROR:
                    break;

                default:
                    return this._getSeekableRange();
                }
                return undefined;
            },

            /**
             * @inheritDoc
             */
            _getMediaDuration: function() {
                if (this._mediaElement && this._isReadyToPlayFrom()) {
                    return this._mediaElement.duration;
                }
                return undefined;
            },

            _getSeekableRange: function() {
                if (this._player && this._isReadyToPlayFrom()) {
                    return {
                        start: this._player.getDVRSeekOffset(0),
                        end: this._player.getDVRSeekOffset(0) + this._player.duration()
                    };
                }
                return undefined;
            },

            /**
             * @inheritDoc
             */
            getState: function() {
                return this._state;
            },

            /**
             * @inheritDoc
             */
            getPlayerElement: function() {
                return this._mediaElement;
            },

            _onFinishedBuffering: function() {
                this._exitBuffering();
            },

            _onDeviceError: function() {
                this._reportError('Media element error code: ' + this._mediaElement.error.code);
            },

            /**
             * @protected
             */
            _onDeviceBuffering: function() {
                if (this.getState() === MediaPlayer.STATE.PLAYING) {
                    this._toBuffering();
                }
            },

            _onEndOfMedia: function() {
                this._toComplete();
            },

            _onStatus: function() {
                if (this.getState() === MediaPlayer.STATE.PLAYING) {
                    this._emitEvent(MediaPlayer.EVENT.STATUS);
                }
            },

            _onMetadata: function() {
                this._metadataLoaded();
            },

            _exitBuffering: function () {
                this._metadataLoaded();
                if (this.getState() !== MediaPlayer.STATE.BUFFERING) {
                    return;

                } else if (this._postBufferingState === MediaPlayer.STATE.PAUSED) {
                    this._toPaused();
                } else {
                    this._toPlaying();
                }
            },

            _metadataLoaded: function () {
                this._readyToPlayFrom = true;
                if (this._waitingToPlayFrom()) {
                    this._deferredPlayFrom();
                }
            },

            _playFromIfReady: function() {
                if (this._isReadyToPlayFrom()) {
                    if (this._waitingToPlayFrom()) {
                        this._deferredPlayFrom();
                    }
                }
            },

            _waitingToPlayFrom: function() {
                return this._targetSeekTime !== undefined;
            },

            _deferredPlayFrom: function() {
                this._seekTo(this._targetSeekTime);
                this._mediaElement.play();
                if (this._postBufferingState === MediaPlayer.STATE.PAUSED) {
                    this._mediaElement.pause();
                }
                this._targetSeekTime = undefined;
            },

            _seekTo: function(seconds) {
                var clampedTime = this._getClampedTimeForPlayFrom(seconds);
                this._mediaElement.currentTime = clampedTime;
            },

            _getClampedTimeForPlayFrom: function(seconds) {
                var clampedTime = this._getClampedTime(seconds);
                if (clampedTime !== seconds) {
                    var range = this._getSeekableRange();
                    RuntimeContext.getDevice().getLogger().debug('playFrom ' + seconds + ' clamped to ' + clampedTime + ' - seekable range is { start: ' + range.start + ', end: ' + range.end + ' }');
                }
                return clampedTime;
            },

            _wipe: function() {
                this._type = undefined;
                this._source = undefined;
                this._mimeType = undefined;
                this._targetSeekTime = undefined;
                this._destroyMediaElement();
            },

            _destroyMediaElement: function() {
                if (this._player){
                    this._player.reset();
                    delete this._player;
                }

                if (this._mediaElement) {
                    this._mediaElement.removeEventListener('canplay', this._wrapOnFinishedBuffering, false);
                    this._mediaElement.removeEventListener('seeked', this._wrapOnFinishedBuffering, false);
                    this._mediaElement.removeEventListener('playing', this._wrapOnFinishedBuffering, false);
                    this._mediaElement.removeEventListener('error', this._wrapOnError, false);
                    this._mediaElement.removeEventListener('ended', this._wrapOnEndOfMedia, false);
                    this._mediaElement.removeEventListener('waiting', this._wrapOnDeviceBuffering, false);
                    this._mediaElement.removeEventListener('timeupdate', this._wrapOnStatus, false);
                    this._mediaElement.removeEventListener('loadedmetadata', this._wrapOnMetadata, false);
                    
                    var device = RuntimeContext.getDevice();
                    device.removeElement(this._mediaElement);
                    delete this._mediaElement;
                }
            },

            _reportError: function(errorMessage) {
                RuntimeContext.getDevice().getLogger().error(errorMessage);
                this._emitEvent(MediaPlayer.EVENT.ERROR, {'errorMessage': errorMessage});
            },

            _toStopped: function() {
                this._state = MediaPlayer.STATE.STOPPED;
                this._emitEvent(MediaPlayer.EVENT.STOPPED);
            },

            _toBuffering: function() {
                this._state = MediaPlayer.STATE.BUFFERING;
                this._emitEvent(MediaPlayer.EVENT.BUFFERING);
            },

            _toPlaying: function() {
                this._state = MediaPlayer.STATE.PLAYING;
                this._emitEvent(MediaPlayer.EVENT.PLAYING);
            },

            _toPaused: function() {
                this._state = MediaPlayer.STATE.PAUSED;
                this._emitEvent(MediaPlayer.EVENT.PAUSED);
            },

            _toComplete: function() {
                this._state = MediaPlayer.STATE.COMPLETE;
                this._emitEvent(MediaPlayer.EVENT.COMPLETE);
            },

            _toEmpty: function() {
                this._wipe();
                this._state = MediaPlayer.STATE.EMPTY;
            },

            _toError: function(errorMessage) {
                this._wipe();
                this._state = MediaPlayer.STATE.ERROR;
                this._reportError(errorMessage);
                throw 'ApiError: ' + errorMessage;
            },

            _isReadyToPlayFrom: function() {
                if (this._readyToPlayFrom !== undefined) {
                    return this._readyToPlayFrom;
                }
                return false;
            }
        });

        var instance = new Player();

        // Mixin this MediaPlayer implementation, so that device.getMediaPlayer() returns the correct implementation for the device
        Device.prototype.getMediaPlayer = function() {
            return instance;
        };

        return Player;
    }
);
