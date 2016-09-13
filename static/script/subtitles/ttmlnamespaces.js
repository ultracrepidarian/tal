/**
 * @fileOverview XML namespaces in TTML files.
 * @author ultracrepidarian
 */
define(
    'antie/subtitles/ttmlnamespaces',
    [
        'antie/class'
    ],
    function (Class) {
        'use strict';

        /**
         * An element in a timed text hierarchy.
         *
         * @class
         * @name antie.subtitles.TtmlNamespaces
         * @extends antie.Class
         *
         * @param {string[]} [validNamespaces=['http://www.w3.org/ns/ttml']]
         *        Array of acceptable namespaces - acceptable values are any
         *        non-empty array of the following TTML namespace collections:
         *          'http://www.w3.org/ns/ttml',
         *          'http://www.w3.org/2006/10/ttaf1',
         *          'http://www.w3.org/2006/04/ttaf1'
         *        and the following individual namespaces from supplementary standards:
         *          'http://www.w3.org/ns/ttml/profile/imsc1#styling',
         *          'http://www.w3.org/ns/ttml/profile/imsc1#parameter',
         *          'http://www.w3.org/ns/ttml/profile/imsc1#metadata',
         *          'http://www.smpte-ra.org/schemas/2052-1/2010/smpte-tt'
         *        Defaults to the namespace collection defined in http://www.w3.org/TR/ttaf1-dfxp/
         */
        var TtmlNamespaces = Class.extend(/** @lends antie.subtitles.TtmlNamespaces.prototype */ {
            /**
             * @constructor
             * @ignore
             */
            init: function(validNamespaces) {
                this._ttmlNamespaces = {
                    tt:  {},
                    ttp: {},
                    tts: {},
                    ttm: {}
                };
                if (!validNamespaces) {
                    validNamespaces = [ TtmlNamespaces.TTML1.tt ];
                }

                if (!Array.isArray(validNamespaces)) {
                    throw new Error('TtmlNamespaces expecting an array of namespaces, but got ' + typeof validNamespaces + ': ' + validNamespaces);
                }

                for (var i = 0; i < validNamespaces.length; i++) {
                    if (!this._addTtNamespaceCollection(validNamespaces[i])) {
                        if (!this._addNamespace(validNamespaces[i])) {
                            throw new Error('TtmlNamespaces - not a valid namespace: ' + validNamespaces[i]);
                        }
                    }
                }
            },

            /**
             * Returns true if namespace is a valid one for the specified canonical prefix.
             * The empty namespace is used for unknown prefixes.
             *
             * @example
             *   ttmlNamespaces.isStandardPrefixValid('ttp', 'http://www.w3.org/ns/ttml#parameter') ==> true
             *
             * @param {String} prefix
             *        The canonical prefix, e.g. 'tt', 'ttm'
             *
             * @param {?String} namespace
             *        The namespace to be checked
             *
             * @returns {Boolean} true if prefix is the canonical prefix for the specified namespace
             *                         or if namespace is empty and the prefix has no known namespace,
             *                    false otherwise (prefix has a namespace but it does not match the specified one)
             * @public
             */
            isCanonicalNamespace: function(prefix, namespace) {
                var validNamespaces = this._ttmlNamespaces[prefix];
                if (validNamespaces) {
                    return validNamespaces.hasOwnProperty(namespace);
                } else {
                    return !namespace;
                }
            },

            /**
             * Adds the specified collection of namespaces to the list of
             * acceptable values.
             *
             * @param {String} namespace
             *        any collection of TTML namespaces with a tt name matching this
             *        value will be added
             *
             * @returns {Boolean} true if namespace was recognised as a valid TTML namespace,
             *                    false if not
             * @private
             */
            _addTtNamespaceCollection: function(namespace) {
                var source;
                switch (namespace) {
                case TtmlNamespaces.TTML1.tt:
                    source = TtmlNamespaces.TTML1;
                    break;
                case TtmlNamespaces.CR2006.tt:
                    source = TtmlNamespaces.CR2006;
                    break;
                case TtmlNamespaces.WD2006.tt:
                    source = TtmlNamespaces.WD2006;
                    break;
                default:
                    return false;
                }

                this._ttmlNamespaces.tt[source.tt] = true;
                this._ttmlNamespaces.ttp[source.ttp] = true;
                this._ttmlNamespaces.tts[source.tts] = true;
                this._ttmlNamespaces.ttm[source.ttm] = true;

                return true;
            },

            /**
             * Adds the specified namespaces to the list of acceptable values, as
             * long as it is a valid IMSC namespace.
             *
             * @param {String} namespace
             *        IMSC namespace to be added
             *
             * @returns {Boolean} true if namespace was recognised as a valid IMSC namespace,
             *                    false if not
             * @private
             */
            _addNamespace: function(namespace) {
                var otherNamespaces = [ TtmlNamespaces.IMSC, TtmlNamespaces.XML ];
                for (var i = 0; i < otherNamespaces.length; i++) {
                    var namespaceCollection = otherNamespaces[i];
                    for (var prefix in namespaceCollection) {
                        if (namespaceCollection[prefix] === namespace) {
                            this._ttmlNamespaces[prefix] = {};
                            this._ttmlNamespaces[prefix][namespaceCollection[prefix]] = true;
                            return true;
                        }
                    }
                }

                return false;
            }
        });

        /**
         * The XML namespaces for TTML elements. As specified in
         *
         *   http://www.w3.org/TR/ttml2/
         *   http://www.w3.org/TR/ttaf1-dfxp/
         *   http://www.w3.org/TR/2010/CR-ttaf1-dfxp-20100223/
         *
         * @name antie.subtitles.TtmlNamespaces.NAMESPACE
         * @enum {String}
         * @readonly
         */
        TtmlNamespaces.TTML1 = {
            tt:  'http://www.w3.org/ns/ttml',
            ttp: 'http://www.w3.org/ns/ttml#parameter',
            tts: 'http://www.w3.org/ns/ttml#styling',
            ttm: 'http://www.w3.org/ns/ttml#metadata'
        };

        /**
         * The XML namespaces for TTML elements. As specified in Candidate Recommendation
         *
         *   http://www.w3.org/TR/2006/CR-ttaf1-dfxp-20061116
         *
         * @name antie.subtitles.TtmlNamespaces.NAMESPACE_2006CR
         * @enum {String}
         * @readonly
         */
        TtmlNamespaces.CR2006 = {
            tt:  'http://www.w3.org/2006/10/ttaf1',
            ttp: 'http://www.w3.org/2006/10/ttaf1#parameter',
            tts: 'http://www.w3.org/2006/10/ttaf1#style',
            ttm: 'http://www.w3.org/2006/10/ttaf1#metadata'
        };

        /**
         * The XML namespaces for TTML elements. As specified in Working Draft
         *
         *   http://www.w3.org/TR/2006/WD-ttaf1-dfxp-20060427/
         *
         * @name antie.subtitles.TtmlNamespaces.NAMESPACE_2006WD
         * @enum {String}
         * @readonly
         */
        TtmlNamespaces.WD2006 = {
            tt:  'http://www.w3.org/2006/04/ttaf1',
            ttp: 'http://www.w3.org/2006/04/ttaf1#parameter',
            tts: 'http://www.w3.org/2006/04/ttaf1#style',
            ttm: 'http://www.w3.org/2006/04/ttaf1#metadata'
        };

        /**
         * The XML namespaces for TTML Profiles for Internet Media Subtitles and Captions.
         * As specified in
         *
         *   http://www.w3.org/TR/ttml-imsc1/
         *
         * @name antie.subtitles.TtmlNamespaces.NAMESPACE_2006WD
         * @enum {String}
         * @readonly
         */
        TtmlNamespaces.IMSC = {
            itts:  'http://www.w3.org/ns/ttml/profile/imsc1#styling',
            ittp:  'http://www.w3.org/ns/ttml/profile/imsc1#parameter',
            ittm:  'http://www.w3.org/ns/ttml/profile/imsc1#metadata',
            smpte: 'http://www.smpte-ra.org/schemas/2052-1/2010/smpte-tt'
        };

        /**
         * Namespaces for XML. As specified in
         *
         *   http://www.w3.org/TR/xml-names/
         *
         * @name antie.subtitles.TtmlNamespaces.NAMESPACE
         * @enum {String}
         * @readonly
         */
        TtmlNamespaces.XML = {
            xml:   'http://www.w3.org/XML/1998/namespace',
            xmlns: 'http://www.w3.org/2000/xmlns/'
        };

        return TtmlNamespaces;
    }
);
