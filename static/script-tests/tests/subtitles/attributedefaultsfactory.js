require(
    [
        'antie/subtitles/attributedefaultsfactory',
        'antie/subtitles/attributetransformercss3',
        'antie/subtitles/attributetransformertextsize'
    ],
    function(AttributeDefaultsFactory, AttributeTransformerCss3, AttributeTransformerTextSize) {
        'use strict';

        describe('antie.subtitles.AttributeDefaultsFactory', function() {

            beforeEach(function() {
                spyOn(AttributeTransformerCss3.prototype, 'init');
                spyOn(AttributeTransformerCss3.prototype, 'transformFontFamily').andCallFake(function(value) {
                    return value;
                });
            });

            it('sets defaults', function() {
                var attributeDefaultsFactory = new AttributeDefaultsFactory();
                attributeDefaultsFactory.setDefault('color', '#00FF00');
                expect(attributeDefaultsFactory.getAttributes().getAttribute('color')).toBe('#00FF00');
            });

            it('applies transformer to defaults', function() {
                var attributeDefaultsFactory = new AttributeDefaultsFactory();
                attributeDefaultsFactory.setDefault('color', '#00FF00FF');  // Hex colour/opacity not supported by CSS3
                expect(attributeDefaultsFactory.getAttributes().getAttribute('color')).toBe('rgba(0,255,0,1.00)'); // Transformed by AttributeTransformerCss3
            });

            it('uses default defaults for anything not set', function() {
                var attributeDefaultsFactory = new AttributeDefaultsFactory();
                attributeDefaultsFactory.setDefault('color', '#00FF00');
                expect(attributeDefaultsFactory.getAttributes().getAttribute('direction')).toBe('ltr');
                expect(attributeDefaultsFactory.getAttributes().getAttribute('backgroundColor')).toBe('rgba(0,0,0,0.0)'); // But still transformed by AttributeTransformerCss3
            });

            it('returns no default for attributes that do not have a default', function() {
                var attributeDefaultsFactory = new AttributeDefaultsFactory();
                expect(attributeDefaultsFactory.getAttributes().getAttribute('profile')).toBeNull();
            });

            it('returns a new (shallow) copy on each call to getAttributes', function() {
                var attributeDefaultsFactory = new AttributeDefaultsFactory();
                attributeDefaultsFactory.setDefault('color', '#00FF00');

                expect(attributeDefaultsFactory.getAttributes()).toEqual(attributeDefaultsFactory.getAttributes());
                expect(attributeDefaultsFactory.getAttributes()).not.toBe(attributeDefaultsFactory.getAttributes());
            });

            it('uses the specified transformer', function() {
                // No transformer, uses CSS3 (which does not alter lineHeight)
                var attributeDefaultsFactoryCss3 = new AttributeDefaultsFactory();
                attributeDefaultsFactoryCss3.setDefault('lineHeight', '56px');
                expect(attributeDefaultsFactoryCss3.getAttributes().getAttribute('lineHeight')).toBe('56px');

                // Uses the specified AttributeTransformerTextSize (which limits max lineHeight to 39px)
                var attributeDefaultsFactoryTextSize = new AttributeDefaultsFactory(new AttributeTransformerTextSize());
                attributeDefaultsFactoryTextSize.setDefault('lineHeight', '56px');
                expect(attributeDefaultsFactoryTextSize.getAttributes().getAttribute('lineHeight')).toBe('39px');
            });

        });
    }
);
