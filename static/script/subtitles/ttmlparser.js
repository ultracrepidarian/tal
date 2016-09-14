define(
    'antie/subtitles/ttmlparser',
    [
        'antie/class',
        'antie/runtimecontext',
        'antie/subtitles/timedtext',
        'antie/subtitles/timedtextattributes',
        'antie/subtitles/timedtextbody',
        'antie/subtitles/timedtextelement',
        'antie/subtitles/timedtexthead',
        'antie/subtitles/timedtextregion',
        'antie/subtitles/timestamp',
        'antie/subtitles/ttmlnamespaces',
        'antie/subtitles/errors/ttmlparseerror'
    ],
    function(Class, RuntimeContext, TimedText, TimedTextAttributes, TimedTextBody, TimedTextElement, TimedTextHead, TimedTextRegion, Timestamp, TtmlNamespaces, TtmlParseError) {
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
                this._ttmlNamespaces = new TtmlNamespaces();
                this._timedTextAttributes = null;
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

                    return new Timestamp(timestampString, this._effectiveFrameRate);
                } else {
                    return null;
                }
            },

            /**
             * Parses all the attributes which take timestamps as a value.
             *
             * @param {NamedNodeMap} attributes
             *        An "array-like" collection of XML attributes to search through
             *
             * @param {antie.subtitles.TimedTextAttributes} timedTextAttributes
             */
            _parseTimestampAttributes: function(attributes, timedTextAttributes) {
                for (var i = 0; i < attributes.length; i++) {
                    var attribute = attributes[i];

                    // Timestamp values are not in any namespace
                    if (attribute && !attribute.namespaceURI) {
                        var name = attribute.localName || attribute .name;

                        switch (name) {

                        case 'begin':
                        case 'end':
                        case 'dur':
                            timedTextAttributes.setAttribute(name, this._parseTimestamp(attribute));
                            break;

                        default:
                            break;
                        }
                    }
                }
            },

            /**
             * @param {String} name
             *        The name of the attribute
             *
             * @param {String} value
             *        The value of the attribute
             *
             * @returns {?Number} positive integer if the parameter parses OK,
             *                    null if not
             */
            _parsePositiveParameterAttribute: function(name, value) {
                var matches = /^(\d+)$/.exec(value);
                if (matches) {
                    var intValue = parseInt(matches[1]);
                    if (intValue > 0) {
                        return intValue;
                    } else {
                        this._report(name + ' attribute should be positive, but was: ' + value);
                    }
                } else {
                    this._report(name + ' attribute should be a number, but was: ' + value);
                }
            },

            /**
             * @param {String} name
             *        The name of the attribute
             *
             * @param {String} value
             *        The value of the attribute
             */
            _parseTwoPositiveParameterAttribute: function(name, value) {
                var matches = /^\s*(\d+)\s+(\d+)\s*$/.exec(value);
                if (matches) {
                    var first = parseInt(matches[1]);
                    var second = parseInt(matches[2]);
                    if (first > 0 && second > 0) {
                        return [ first, second ];
                    } else {
                        this._report(name + 'attribute should be two positive numbers, but were: ' + value);
                    }
                } else {
                    this._report(name + ' attribute should be two numbers separated by a space, but was: ' + value);
                }
            },

            /**
             * @param {String} name
             *        The name of the attribute
             *
             * @param {String} value
             *        The value of the attribute
             *
             * @param {String[]} enumeration
             *        Array of valid values for this attribute
             *
             * @returns {?String} the value of the attribute, if valid,
             *                    null if not
             */
            _parseEnumeratedParameterAttribute: function(name, value, enumeration) {
                for (var i = 0; i < enumeration.length; i++) {
                    if (value === enumeration[i]) {
                        return value;
                    }
                }

                this._report(name + ' attribute should be one of "' + enumeration.join('","') + '" but was: "' + value + '"');
                return null;
            },

            /**
             * Parses all the attributes in the ttp namespace.
             *
             * @param {NamedNodeMap} attributes
             *        An "array-like" collection of XML attributes to search through
             *
             * @param {antie.subtitles.TimedTextAttributes} timedTextAttributes
             */
            _parseParameterAttributes: function(attributes, timedTextAttributes) {
                for (var i = 0; i < attributes.length; i++) {
                    var attribute = attributes[i];
                    var name = attribute.localName || attribute .name;
                    if (attribute && this._ttmlNamespaces.isCanonicalNamespace('ttp', attribute.namespaceURI)) {
                        var value;
                        var valueArray;

                        switch (name) {

                        case 'cellResolution':
                            valueArray = this._parseTwoPositiveParameterAttribute(name, attribute.value);
                            if (valueArray) {
                                value = {columns: valueArray[0], rows: valueArray[1]};
                            }
                            break;

                        case 'clockMode':
                            value = this._parseEnumeratedParameterAttribute(name, attribute.value, [ 'local', 'gps', 'utc' ]);
                            break;

                        case 'dropMode':
                            value = this._parseEnumeratedParameterAttribute(name, attribute.value, [ 'dropNTSC', 'dropPAL', 'nonDrop' ]);
                            break;

                        case 'frameRate':
                            value = this._parsePositiveParameterAttribute(name, attribute.value);
                            break;

                        case 'frameRateMultiplier':
                            valueArray = this._parseTwoPositiveParameterAttribute(name, attribute.value);
                            if (valueArray) {
                                value = {numerator: valueArray[0], denominator: valueArray[1]};
                            }
                            break;

                        case 'markerMode':
                            value = this._parseEnumeratedParameterAttribute(name, attribute.value, [ 'continuous', 'discontinuous' ]);
                            break;

                        case 'pixelAspectRatio':
                            valueArray = this._parseTwoPositiveParameterAttribute(name, attribute.value);
                            if (valueArray) {
                                value = {width: valueArray[0], height: valueArray[1]};
                            }
                            break;

                        case 'profile':
                            value = attribute.value;
                            break;

                        case 'subFrameRate':
                            value = this._parsePositiveParameterAttribute(name, attribute.value);
                            break;

                        case 'tickRate':
                            value = this._parsePositiveParameterAttribute(name, attribute.value);
                            break;

                        case 'timeBase':
                            value = this._parseEnumeratedParameterAttribute(name, attribute.value, [ 'media', 'smpte', 'clock' ]);
                            break;
                        }

                        if (value) {
                            timedTextAttributes.setAttribute(name, value);
                        }
                    }
                }
            },

            /**
             * @param {String} message
             *        The error to be reported
             * @private
             */
            _report: function(message) {
                var logger = RuntimeContext.getDevice().getLogger();
                logger.warn('TtmlParser - ' + message);
            },

            /**
             * @param {Element} ttmlElement
             * @param {antie.subtitles.TimedTextAttributes} timedTextAttributes
             * @private
             */
            _parseAttributes: function(ttmlElement, timedTextAttributes) {
                /**
                 * @type {NamedNodeMap}
                 */
                var attributes = ttmlElement.attributes;

                if (attributes) {
                    this._parseParameterAttributes(attributes, timedTextAttributes);
                    this._parseTimestampAttributes(attributes, timedTextAttributes);
                }
            },

            _parseStyling: function() {

            },

            _parseLayout: function() {

            },

            /**
            * Parses a TTML <head> tag.
             * @param {Element} ttmlHeadElement
             *        head tag extracted from an XMLDocument
             *
             * @returns {TimedTextHead} new instance parsed from ttmlHeadElement
             * @private
             */
            _parseHead: function(ttmlHeadElement) {
                /**
                 * "Array-like" object containing child nodes.
                 * @type {NodeList}
                 */
                var nodeList = ttmlHeadElement.childNodes;
                var styling;
                var layout;
                for (var i = 0; i < nodeList.length; i++) {
                    var element = nodeList[i];
                    if (element && this._ttmlNamespaces.isCanonicalNamespace('tt', element.namespaceURI)) {
                        switch (element.nodeName) {

                        case 'styling':
                            if (styling) {
                                this._report('More than one <styling> element in <head>');
                            } else {
                                styling = this._parseStyling(element);
                            }
                            break;

                        case 'layout':
                            if (styling) {
                                this._report('More than one <layout> element in <head>');
                            } else {
                                layout = this._parseLayout(element);
                            }
                            break;

                        default:
                            break;
                        }
                    }
                }

                var timedTextHead = new TimedTextHead(styling, layout);
                return timedTextHead;
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

                        } else if (element.nodeType === Node.ELEMENT_NODE && this._ttmlNamespaces.isCanonicalNamespace('tt', element.namespaceURI)) {
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

                this._timedTextAttributes = new TimedTextAttributes();
                this._parseAttributes(ttmlTtElement, this._timedTextAttributes);
                var frameRate = this._timedTextAttributes.getAttribute('frameRate');
                var framRateMultiplier = this._timedTextAttributes.getAttribute('frameRateMultiplier');
                this._effectiveFrameRate = frameRate * framRateMultiplier.numerator / framRateMultiplier.denominator;

                var children = ttmlTtElement.childNodes;
                var head = null;
                var body = null;
                if (children) {
                    for (var i = 0; i < children.length; i++) {
                        var element = children[i];
                        if (element && element.nodeType === Node.ELEMENT_NODE && element.nodeName) {
                            switch (element.nodeName) {

                            case 'head':
                                if (this._ttmlNamespaces.isCanonicalNamespace('tt', element.namespaceURI)) {
                                    if (head) {
                                        this._report('Duplicate <head> tag found in TTML');
                                    } else {
                                        head = this._parseHead(element);
                                    }
                                }
                                break;

                            case 'body':
                                if (this._ttmlNamespaces.isCanonicalNamespace('tt', element.namespaceURI)) {
                                    if (body) {
                                        this._report('Duplicate <body> tag found in TTML');
                                    } else {
                                        body = this._parseBody(element);
                                    }
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
                timedText.setAttributes(this._timedTextAttributes);
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
                } else if (!this._ttmlNamespaces.isCanonicalNamespace('tt', ttElement.namespaceURI)) {
                    throw new TtmlParseError('TTML document root element <tt> is not in a valid namespace - its namespace was: ' + ttElement.namespaceURI);
                }

                logger.debug('Found TTML root element <tt> in namespace ' + ttElement.lookupNamespaceURI(null));
                return this._parseTt(ttElement);
            }

        });

        return TtmlParser;
    }
);
