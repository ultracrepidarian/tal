/**
 * @fileOverview Requirejs module containing samsung maple media wrapper
 *
 * @preserve Copyright (c) 2013 British Broadcasting Corporation
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

require.def(
    'antie/devices/media/samsung_streaming_player',
    [
        'antie/devices/device',
        'antie/widgets/media',
        'antie/events/mediaevent',
        'antie/events/mediaerrorevent',
        'antie/events/mediasourceerrorevent',
        'antie/mediasource'
    ],
    function(Device, Media, MediaEvent, MediaErrorEvent, MediaSourceErrorEvent, MediaSource) {

        var SamsungStreamingPlayer = Media.extend({

            PlayerEventCodes : {
            	CONNECTION_FAILED : 1,
            	AUTHENTICATION_FAILED : 2,
            	STREAM_NOT_FOUND : 3,
            	NETWORK_DISCONNECTED : 4,
            	NETWORK_SLOW : 5,
            	RENDER_ERROR : 6,
            	RENDERING_START : 7,
            	RENDERING_COMPLETE : 8,
            	STREAM_INFO_READY : 9,
            	DECODING_COMPLETE : 10,
            	BUFFERING_START : 11,
            	BUFFERING_COMPLETE : 12,
            	BUFFERING_PROGRESS : 13,
            	CURRENT_PLAYBACK_TIME : 14,
            	AD_START : 15,
            	AD_END : 16,
            	RESOLUTION_CHANGED : 17,
            	BITRATE_CHANGED : 18,
            	SUBTITLE : 19,
            	CUSTOM : 20
            },

            init: function(id, mediaType, logger) {
                this._super(id);

                this.logger = logger;
		        logger.info("Initialising Samsung Streaming Player");

                if (mediaType == "audio") {
                    this._mediaType = "audio";
                } else if (mediaType == "video") {
                    this._mediaType = "video";
                } else {
                    throw new Error('Unrecognised media type: ' + mediaType);
                }
                logger.info("Creating streaming player");
                this._initialisePlayerState();
                logger.info("Initialised streaming player");
                this._registerPlugins();
                logger.info("Registered plugins");
                this._registerEventHandlers();
                logger.info("Registered event handlers - " + this.sefPlugin.OnEvent);
            },

            _initialisePlayerState : function(){
                this.mediaSource = null;
                this.parameterizedMediaSourceUrl = null;
                this.videoPlayerState = {
                    durationSeconds  : 0,
                    currentTime: 0,
                    playbackRate: undefined,
                    paused: false,
                    ended: false,
                    seeking: false,
                    playing: false,
                    error : undefined
                };
            },

            _registerPlugins : function(){
                var self = this;
                this.sefPlugin = document.getElementById('sefPlugin');
                //this.sefPlugin.Open("StreamingPlayer", "1.0", "StreamingPlayer");
                //this.sefPlugin.Open("Player", "1.0", "Player");
                this.sefPlugin.Open('Player', '1.112', 'Player');

                this.audioPlugin = document.getElementById('audioPlugin');
                this.tvmwPlugin = document.getElementById('pluginObjectTVMW');

                this.originalSource = this.tvmwPlugin.GetSource();
                window.addEventListener('hide', function () {
                    self.stop();
                    self.tvmwPlugin.SetSource(self.originalSource);
                }, false);
            },

            _registerEventHandlers : function() {
                var self = this;
                this.sefPlugin.OnEvent = function(eventType, param1, param2) {
                    self.logger.info("Received event " + eventType);
		            if(eventType === self.PlayerEventCodes.BUFFERING_START || eventType === self.PlayerEventCodes.BUFFERING_PROGRESS) {
                        self._handleBuffering();
                    } else if(eventType === self.PlayerEventCodes.BUFFERING_COMPLETE) {
                        self._handlePlaying();
                    } else if(eventType === self.PlayerEventCodes.RENDERING_COMPLETE) {
                        self._handleRenderingComplete();
                    } else if(eventType === self.PlayerEventCodes.STREAM_INFO_READY)  {
                        self._handleStreamInfo();
                    } else if (eventType === self.PlayerEventCodes.CURRENT_PLAYBACK_TIME) {
                        self._handleTimeUpdate(param1);
                    } else if(eventType === self.PlayerEventCodes.CONNECTION_FAILED) {
                        self._handleError("Connection failed");
                    } else if(eventType === self.PlayerEventCodes.AUTHENTICATION_FAILED) {
                        self._handleError("Authentication failed");
                    } else if(eventType === self.PlayerEventCodes.RENDER_ERROR) {
                        self._handleError("Render error");
                    } else if(eventType === self.PlayerEventCodes.STREAM_NOT_FOUND) {
                        self._handleError("Stream not found");
                    }
                };
            },

            _handlePlaying : function() {
                this.bubbleEvent(new MediaEvent("playing", this));
            },

            _handleBuffering : function() {
                this.bubbleEvent(new MediaEvent("waiting", this));
            },

            _handleError : function(errorMsg) {
                this.videoPlayerState.error = errorMsg;
                this.bubbleEvent(new MediaErrorEvent(this, errorMsg));
            },

            _handleRenderingComplete : function() {
                this.videoPlayerState.ended = true;
                this.bubbleEvent(new MediaEvent("timeupdate", this));
                this.bubbleEvent(new MediaEvent("ended", this));
            },

            _handleStreamInfo : function() {
                this.videoPlayerState.durationSeconds = Math.floor(this.sefPlugin.Execute("GetDuration")/1000);
                this.bubbleEvent(new MediaEvent("loadedmetadata", this));
                this.bubbleEvent(new MediaEvent("durationchange", this));
                this.bubbleEvent(new MediaEvent("canplay", this));
                this.bubbleEvent(new MediaEvent("canplaythrough", this));
            },

            _handleTimeUpdate : function(timeMs) {
                var seconds = timeMs / 1000.0;
                if ((this.mediaSource.isLiveStream() && this.videoPlayerState.ended == false) ||
                    (seconds >= 0 && seconds < this.videoPlayerState.durationSeconds)) {
                    this.videoPlayerState.currentTime = seconds;
                    if (this.videoPlayerState.seeking) {
                        this.videoPlayerState.seeking = false;
                        this.bubbleEvent(new MediaEvent('seeked', this));
                    }
                    if (this.videoPlayerState.playing === false) {
                        this.bubbleEvent(new MediaEvent('play', this));
                        this.bubbleEvent(new MediaEvent('playing', this));
                        this.videoPlayerState.playing = true;
                    } else {
                        this.bubbleEvent(new MediaEvent("timeupdate", this));
                    }
                }
            },

            render: function(device) {
                if (!this.outputElement) {
                    this.outputElement = document.createElement("div");
                }
                return this.outputElement;
            },

            // (not part of HTML5 media)
            setWindow: function(left, top, width, height) {
                if (this._mediaType == "audio") {
                    throw new Error('Unable to set window size for Samsung audio.');
                }
                // check documentation to see if this is valid
                //this.sefPlugin.Execute("SetDisplayArea", left, top, width, height);
            },

            // readonly attribute MediaError error;
            getError: function() {

            },

            // Similar to src attribute or 'source' child elements:
            // attribute DOMString src;
            setSources: function(sources, tags) {
                this._initialisePlayerState();

                this.sefPlugin.Execute("Stop");
                this.tvmwPlugin.SetMediaSource();

                this.mediaSource = sources[0];
                this.parameterizedMediaSourceUrl = this.mediaSource.getURL(tags);
                if (this.mediaSource.isLiveStream()) {
                    //this.parameterizedMediaSourceUrl += "|BBCSLIDING|COMPONENT=HLS";
                    this.parameterizedMediaSourceUrl += "|COMPONENT=HLS";
                }
		this.logger.info("URL is " + this.parameterizedMediaSourceUrl);
            },
            getSources: function() {
                return [this.mediaSource];
            },
            // readonly attribute DOMString currentSrc;
            getCurrentSource: function() {
                return this.mediaSource.src;
            },
            /*
             const unsigned short NETWORK_EMPTY = 0;
             const unsigned short NETWORK_IDLE = 1;
             const unsigned short NETWORK_LOADING = 2;
             const unsigned short NETWORK_NO_SOURCE = 3;
             readonly attribute unsigned short networkState;
             */
            getNetworkState: function() {},

            // attribute DOMString preload;
            // @returns "none", "metadata" or "auto"
            getPreload: function() {
                return "none";
            },

            setPreload: function(preload) {
            },

            // readonly attribute TimeRanges buffered;
            getBuffered: function() {
                return [];
            },

            // void load();
            load: function() {
                this.videoPlayerState.playbackRate = 1;
                this.videoPlayerState.paused = false;
                this.videoPlayerState.ended = false;
                this.videoPlayerState.playing = false;

		        this.logger.info("Load called on player");
                this.logger.info("Sef plugin: " + this.sefPlugin);
                var result = false;
                result = this.sefPlugin.Execute("InitPlayer", this.parameterizedMediaSourceUrl);
                this.logger.info("Init player called - result = " + (result || "<undefined>"));
                result = this.sefPlugin.Execute("SetTotalBufferSize", 32 *1024*1024);
                this.logger.info("Set total buffer size called - result = " + (result || "<undefined>"));
                result = this.sefPlugin.Execute("SetInitialBufferSize", 32 *1024*1024);
                this.logger.info("Set initial buffer size called - result = " + result || "<undefined>");
                result = this.sefPlugin.Execute("SetPendingBuffer", 32 *1024*1024);
                this.logger.info("Set pending buffer called - result = " + (result || "<undefined>"));
                result = this.sefPlugin.Execute("StartPlayback");
		        this.logger.info("Start playback called - result = " + (result || "<undefined>"));
            },

            // DOMString canPlayType(in DOMString type);
            canPlayType: function(type) {
                return true;
            },
            /*
             const unsigned short HAVE_NOTHING = 0;
             const unsigned short HAVE_METADATA = 1;
             const unsigned short HAVE_CURRENT_DATA = 2;
             const unsigned short HAVE_FUTURE_DATA = 3;
             const unsigned short HAVE_ENOUGH_DATA = 4;
             readonly attribute unsigned short readyState;
             */
            getReadyState: function() {
                return 0;
            },
            // readonly attribute boolean seeking;
            getSeeking: function() {
                return this.videoPlayerState.seeking;
            },
            // attribute double currentTime;
            setCurrentTime: function(timeToSeekTo) {
                var offsetInSeconds = timeToSeekTo - this.videoPlayerState.currentTime;
                if (offsetInSeconds > 0) {
                    this.sefPlugin.Execute("JumpForward", offsetInSeconds);
                } else if (offsetInSeconds < 0) {
                    this.sefPlugin.Execute("JumpBackward", (Math.abs(offsetInSeconds)));
                }
                this.videoPlayerState.seeking = true;
                this.bubbleEvent(new MediaEvent('seeking', this));
                this.videoPlayerState.currentTime = timeToSeekTo;
            },
            getCurrentTime: function() {
                return this.videoPlayerState.currentTime;
            },
            // readonly attribute double initialTime;
            getInitialTime: function() {
                return 0;
            },
            // readonly attribute double duration;
            getDuration: function() {
                return this.videoPlayerState.durationSeconds;
            },
            // readonly attribute Date startOffsetTime;
            getStartOffsetTime: function() {
                return 0;
            },
            // readonly attribute boolean paused;
            getPaused: function() {
                return this.videoPlayerState.paused;
            },
            // attribute double defaultPlaybackRate;
            getDefaultPlaybackRate: function() {
                return 1;
            },
            // attribute double playbackRate;
            getPlaybackRate: function() {
                return 1;
            },
            setPlaybackRate: function(playbackRate) {

            },
            // readonly attribute TimeRanges played;
            getPlayed: function() {
                return [];
            },
            // readonly attribute TimeRanges seekable;
            getSeekable: function() {
                return [];
            },
            // readonly attribute boolean ended;
            getEnded: function() {
                return false;
            },
            // attribute boolean autoplay;
            getAutoPlay: function() {
                return false;
            },
            setAutoPlay: function(autoplay) {

            },
            // attribute boolean loop;
            getLoop: function() {
                return false;
            },
            setLoop: function(loop) {

            },
            // void play();
            play: function() {
                if (this.videoPlayerState.paused) {
                    this.sefPlugin.Execute("Resume");
                    this.videoPlayerState.paused = false;
                    var self = this;
                    window.setTimeout(function() {
                        self.bubbleEvent(new MediaEvent("play", self));
                        self.bubbleEvent(new MediaEvent("playing", self));
                    }, 0);
                }
            },
            stop: function() {
                this.sefPlugin.Execute("Stop");
            },
            // void pause();
            pause: function() {
                var self = this;
                this.sefPlugin.Execute("Pause");
                this.videoPlayerState.paused = true;
                window.setTimeout(function() {
                    self.bubbleEvent(new MediaEvent("pause", self))
                }, 0);
            },
            // attribute boolean controls;
            setNativeControls: function(controls) {

            },
            getNativeControls: function() {
                return false;
            },
            destroy: function() {
                this.stop();
            }
        });

        Device.prototype.createPlayer = function(id, mediaType) {
            this.getLogger().info("Creating player");
            return new SamsungStreamingPlayer(id, mediaType, this.getLogger());
        };

        Device.prototype.getPlayerEmbedMode = function(mediaType) {
            return Media.EMBED_MODE_BACKGROUND;
        };

        function audioLevelCorrection(t) {
            return t * 40.0;
        };

        function invertAudioLevelCorrection(x) {
            return x / 40.0;
        };

         /**
         * Check to see if volume control is supported on this device.
         * @returns Boolean true if volume control is supported.
         */
        Device.prototype.isVolumeControlSupported = function() {
            return true;
        };
        /**
         * Get the current volume.
         * @returns The current volume (0.0 to 1.0)
         */
        Device.prototype.getVolume = function() {
            var audio = document.getElementById('audioPlugin');
            return invertAudioLevelCorrection(audio.GetVolume());
        };
        /**
         * Set the current volume.
         * @param {Float} volume The new volume level (0.0 to 1.0).
         */
        Device.prototype.setVolume = function(volume) {
            var audio = document.getElementById('audioPlugin');
            if (volume > 1.0) {
                this.getLogger().warn("Samsung setVolume - Invalid volume specified (" + volume + " > 1.0). Clipped to 1.0");
                volume = 1.0;
            } else if (volume < 0.0) {
                this.getLogger().warn("Samsung setVolume - Invalid volume specified (" + volume + " < 0.0). Clipped to 0.0");
                volume = 0;
            }

            var currentVolume = audio.GetVolume();
            var newVolume = audioLevelCorrection(volume);

            if ((newVolume > currentVolume) && (newVolume - currentVolume < 1.0)) {
                newVolume = currentVolume + 1;
            } else if ((newVolume < currentVolume) && (currentVolume - newVolume < 1.0)) {
                newVolume = currentVolume - 1;
            }
            audio.SetVolume(newVolume);
            return newVolume;
        };
        /**
         * Check to see if the volume is currently muted.
         * @returns Boolean true if the device is currently muted. Otherwise false.
         */
        Device.prototype.getMuted = function() {
            var audio = document.getElementById('audioPlugin');
            return audio.GetSystemMute();
        };
        /**
         * Mute or unmute the device.
         * @param {Boolean} muted The new muted state. Boolean true to mute, false to unmute.
         */
        Device.prototype.setMuted = function(muted) {
            var audio = document.getElementById('audioPlugin');
            audio.SetSystemMute(muted);
        };
    }
);
