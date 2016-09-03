define(
    'antie/subtitles/errors/ttmlparseerror',
    [],
    function () {
        'use strict';

        /**
         * Error thrown when TTML subtitles file refuses to parse.
         *
         * @param {String} message Error message
         *
         * @class
         * @name antie.subtitles.errors.TtmlParseError
         * @extends Error
         */
        function TtmlParseError(message) {
            Error.call(this, message);  // Call base class's constructor

            // Oddly the constructor call above does not actually set message!?
            this.message = message;
        }

        //Inherit all the base class's methods
        TtmlParseError.prototype = Object.create(Error.prototype);

        return TtmlParseError;
    }
);
