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
            init: function() {
                this._ttmlNamespaces = new TtmlNamespaces();
                this._timedTextAttributes = null;
                this._styleReferences = null;
                this._regionReferences = null;
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
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'par', 'seq' ]);
                            break;

                        case 'style':
                            value = this._parseIdReferenceAttribute(name, attribute.value, this._styleReferences);
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
            _parseEnumeratedAttribute: function(name, value, enumeration) {
                for (var i = 0; i < enumeration.length; i++) {
                    if (value === enumeration[i]) {
                        return value;
                    }
                }

                this._report(name + ' attribute should be one of "' + enumeration.join('","') + '" but was: "' + value + '"');
                return null;
            },

            /**
             * @param {String} name
             *        The name of the attribute
             *
             * @param {String} value
             *        The value of the attribute
             *
             * @param {antie.subtitles.TtmlParser._IdReferences} references
             *        References to xml:id parsed from the document so far
             *
             * @returns {?TimedTextElement[]} the element(s) refernced by value,
             *                                or null if there are none
             * @private
             */
            _parseIdReferenceAttribute: function(name, value, references) {
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
                            // TODO Is this good enough, or can we reference tags further down the document?
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
                            value = attribute.value;
                            break;

                        case 'space':
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'default', 'preserve' ]);
                            break;
                        }

                        if (value) {
                            timedTextAttributes.setAttribute(name, value);
                        }
                    }
                }
            },

            _parseColour: function(name, value) {
                if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                    return value;
                } else if (/^#[0-9a-fA-F]{8}$/.test(value)) {
                    return value.substring(0, 7);  // TODO support the full #RRGGBBAA string instead of just #RRGGBB
                } else if (/^rgb\(\d+,\d+,\d+\)$/.test(value)) {
                    return value;
                }  else if (/^rgba\(\d+,\d+,\d+,(\d*\.)?\d+\)$/.test(value)) {
                    return value;
                } else if (value.toLowerCase() === 'transparent') {
                    return 'rgba(0,0,0,0)';       // Munge this while 'transparent' has no CSS support
                } else if (/^[a-zA-Z]+$/.test(value)) {  // Named colour?
                    return value;
                } else {
                    return null;
                }
            },

            _parseLength: function(value) {
                if (/^(\+|-)?(\d*\.)?\d+(px|em|c|%)$/.test(value)) {
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
                        var valueArray;

                        switch (name) {

                        case 'backgroundColor':
                            value = this._parseColour(name, attribute.value);
                            break;

                        case 'color':
                            value = this._parseColour(name, attribute.value);
                            break;

                        case 'direction':
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'ltr', 'rtl' ]);
                            break;

                        case 'display':
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'auto', 'none' ]);
                            break;

                        case 'displayAlign':
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'before', 'center', 'after' ]);
                            break;

                        case 'extent':
                            if (attribute.value === 'auto') {
                                value = attribute.value;
                            } else {
                                valueArray = attribute.value.split(/\s+/);
                                if (valueArray && valueArray.length === 2) {
                                    if (this._parseLength(valueArray[0]) && this._parseLength(valueArray[1])) {
                                        value = {width: valueArray[0], height: valueArray[1]};
                                    }
                                }
                            }
                            break;

                        case 'fontFamily':
                            value = attribute.value;
                            break;

                        case 'fontSize':
                            valueArray = attribute.value.split(/\s+/);
                            if (valueArray && valueArray.length === 2) {
                                if (this._parseLength(valueArray[0]) && this._parseLength(valueArray[1])) {
                                    value = {width: valueArray[0], height: valueArray[1]};
                                }
                            } else if (valueArray && valueArray.length === 1) {
                                if (this._parseLength(valueArray[0])) {
                                    value = {width: valueArray[0], height: valueArray[0]};
                                }
                            }
                            break;

                        case 'fontStyle':
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'normal', 'italic', 'oblique' ]);
                            break;

                        case 'fontWeight':
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'normal', 'bold' ]);
                            break;

                        case 'lineHeight':
                            value = attribute.value === 'normal' ? 'normal' : this._parseLength(attribute.value);
                            break;

                        case 'opacity':
                            value = parseFloat(attribute.value);
                            break;

                        case 'origin':
                            if (attribute.value === 'auto') {
                                value = attribute.value;
                            } else {
                                valueArray = attribute.value.split(/\s+/);
                                if (valueArray && valueArray.length === 2) {
                                    if (this._parseLength(valueArray[0]) && this._parseLength(valueArray[1])) {
                                        value = {width: valueArray[0], height: valueArray[1]};
                                    }
                                }
                            }
                            break;

                        case 'overflow':
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'visible', 'hidden' ]);
                            break;

                        case 'padding':
                            valueArray = attribute.value.split(/\s+/);
                            if (valueArray && valueArray.length > 0 && valueArray.length <= 4) {
                                value = valueArray;
                                for (var j = 0; j < valueArray.length; j++) {
                                    if (!this._parseLength(valueArray[j])) {
                                        value = null;      // Parsing here is just to protect against injection attacks
                                    }
                                }
                            }
                            break;

                        case 'showBackground':
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'always', 'whenActive' ]);
                            break;

                        case 'textAlign':
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'left', 'center', 'right', 'start', 'end' ]);
                            break;

                        case 'textDecoration':
                            if (attribute.value === 'none') {
                                value = 'none';
                            } else {
                                valueArray = attribute.value.split(/\s+/);
                                if (valueArray && valueArray.length > 0) {
                                    value = valueArray;
                                    for (var k = 0; k < valueArray.length; k++) {
                                        if (!this._parseEnumeratedAttribute(name, valueArray[k], [ 'underline', 'noUnderline', 'lineThrough', 'noLineThrough', 'overline', 'noOverline' ])) {
                                            value = null;      // Parsing here is just to protect against injection attacks
                                        }
                                    }
                                }
                            }
                            break;

                        case 'textOutline':
                            // An optional colour, a tickness and an optional blur radius
                            if (attribute.value === 'none') {
                                value = 'none';
                            } else {

                                valueArray = attribute.value.split(/\s+/);
                                if (valueArray && valueArray.length > 0 && valueArray.length <= 3) {
                                    value = {
                                        color: null,
                                        outlineThickness: null,
                                        blurRadius: null
                                    };

                                    for (var m = 0; m < valueArray.length; m++) {
                                        // The first element might be an optional colour
                                        if (m === 0) {
                                            var colour = this._parseColour(name, valueArray[m]);
                                            if (colour) {
                                                value.color = colour;
                                                continue;
                                            } else if (valueArray.length === 3) {  // It really should have been a colour
                                                value = null;
                                                break;
                                            }
                                        }

                                        if (this._parseLength(valueArray[m])) {
                                            if (value.outlineThickness === null) {
                                                value.outlineThickness = valueArray[m];
                                            } else {
                                                value.blurRadius = valueArray[m];
                                            }
                                        } else {
                                            value = null;
                                            break;
                                        }
                                    }
                                }
                            }
                            break;

                        case 'unicodeBidi':
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'normal', 'embed', 'bidiOverride' ]);
                            break;

                        case 'visibility':
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'visible', 'hidden' ]);
                            break;

                        case 'wrapOption':
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'wrap', 'noWrap' ]);
                            break;

                        case 'writingMode':
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'lrtb', 'rltb', 'tbrl', 'tblr', 'lr', 'rl', 'tb' ]);
                            break;

                        case 'zIndex':
                            if (attribute.value === 'auto') {
                                value = 'auto';
                            } else if (/^(\+|-)?\d+$/.test(attribute.value)) {
                                value = parseInt(attribute.value);
                            }
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
                        var valueArray;

                        switch (name) {

                        case 'cellResolution':
                            valueArray = this._parseTwoPositiveParameterAttribute(name, attribute.value);
                            if (valueArray) {
                                value = {columns: valueArray[0], rows: valueArray[1]};
                            }
                            break;

                        case 'clockMode':
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'local', 'gps', 'utc' ]);
                            break;

                        case 'dropMode':
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'dropNTSC', 'dropPAL', 'nonDrop' ]);
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
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'continuous', 'discontinuous' ]);
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
                            value = this._parseEnumeratedAttribute(name, attribute.value, [ 'media', 'smpte', 'clock' ]);
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
                var timedTextBody = new TimedTextBody(this._parseMixedContent(ttmlBodyElement.childNodes));
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
                var timedTextElement = new TimedTextElement(TimedTextElement.NODE_NAME.div, this._parseMixedContent(ttmlDivElement.childNodes));
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
                var timedTextElement = new TimedTextElement(TimedTextElement.NODE_NAME.p, this._parseMixedContent(ttmlPElement.childNodes));
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
                var timedTextElement = new TimedTextElement(TimedTextElement.NODE_NAME.span, this._parseMixedContent(ttmlSpanElement.childNodes));
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
             *        span tag extracted from an XMLDocument
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
             * @returns {antie.subtitles.TimedTextElement} new instance parsed from ttmlTtElement
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
