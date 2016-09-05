/**
 * @fileOverview The subtitles for a piece of content
 * @author ultracrepidarian
 */
define(
    'antie/subtitles/timedtext',
    [
        'antie/subtitles/timedtextelement',
        'antie/runtimecontext',
        'antie/subtitles/errors/ttmlparseerror',
        'antie/subtitles/timedtexthead',
        'antie/subtitles/timedtextbody'
    ],
    function (TimedTextElement, RuntimeContext, TtmlParseError, TimedTextHead, TimedTextBody) {
        'use strict';

        /**
         * The subtiles for a piece of content, parsed from a TTML file.
         *
         * @class
         * @name antie.subtitles.TimedText
         * @extends antie.Class
         */
        var TimedText = TimedTextElement.extend(/** @lends antie.subtitles.TimedText.prototype */ {
            /**
             * Constructs a new timed text instance from a TTML XML document.
             *
             * @param {XMLDocument} ttmlDoc The TTML source file parsed into an XML document
             * @constructor
             * @ignore
             */
            init: function (ttmlDoc) {

                var logger = RuntimeContext.getDevice().getLogger();

                if (!ttmlDoc) {
                    throw new TtmlParseError('TTML document is missing');
                } else if (!(ttmlDoc instanceof XMLDocument)) {
                    throw new TtmlParseError('TTML document is not a valid XML document (type=' + typeof ttmlDoc + ')');
                }

                var ttNode = ttmlDoc.documentElement;
                if (!ttNode || ttNode.nodeName !== 'tt') {
                    throw new TtmlParseError('TTML document root element is not <tt> - it was: ' + (ttNode && ('<' + ttNode.nodeName + '>')));
                }

                logger.debug('Found TTML root element <tt> in namespace ' + ttNode.lookupNamespaceURI(null));
                this._lang = ttNode.getAttributeNS(TimedTextElement.NAMESPACE.xml, 'lang');

                var headNodes = ttNode.getElementsByTagName('head');
                if (!headNodes || headNodes.length < 1) {
                    logger.debug('TTML document does not contain a <head> tag');
                } else {
                    logger.debug('Found TTML <head> element');
                    this._head = new TimedTextHead(headNodes[0]);
                }

                var bodyNodes = ttNode.getElementsByTagName('body');
                if (!bodyNodes || bodyNodes.length < 1) {
                    // TODO what do we do if theres more than one body
                    logger.debug('TTML document does not contain a <body> tag');
                } else {
                    logger.debug('Found TTML <body> element');
                    this._body = new TimedTextBody(bodyNodes[0]);
                }
            },

            /**
             * Returns the subtitle language.
             *
             * @returns {String} the subtitle language
             */
            getLang: function() {
                return this._lang;
            },

            /**
             * Cleans out this instance ready for garbage collection.  This
             * instance cannot be used after this.
             */
            destroy : function() {
                this._head.destroy();
                this._head = null;

                this._body.destroy();
                this._body = null;
            }
        });

        return TimedText;
    }
);
