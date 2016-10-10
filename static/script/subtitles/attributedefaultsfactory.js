define(
    'antie/subtitles/attributedefaultsfactory',
    [
        'antie/class',
        'antie/subtitles/attributetransformer',
        'antie/subtitles/attributetransformercss3',
        'antie/subtitles/timedtextattributes'
    ],
    function(Class, AttributeTransformer, AttributeTransformerCss3, TimedTextAttributes) {
        'use strict';

        var DEFAULTS = {
            // Parameter attributes
            cellResolution: '32 15',
            clockMode: 'utc',
            dropMode: 'nonDrop',
            frameRate: '30',
            frameRateMultiplier: '1 1',
            markerMode: 'discontinuous',
            pixelAspectRatio: '1 1',
            subFrameRate: '1',
            tickRate: '1',   // The default is actually specified in terms of other parameter values, and is dealt with in the parser
            timeBase: 'media',

            // XML attributes
            lang: '',
            space: 'default',

            // Style attributes
            backgroundColor: 'transparent',
            color: 'white',  // Implementation dependent
            direction: 'ltr',
            display: 'auto',
            displayAlign: 'before',
            extent: 'auto',
            fontFamily: 'default',
            fontSize: '1c',
            fontStyle: 'normal',
            fontWeight: 'normal',
            lineHeight: 'normal',
            opacity: '1.0',
            origin: 'auto',
            overflow: 'hidden',
            padding: '0px',
            showBackground: 'always',
            textAlign: 'start',
            textDecoration: 'none',
            textOutline: 'none',
            unicodeBidi: 'normal',
            visibility: 'visible',
            wrapOption: 'wrap',
            writingMode: 'lrtb',
            zIndex: 'auto'
        };

        /**
         * Sets default values for attributes.
         *
         * @param {antie.subtitles.AttributeTransformer} [attributeTransformer]
         *        Optionally specify an attribute transformer. If none is specified a
         *        new CSS3 transformer will be used.
         *
         * @class
         * @name antie.subtitles.AttributeDefaultsFactory
         * @extends antie.Class
         */
        var AttributeDefaultsFactory = Class.extend(/** @lends antie.subtitles.AttributeDefaultsFactory.prototype */ {
            /**
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
                    this._attributeTransformer = new AttributeTransformerCss3();
                }

                this._attributes = new TimedTextAttributes();
            },

            /**
             * Sets the default value of an attribute, if it has not already been set.
             *
             * @param {String} name
             *        The name of the attribute
             *
             * @param {String} value
             *        The default value of the attribute
             * @public
             */
            setDefault: function(name, value) {
                var attribute = this._attributeTransformer.transform(name, value);
                if (attribute && !this._attributes.getAttribute(name)) {
                    this._attributes.setAttribute(name, attribute);
                }
            },

            /**
             * Returns the set of default attributes.
             *
             * @returns {antie.subtitles.TimedTextAttributes} the default attributes
             * @public
             */
            getAttributes: function() {
                // Set any defaults that have not already been set.
                for (var name in DEFAULTS) {
                    if (DEFAULTS.hasOwnProperty(name)) {
                        this.setDefault(name, DEFAULTS[name]);
                    }
                }

                return this._attributes.clone();
            }
        });

        return AttributeDefaultsFactory;
    }
);
