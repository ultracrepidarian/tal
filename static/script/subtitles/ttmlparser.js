define(
    'antie/subtitles/ttmlparser',
    [
        'antie/class',
        'antie/runtimecontext',
        'antie/subtitles/attributedefaultsfactory',
        'antie/subtitles/attributetransformer',
        'antie/subtitles/attributetransformercss3',
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
    function(Class, RuntimeContext, AttributeDefaultsFactory, AttributeTransformer, AttributeTransformerCss3, TimedText, TimedTextAttributes, TimedTextBody, TimedTextElement, TimedTextHead, TimedTextRegion, Timestamp, TtmlNamespaces, TtmlParseError) {
        'use strict';

        /**
         * Private class containing xml:id values collected during parsing.
         *
         * @param {Function} report
         *        Error reporting function
         *
         * @class
         * @name antie.subtitles.TtmlParser._IdReferences
         * @extends antie.Class
         * @private
         */
        var _IdReferences = Class.extend(/** @lends antie.subtitles.TtmlParser._IdReferences.prototype */{
            /**
             * @constructor
             * @ignore
             */
            init: function(report) {
                this._report = report;
                this._references = {};
            },

            /**
             * @param {String} id
             *        The xml:id
             *
             * @param {antie.subtitles.TimedTextElement} element
             *        The parsed object the xml:id refers to
             */
            setReference: function(id, element) {
                if (typeof element !== 'object' || !(element instanceof TimedTextElement)) {
                    throw new Error('setReference: element should be of type antie.subtitles.TimedTextElement, but was ' + typeof element + ': ' + element);
                }

                if (this._references.hasOwnProperty(id)) {
                    this._report('duplicate id: ' + id);
                } else {
                    this._references[id] = element;
                }
            },


            /**
             * Returns a {@link antie.subtitles.TimedTextElement} given its xml:id.
             *
             * @param {String} id
             *        The xml:id being referenced
             *
             * @returns {antie.subtitles.TimedTextElement} the parsed object the xml:id refers to
             */
            getReference: function(id) {
                return this._references[id];
            }
        });

        /**
         * Parses TTML.
         *
         * @param {antie.subtitles.AttributeTransformer} [attributeTransformer]
         *        Optionally specify an attribute transformer. If none is specified a
         *        new CSS3 transformer will be used.
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
             * @ignore
             */
            init: function(attributeTransformer) {
                if (attributeTransformer) {
                    if (typeof attributeTransformer === 'object' && attributeTransformer instanceof AttributeTransformer) {
                        this._attributeTransformer = attributeTransformer;
                    } else {
                        throw new Error('attributeTransformer should be an antie.subtitles.AttributeTransformer but was ' + typeof attributeTransformer + ': ' + attributeTransformer);
                    }
                } else {
                    this._attributeTransformer = new AttributeTransformerCss3(this._report);
                }
                this._attributeDefaultsFactory = new AttributeDefaultsFactory(this._attributeTransformer);

                this._ttmlNamespaces = new TtmlNamespaces();
                this._styleReferences = null;
                this._regionReferences = null;

                // Set a default effective framerate, just in case we wind up parsing timestamp
                // attributes in the <tt> tag, before the framerate itself has been parsed.
                // There shouldn't be any, but we cannot depend upon it.
                this._effectiveFrameRate = 30;
            },

            /**
             * @returns {antie.subtitles.AttributeDefaultsFactory} the AttributeDefaultsFactory used to set defaults
             * @public
             */
            getAttributeDefaultsFactory: function() {
                return this._attributeDefaultsFactory;
            },

            /**
             * Parses a timestamp type attribute.
             *
             * @param {String} name
             *        The attribute's name
             *
             * @param {Attr} timestampAttribute
             *        The XML attribute to be parsed
             *
             * @returns {antie.subtitles.Timestamp} the parsed timestamp
             * @private
             */
            _parseTimestamp: function(name, timestampAttribute) {
                if (timestampAttribute) {
                    var timestampString = timestampAttribute.value;
                    if (typeof timestampString !== 'string') {
                        this._report('TtmlParser._parseTimestamp timestampString is not a string, it is ' + typeof timestampString + ': ' + timestampString);
                        return null;
                    }

                    return new Timestamp(timestampString, this._effectiveFrameRate);
                } else {
                    return null;
                }
            },

            /**
             * Parses all the attributes which are not in any namespace.
             *
             * @param {NamedNodeMap} attributes
             *        An "array-like" collection of XML attributes to search through
             *
             * @param {antie.subtitles.TimedTextAttributes} timedTextAttributes
             * @private
             */
            _parseUnqualifiedAttributes: function(attributes, timedTextAttributes) {
                for (var i = 0; i < attributes.length; i++) {
                    var attribute = attributes[i];

                    if (attribute && !attribute.namespaceURI) {
                        var name = attribute.localName || attribute .name;
                        var value = null;

                        switch (name) {

                        case 'begin':
                        case 'end':
                        case 'dur':
                            value = this._parseTimestamp(name, attribute);
                            break;

                        case 'timeContainer':
                            value = this._attributeTransformer.transform(name, attribute.value, [ 'par', 'seq' ]);
                            break;

                        case 'style':
                            value = this._parseIdReferenceListAttribute(name, attribute.value, this._styleReferences);
                            break;

                        case 'region':
                            value = this._parseIdReferenceAttribute(name, attribute.value, this._regionReferences);
                            break;

                        default:
                            break;
                        }

                        if (value) {
                            timedTextAttributes.setAttribute(name, value);
                        }
                    }
                }
            },

            /**
             * @param {String} name
             *        The name of the attribute
             *
             * @param {String} value
             *        The value of the attribute - should be a single reference to a previously defined xml:id
             *
             * @param {antie.subtitles.TtmlParser._IdReferences} references
             *        References to xml:id parsed from the document so far
             *
             * @returns {?TimedTextElement[]} the element(s) referenced by value,
             *                                or null if there are none
             * @private
             */
            _parseIdReferenceAttribute: function(name, value, references) {
                if (/^\s*$/.test(value)) {
                    this._report(name + ' attribute is empty: ' + value);
                    return null;
                }

                var ref = references.getReference(value);
                if (ref) {
                    return ref;
                }

                // TODO Is this good enough, or should we be able to reference tags further down the document too?
                this._report(name + ' attribute references xml:id "' + value + '" but this does not exist in any earlier tag');
                return null;
            },

            /**
             * @param {String} name
             *        The name of the attribute
             *
             * @param {String} value
             *        The value of the attribute - should be a comma separated list of references to previously defined xml:ids
             *
             * @param {antie.subtitles.TtmlParser._IdReferences} references
             *        References to xml:id parsed from the document so far
             *
             * @returns {?TimedTextElement[]} the element(s) referenced by value,
             *                                or null if there are none
             * @private
             */
            _parseIdReferenceListAttribute: function(name, value, references) {
                var refNames = value.split(/\s+/);
                if (refNames.length === 0) {
                    this._report(name + ' attribute is empty: ' + value);
                    return null;
                }

                var refs = [];
                for (var i = 0; i < refNames.length; i++) {
                    if (refNames[i]) {
                        var ref = references.getReference(refNames[i]);
                        if (ref) {
                            refs.push(ref);
                        } else {
                            // TODO Is this good enough, or should we be able to reference tags further down the document too?
                            this._report(name + ' attribute references xml:id "' + refNames[i] + '" but this does not exist in any earlier tag');
                        }
                    }
                }

                return refs.length > 0 ? refs : null;
            },

            /**
             * Parses all the attributes in the xml namespace.
             *
             * @param {NamedNodeMap} attributes
             *        An "array-like" collection of XML attributes to search through
             *
             * @param {antie.subtitles.TimedTextAttributes} timedTextAttributes
             *        the attributes object that should receive the parsed attributes
             */
            _parseXmlAttributes: function(attributes, timedTextAttributes) {
                for (var i = 0; i < attributes.length; i++) {
                    var attribute = attributes[i];
                    var name = attribute.localName || attribute .name;
                    if (this._ttmlNamespaces.isCanonicalNamespace('xml', attribute.namespaceURI)) {
                        var value;

                        switch (name) {

                        case 'id':
                        case 'lang':
                        case 'space':
                            value = this._attributeTransformer.transform(name, attribute.value);
                            break;

                        default:
                            value = null;
                            break;
                        }

                        if (value) {
                            timedTextAttributes.setAttribute(name, value);
                        }
                    }
                }
            },

            /**
             * Parses a TTML colour value into a CSS3 equivalent.
             *
             * @param {String} value
             *        the colour value to be parsed
             * @private
             */
            _parseColour: function(value) {
                if (typeof value !== 'string') {
                    return null;
                }

                if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                    // 6 digit hex colour
                    return value;
                } else if (/^#[0-9a-fA-F]{8}$/.test(value)) {
                    // 8 digit hex colour+opacity
                    var result = 'rgba(';
                    for (var i = 0; i < 3; i++) {
                        var index = 2 * i + 1;
                        result += parseInt(value.substring(index, index + 2), 16) + ',';
                    }
                    result += (parseInt(value.substring(7, 9), 16) / 255).toFixed(2);  // Convert to CSS3 opacity, e.g. 'FF' to '1.00'
                    return result + ')';
                } else if (/^rgb\(\d+,\d+,\d+\)$/.test(value)) {
                    // rgb() colour
                    return value;
                }  else if (/^rgba\(\d+,\d+,\d+,\d+\)$/.test(value)) {
                    // rgba() color and opacity (but opacity ranges between 0 and 255, not 0.0 and 1.0)
                    return value.replace(/,(\d+)\)/, function(match, p1) {
                        return ',' + (p1 / 255).toFixed(2) + ')';  // Convert to CSS3 opacity, e.g. '255' to '1.00'
                    });
                } else if (value.toLowerCase() === 'transparent') {
                    return 'rgba(0,0,0,0.0)';       // Munge this while 'transparent' has no CSS support
                } else if (/^[a-zA-Z]+$/.test(value)) {
                    // Named colour?
                    return value;
                } else {
                    return null;
                }
            },

            /**
             * Parses all the attributes in the tts namespace.
             *
             * @param {NamedNodeMap} attributes
             *        An "array-like" collection of XML attributes to search through
             *
             * @param {antie.subtitles.TimedTextAttributes} timedTextAttributes
             *        the attributes object that should receive the parsed attributes
             */
            _parseStyleAttributes: function(attributes, timedTextAttributes) {
                for (var i = 0; i < attributes.length; i++) {
                    var attribute = attributes[i];
                    var name = attribute.localName || attribute .name;
                    if (attribute && this._ttmlNamespaces.isCanonicalNamespace('tts', attribute.namespaceURI)) {
                        var value = null;

                        switch (name) {

                        case 'backgroundColor':
                        case 'color':
                        case 'direction':
                        case 'display':
                        case 'displayAlign':
                        case 'extent':
                        case 'fontFamily':
                        case 'fontSize':
                        case 'fontStyle':
                        case 'fontWeight':
                        case 'lineHeight':
                        case 'opacity':
                        case 'origin':
                        case 'overflow':
                        case 'padding':
                        case 'showBackground':
                        case 'textAlign':
                        case 'textDecoration':
                        case 'textOutline':
                        case 'unicodeBidi':
                        case 'visibility':
                        case 'wrapOption':
                        case 'writingMode':
                        case 'zIndex':
                            value = this._attributeTransformer.transform(name, attribute.value);
                            break;

                        default:
                            break;

                        }

                        if (value || value === 0) {
                            timedTextAttributes.setAttribute(name, value);
                        }
                    }
                }
            },

            /**
             * Parses all the attributes in the ttp namespace.
             *
             * @param {NamedNodeMap} attributes
             *        An "array-like" collection of XML attributes to search through
             *
             * @param {antie.subtitles.TimedTextAttributes} timedTextAttributes
             *        the attributes object that should receive the parsed attributes
             */
            _parseParameterAttributes: function(attributes, timedTextAttributes) {
                for (var i = 0; i < attributes.length; i++) {
                    var attribute = attributes[i];
                    var name = attribute.localName || attribute .name;
                    if (attribute && this._ttmlNamespaces.isCanonicalNamespace('ttp', attribute.namespaceURI)) {
                        var value;

                        switch (name) {

                        case 'cellResolution':
                        case 'clockMode':
                        case 'dropMode':
                        case 'frameRate':
                        case 'frameRateMultiplier':
                        case 'markerMode':
                        case 'pixelAspectRatio':
                        case 'profile':
                        case 'subFrameRate':
                        case 'tickRate':
                        case 'timeBase':
                            value = this._attributeTransformer.transform(name, attribute.value);
                            break;

                        default:
                            value = null;
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
             *        the attributes object that should receive the parsed attributes
             * @private
             */
            _parseAttributes: function(ttmlElement, timedTextAttributes) {
                /**
                 * @type {NamedNodeMap}
                 */
                var attributes = ttmlElement.attributes;

                if (attributes) {
                    this._parseParameterAttributes(attributes, timedTextAttributes);
                    this._parseStyleAttributes(attributes, timedTextAttributes);
                    this._parseUnqualifiedAttributes(attributes, timedTextAttributes);
                    this._parseXmlAttributes(attributes, timedTextAttributes);
                }
            },

            /**
             * Parses a TTML <styling> tag.
             *
             * @param {Element} ttmlStyleElement
             *        styling tag extracted from an XMLDocument
             *
             * @param {Boolean} [retainIds=false]
             *        If true then the style's xml:id should be saved, i.e. this
             *        style element is part of the styling section in head where
             *        styles are held if they are to be referenced by other tags.
             *
             * @returns {antie.subtitles.TimedTextElement} new instance parsed from ttmlHeadElement
             * @private
             */
            _parseStyle: function(ttmlStyleElement, retainIds) {
                var timedTextElement = new TimedTextElement(TimedTextElement.NODE_NAME.style);
                this._parseAttributes(ttmlStyleElement, timedTextElement.getAttributes());

                if (retainIds) {
                    var id = timedTextElement.getAttribute('id');
                    if (id) {
                        this._styleReferences.setReference(id, timedTextElement);
                    }
                }

                return timedTextElement;
            },

            /**
             * Parses a TTML <styling> tag.
             *
             * @param {Element} ttmlStylingElement
             *        styling tag extracted from an XMLDocument
             *
             * @returns {antie.subtitles.TimedTextElement} new instance parsed from ttmlStylingElement
             * @private
             */
            _parseStyling: function(ttmlStylingElement) {
                var nodeList = ttmlStylingElement.childNodes;
                var children = [];

                for (var i = 0; i < nodeList.length; i++) {
                    var element = nodeList[i];
                    if (element && this._ttmlNamespaces.isCanonicalNamespace('tt', element.namespaceURI)) {
                        switch (element.nodeName) {

                        case 'style':
                            children.push(this._parseStyle(element, true));
                            break;

                        default:
                            break;
                        }
                    }
                }

                var timedTextElement = new TimedTextElement(TimedTextElement.NODE_NAME.styling, children);
                this._parseAttributes(ttmlStylingElement, timedTextElement.getAttributes());
                return timedTextElement;
            },

            /**
             * Parses a TTML <region> tag.
             *
             * @param {Element} ttmlRegionElement
             *        region tag extracted from an XMLDocument
             *
             * @returns {antie.subtitles.TimedTextElement} new instance parsed from ttmlRegionElement
             * @private
             */
            _parseRegion: function(ttmlRegionElement) {
                var nodeList = ttmlRegionElement.childNodes;
                var children = [];

                for (var i = 0; i < nodeList.length; i++) {
                    var element = nodeList[i];
                    if (element && this._ttmlNamespaces.isCanonicalNamespace('tt', element.namespaceURI)) {
                        switch (element.nodeName) {

                        case 'style':
                            children.push(this._parseStyle(element));
                            break;

                        default:
                            break;
                        }
                    }
                }

                var timedTextElement = new TimedTextElement(TimedTextElement.NODE_NAME.region, children);
                this._parseAttributes(ttmlRegionElement, timedTextElement.getAttributes());

                var id = timedTextElement.getAttribute('id');
                if (id) {
                    this._regionReferences.setReference(id, timedTextElement);
                }

                return timedTextElement;
            },

            /**
             * Parses a TTML <layout> tag.
             *
             * @param {Element} ttmlLayoutElement
             *        layout tag extracted from an XMLDocument
             *
             * @returns {antie.subtitles.TimedTextElement} new instance parsed from ttmlLayoutElement
             * @private
             */
            _parseLayout: function(ttmlLayoutElement) {
                var nodeList = ttmlLayoutElement.childNodes;
                var children = [];

                for (var i = 0; i < nodeList.length; i++) {
                    var element = nodeList[i];
                    if (element && this._ttmlNamespaces.isCanonicalNamespace('tt', element.namespaceURI)) {
                        switch (element.nodeName) {

                        case 'region':
                            children.push(this._parseRegion(element));
                            break;

                        default:
                            break;
                        }
                    }
                }

                var timedTextElement = new TimedTextElement(TimedTextElement.NODE_NAME.layout, children);
                this._parseAttributes(ttmlLayoutElement, timedTextElement.getAttributes());
                return timedTextElement;
            },

            /**
             * Parses a TTML <head> tag.
             * @param {Element} ttmlHeadElement
             *        head tag extracted from an XMLDocument
             *
             * @returns {antie.subtitles.TimedTextHead} new instance parsed from ttmlHeadElement
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
                            if (layout) {
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
                this._parseAttributes(ttmlHeadElement, timedTextHead.getAttributes());
                return timedTextHead;
            },

            /**
             * Parses a TTML <body> tag.
             * @param {Element} ttmlBodyElement
             *        body tag extracted from an XMLDocument
             *
             * @returns {antie.subtitles.TimedTextBody} new instance parsed from ttmlBodyElement
             * @private
             */
            _parseBody: function (ttmlBodyElement) {
                var timedTextBody = new TimedTextBody(this._parseMixedContent(ttmlBodyElement.childNodes, true));
                this._parseAttributes(ttmlBodyElement, timedTextBody.getAttributes());
                return timedTextBody;
            },

            /**
             * Parses a TTML <div> tag.
             * @param {Element} ttmlDivElement
             *        div tag extracted from an XMLDocument
             *
             * @returns {antie.subtitles.TimedTextElement} new instance parsed from ttmlDivElement
             * @private
             */
            _parseDiv: function (ttmlDivElement) {
                var timedTextElement = new TimedTextElement(TimedTextElement.NODE_NAME.div, this._parseMixedContent(ttmlDivElement.childNodes, true));
                this._parseAttributes(ttmlDivElement, timedTextElement.getAttributes());
                return timedTextElement;
            },

            /**
             * Parses a TTML <p> tag.
             * @param {Element} ttmlPElement
             *        div tag extracted from an XMLDocument
             *
             * @returns {antie.subtitles.TimedTextElement} new instance parsed from ttmlPElement
             * @private
             */
            _parseParagraph: function (ttmlPElement) {
                var timedTextElement = new TimedTextElement(TimedTextElement.NODE_NAME.p, this._parseMixedContent(ttmlPElement.childNodes, true));
                this._parseAttributes(ttmlPElement, timedTextElement.getAttributes());
                return timedTextElement;
            },

            /**
             * Parses a TTML <span> tag.
             * @param {Element} ttmlSpanElement
             *        span tag extracted from an XMLDocument
             *
             * @returns {antie.subtitles.TimedTextElement} new instance parsed from ttmlSpanElement
             * @private
             */
            _parseSpan: function (ttmlSpanElement) {
                var timedTextElement = new TimedTextElement(TimedTextElement.NODE_NAME.span, this._parseMixedContent(ttmlSpanElement.childNodes, false));
                this._parseAttributes(ttmlSpanElement, timedTextElement.getAttributes());
                return timedTextElement;
            },

            /**
             * Parses a TTML <br> tag.
             * @returns {antie.subtitles.TimedTextElement} new instance
             * @private
             */
            _parseLinebreak: function () {
                return new TimedTextElement(TimedTextElement.NODE_NAME.br);
            },

            /**
             * Parses a TTML text element.
             * @param {Element} xmlTextElement
             *        text content extracted from an XMLDocument
             *
             * @returns {antie.subtitles.TimedTextElement} new instance
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
             * @param {Boolean} wrapTextInSpan
             *        true if any text content should be wrapped in an anonymous span
             *
             * @returns {TimedTextElement[]} Array of elements parsed from nodeList
             * @private
             */
            _parseMixedContent: function(nodeList, wrapTextInSpan) {

                if (!nodeList) {
                    return;
                }

                var children = [];
                for (var i = 0; i < nodeList.length; i++) {
                    var element = nodeList[i];
                    if (element && element.nodeType) {
                        if (element.nodeType === Node.TEXT_NODE) {
                            var textElement = this._parseText(element);
                            if (wrapTextInSpan) {
                                children.push(new TimedTextElement(TimedTextElement.NODE_NAME.span, [ textElement ]));
                            } else {
                                children.push(textElement);
                            }

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
             * @returns {antie.subtitles.TimedTextElement} new instance parsed from ttmlTtElement
             * @private
             */
            _parseTt: function (ttmlTtElement) {
                // var lang = ttmlTtElement.getAttributeNS(TimedTextElement.NAMESPACE.xml, 'lang');

                var frameRate;
                var timedTextAttributes = new TimedTextAttributes();
                this._parseAttributes(ttmlTtElement, timedTextAttributes);

                if (!timedTextAttributes.getAttribute('tickRate')) {
                    frameRate = timedTextAttributes.getAttribute('frameRate');
                    if (frameRate) {
                        var subFrameRate = timedTextAttributes.getAttribute('subFrameRate') || timedTextAttributes.getDefault('subFrameRate');
                        timedTextAttributes.setAttribute('tickRate', frameRate * subFrameRate);
                    } else {
                        timedTextAttributes.setAttribute('tickRate', timedTextAttributes.getDefault('tickRate'));
                    }
                }

                // This array literal gives ESLint a headache. No indentation will satisfy it. We always get one of:
                //   Expected indentation of 20 space characters but found 16
                //   Expected indentation of 16 space characters but found 20
                /* eslint-disable indent */
                [
                    'cellResolution',
                    'clockMode',
                    'dropMode',
                    'frameRate',
                    'frameRateMultiplier',
                    'markerMode',
                    'pixelAspectRatio',
                    'profile',
                    'subFrameRate',
                    'timeBase'
                ].forEach(
                    /* eslint-enable indent */
                    function(name) {
                        if (!timedTextAttributes.getAttribute(name)) {
                            timedTextAttributes.setAttribute(name, timedTextAttributes.getDefault(name));
                        }
                    },
                    this
                );
                frameRate = timedTextAttributes.getAttribute('frameRate');
                var framRateMultiplier = timedTextAttributes.getAttribute('frameRateMultiplier');
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
                timedText.setAttributes(timedTextAttributes);
                timedText.setAttributeDefaults(this._attributeDefaultsFactory.getAttributes());
                timedText.initialiseActiveElements();

                return timedText;
            },

            /**
             * Returns a new timed text instance parsed from a TTML XML document.
             *
             * @param {XMLDocument} ttmlDoc The TTML source file parsed into an XML document
             * @returns {antie.subtitles.TimedText} new timed text instance parsed from ttmlDoc
             */
            parse: function (ttmlDoc) {
                var logger = RuntimeContext.getDevice().getLogger();

                if (!ttmlDoc) {
                    throw new TtmlParseError('TTML document is missing');
                } else if (!(ttmlDoc instanceof XMLDocument)) {
                    throw new TtmlParseError('TTML document is not a valid XML document (type=' + typeof ttmlDoc + ')');
                }

                this._styleReferences = new _IdReferences(this._report);
                this._regionReferences = new _IdReferences(this._report);

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
