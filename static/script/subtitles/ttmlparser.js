define(
    'antie/subtitles/ttmlparser',
    [
        'antie/class',
        'antie/runtimecontext',
        'antie/subtitles/timedtext',
        'antie/subtitles/timedtextbody',
        'antie/subtitles/timedtextelement',
        'antie/subtitles/timedtexthead',
        'antie/subtitles/timedtextregion',
        'antie/subtitles/timestamp',
        'antie/subtitles/errors/ttmlparseerror'
    ],
    function(Class, RuntimeContext, TimedText, TimedTextBody, TimedTextElement, TimedTextHead, TimedTextRegion, Timestamp, TtmlParseError) {
        'use strict';

        /**
         * Parses TTML.
         *
         * @class
         * @name antie.subtitles.TtmlParser
         * @extends antie.Class
         */
        var TtmlParser = Class.extend(/** @lends antie.subtitles.TtmlParser.prototype */ {

            /**
             * Constructs a new parser instance.
             *
             * @constructor
             */
            init: function() {

            },

            /**
             * Parses a timestamp type attribute.
             *
             * @param {Attr} timestampAttribute
             *        The XML attribute to be parsed
             *
             * @returns {antie.subtitles.Timestamp} the parsed timestamp
             * @private
             */
            _parseTimestamp: function(timestampAttribute) {
                if (timestampAttribute) {
                    var timestampString = timestampAttribute.value;
                    if (typeof timestampString !== 'string') {
                        throw new Error('TtmlParser._parseTimestamp timestampString is not a string, it is ' + typeof timestampString + ': ' + timestampString);
                    }

                    return new Timestamp(timestampString);
                } else {
                    return null;
                }
            },

            /**
             *
             */
            _parseAttributes: function(ttmlElement, timedTextAttributes) {
                /**
                 * @type {NamedNodeMap}
                 */
                var attributes = ttmlElement.attributes;

                if (attributes) {
                    if (attributes.getNamedItem('begin')) {
                        timedTextAttributes.setAttribute('begin', this._parseTimestamp(attributes.getNamedItem('begin')));
                    }
                    if (attributes.getNamedItem('end')) {
                        timedTextAttributes.setAttribute('end', this._parseTimestamp(attributes.getNamedItem('end')));
                    }
                    if (attributes.getNamedItem('dur')) {
                        timedTextAttributes.setAttribute('dur', this._parseTimestamp(attributes.getNamedItem('dur')));
                    }
                }
            },

            /**
             * TODO Implement
             * @private
             */
            _parseHead: function() {
                return new TimedTextHead();
            },

            /**
            * Parses a TTML <body> tag.
             * @param {Element} ttmlBodyElement
             *        body tag extracted from an XMLDocument
             *
             * @returns {TimedTextBody} new instance parsed from ttmlBodyElement
             * @private
             */
            _parseBody: function (ttmlBodyElement) {
                var timedTextBody = new TimedTextBody(this._parseMixedContent(ttmlBodyElement.childNodes));
                this._parseAttributes(ttmlBodyElement, timedTextBody.getAttributes());
                return timedTextBody;
            },

            /**
             * Parses a TTML <div> tag.
             * @param {Element} ttmlDivElement
             *        div tag extracted from an XMLDocument
             *
             * @returns {TimedTextElement} new instance parsed from ttmlDivElement
             * @private
             */
            _parseDiv: function (ttmlDivElement) {
                var timedTextElement = new TimedTextElement(TimedTextElement.NODE_NAME.div, this._parseMixedContent(ttmlDivElement.childNodes));
                this._parseAttributes(ttmlDivElement, timedTextElement.getAttributes());
                return timedTextElement;
            },

            /**
             * Parses a TTML <p> tag.
             * @param {Element} ttmlPElement
             *        div tag extracted from an XMLDocument
             *
             * @returns {TimedTextElement} new instance parsed from ttmlPElement
             * @private
             */
            _parseParagraph: function (ttmlPElement) {
                var timedTextElement = new TimedTextElement(TimedTextElement.NODE_NAME.p, this._parseMixedContent(ttmlPElement.childNodes));
                this._parseAttributes(ttmlPElement, timedTextElement.getAttributes());
                return timedTextElement;
            },

            /**
             * Parses a TTML <span> tag.
             * @param {Element} ttmlSpanElement
             *        span tag extracted from an XMLDocument
             *
             * @returns {TimedTextElement} new instance parsed from ttmlSpanElement
             * @private
             */
            _parseSpan: function (ttmlSpanElement) {
                var timedTextElement = new TimedTextElement(TimedTextElement.NODE_NAME.span, this._parseMixedContent(ttmlSpanElement.childNodes));
                this._parseAttributes(ttmlSpanElement, timedTextElement.getAttributes());
                return timedTextElement;
            },

            /**
             * Parses a TTML <br> tag.
             * @returns {TimedTextElement} new instance
             * @private
             */
            _parseLinebreak: function () {
                return new TimedTextElement(TimedTextElement.NODE_NAME.br);
            },

            /**
             * Parses a TTML text element.
             * @param {Element} xmlTextElement
             *        span tag extracted from an XMLDocument
             *
             * @returns {TimedTextElement} new instance
             * @private
             */
            _parseText: function (xmlTextElement) {
                var textElement = new TimedTextElement(TimedTextElement.NODE_NAME.text);
                textElement.setText(xmlTextElement.textContent);
                return textElement;
            },

            /**
             * Parses the XML "mixed content" common to many elements.
             *
             * @example <![CDATA[
             *   <div>
             *     <div>
             *       <p begin="00:00:03" end="00:00:06">Bessie: <span tts:fontStyle="italic">Winston,</span><br/><span tts:fontStyle="italic">you're drunk!</span></p>
             *     </div>
             *   </div>
             * ]]>
             *
             * @param {NodeList} nodeList
             *        An "array-like" object containing an XML element's children
             *
             * @returns {TimedTextElement[]} Array of elements parsed from nodeList
             * @private
             */
            _parseMixedContent: function(nodeList) {

                if (!nodeList) {
                    return;
                }

                var children = [];
                for (var i = 0; i < nodeList.length; i++) {
                    var element = nodeList[i];
                    if (element && element.nodeType) {
                        if (element.nodeType === Node.TEXT_NODE) {
                            children.push(this._parseText(element));

                        } else if (element.nodeType === Node.ELEMENT_NODE) {
                            switch (element.nodeName) {

                            case 'div':
                                children.push(this._parseDiv(element));
                                break;

                            case 'p':
                                children.push(this._parseParagraph(element));
                                break;

                            case 'span':
                                children.push(this._parseSpan(element));
                                break;

                            case 'br':
                                children.push(this._parseLinebreak(element));
                                break;

                            default:
                                break;

                            }
                        }
                    }
                }

                return children;
            },

            /**
             * Parses a TTML <tt> tag.
             * @param {Element} ttmlTtElement
             *        tt tag extracted from an XMLDocument
             *
             * @returns {TimedTextElement} new instance parsed from ttmlTtElement
             * @private
             */
            _parseTt: function (ttmlTtElement) {
                // var lang = ttmlTtElement.getAttributeNS(TimedTextElement.NAMESPACE.xml, 'lang');

                var children = ttmlTtElement.childNodes;
                var head = null;
                var body = null;
                if (children) {
                    for (var i = 0; i < children.length; i++) {
                        var element = children[i];
                        if (element && element.nodeType === Node.ELEMENT_NODE && element.nodeName) {
                            switch (element.nodeName) {

                            case 'head':
                                if (head) {
                                    this._report('Duplicate <head> tag found in TTML');
                                } else {
                                    head = this._parseHead(element);
                                }
                                break;

                            case 'body':
                                if (body) {
                                    this._report('Duplicate <body> tag found in TTML');
                                } else {
                                    body = this._parseBody(element);
                                }
                                break;

                            default:
                                this.report('Unrecognised tag <' + element.nodeName + '> in TTML');
                                break;

                            }
                        }
                    }
                }

                var timedText = new TimedText(head, body);
                this._parseAttributes(ttmlTtElement, timedText.getAttributes());
                timedText.initialiseActiveElements();
                return timedText;
            },

            /**
             * Returns a new timed text instance parsed from a TTML XML document.
             *
             * @param {XMLDocument} ttmlDoc The TTML source file parsed into an XML document
             * @returns {TimedText} new timed text instance parsed from ttmlDoc
             */
            parse: function (ttmlDoc) {

                var logger = RuntimeContext.getDevice().getLogger();

                if (!ttmlDoc) {
                    throw new TtmlParseError('TTML document is missing');
                } else if (!(ttmlDoc instanceof XMLDocument)) {
                    throw new TtmlParseError('TTML document is not a valid XML document (type=' + typeof ttmlDoc + ')');
                }

                var ttElement = ttmlDoc.documentElement;
                if (!ttElement || ttElement.nodeName !== 'tt') {
                    throw new TtmlParseError('TTML document root element is not <tt> - it was: ' + (ttElement && ('<' + ttElement.nodeName + '>')));
                }

                logger.debug('Found TTML root element <tt> in namespace ' + ttElement.lookupNamespaceURI(null));
                return this._parseTt(ttElement);
            }

        });

        return TtmlParser;
    }
);
