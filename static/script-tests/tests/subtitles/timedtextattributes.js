require(
    [
        'antie/subtitles/timedtextattributes',
        'antie/subtitles/timedtextelement',
        'antie/subtitles/timestamp'
    ],
    function(TimedTextAttributes, TimedTextElement, Timestamp) {
        'use strict';

        describe('antie.subtitles.TimedTextAttributes', function() {

            it('can get/set valid attributes', function() {
                var beginTime = new Timestamp('00:00:15');
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('begin', beginTime);
                expect(attributes.getAttribute('begin')).toBe(beginTime);
            });

            it('can get a timing interval from begin/end', function() {
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('begin', new Timestamp('00:00:15'));
                attributes.setAttribute('end', new Timestamp('00:00:19.240'));

                // Method under test
                expect(attributes.getTimingInterval()).toEqual({
                    beginMilliseconds: 15000,
                    endMilliseconds: 19240
                });
            });

            it('can get a timing interval from begin/dur', function() {
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('begin', new Timestamp('00:00:15'));
                attributes.setAttribute('dur', new Timestamp('3s'));

                // Method under test
                expect(attributes.getTimingInterval()).toEqual({
                    beginMilliseconds: 15000,
                    endMilliseconds: 18000
                });
            });

            it('will ignore dur if end is specified', function() {
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('begin', new Timestamp('00:00:15'));
                attributes.setAttribute('dur', new Timestamp('3s'));
                attributes.setAttribute('end', new Timestamp('00:00:19.240'));

                // Method under test
                expect(attributes.getTimingInterval()).toEqual({
                    beginMilliseconds: 15000,
                    endMilliseconds: 19240
                });
            });

            it('will use Infinity if end and dur are not specified', function() {
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('begin', new Timestamp('00:00:15'));

                // Method under test
                expect(attributes.getTimingInterval()).toEqual({
                    beginMilliseconds: 15000,
                    endMilliseconds: Infinity
                });
            });

            it('will use 0 if begin is not specified', function() {
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('end', new Timestamp('00:00:19.240'));

                // Method under test
                expect(attributes.getTimingInterval()).toEqual({
                    beginMilliseconds: 0,
                    endMilliseconds: 19240
                });
            });

            it('will return null timing interval if neither begin nor end are speified', function() {
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('dur', new Timestamp('3s'));

                // Method under test
                expect(attributes.getTimingInterval()).toBeNull();
            });

            it('will choose inline tts attribute value from element if there is one', function() {
                var style00 = new TimedTextElement(TimedTextElement.NODE_NAME.style);
                var style0 = new TimedTextElement(TimedTextElement.NODE_NAME.style);
                style0.getAttributes().setAttribute('style', [ style00 ]);
                var style1 = new TimedTextElement(TimedTextElement.NODE_NAME.style);
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('style', [ style0, style1 ]);

                style00.getAttributes().setAttribute('backgroundColor', 'rgba(128,0,56,0.3)');
                style0.getAttributes().setAttribute('backgroundColor', '#FFEE00');
                style1.getAttributes().setAttribute('backgroundColor', '#0000FE');
                attributes.setAttribute('backgroundColor', 'red');

                expect(attributes.getAttribute('backgroundColor')).toBe('red');
            });

            it('will choose tts attribute value from first referenced style if there is no inline attribute', function() {
                var style00 = new TimedTextElement(TimedTextElement.NODE_NAME.style);
                var style0 = new TimedTextElement(TimedTextElement.NODE_NAME.style);
                style0.getAttributes().setAttribute('style', [ style00 ]);
                var style1 = new TimedTextElement(TimedTextElement.NODE_NAME.style);
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('style', [ style0, style1 ]);

                style00.getAttributes().setAttribute('backgroundColor', 'rgba(128,0,56,0.3)');
                style0.getAttributes().setAttribute('backgroundColor', '#FFEE00');
                style1.getAttributes().setAttribute('backgroundColor', '#0000FE');

                expect(attributes.getAttribute('backgroundColor')).toBe('#FFEE00');
            });

            it('will choose tts attribute value depth-first from referenced style until found', function() {
                var style00 = new TimedTextElement(TimedTextElement.NODE_NAME.style);
                var style0 = new TimedTextElement(TimedTextElement.NODE_NAME.style);
                style0.getAttributes().setAttribute('style', [ style00 ]);
                var style1 = new TimedTextElement(TimedTextElement.NODE_NAME.style);
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('style', [ style0, style1 ]);

                style00.getAttributes().setAttribute('backgroundColor', 'rgba(128,0,56,0.3)');
                style1.getAttributes().setAttribute('backgroundColor', '#0000FE');

                expect(attributes.getAttribute('backgroundColor')).toBe('rgba(128,0,56,0.3)');
            });

            it('will choose tts attribute value from next referenced style if not found depth-first in 1st one', function() {
                var style00 = new TimedTextElement(TimedTextElement.NODE_NAME.style);
                var style0 = new TimedTextElement(TimedTextElement.NODE_NAME.style);
                style0.getAttributes().setAttribute('style', [ style00 ]);
                var style1 = new TimedTextElement(TimedTextElement.NODE_NAME.style);
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('style', [ style0, style1 ]);

                style1.getAttributes().setAttribute('backgroundColor', '#0000FE');

                expect(attributes.getAttribute('backgroundColor')).toBe('#0000FE');
            });

            it('is applicable to tags listed in appliesTo', function() {
                var attributes = new TimedTextAttributes();
                expect(attributes.appliesTo('direction')).toEqual([ 'p', 'span' ]);
                expect(attributes.isApplicableTo('direction', 'p')).toBe(true);
                expect(attributes.isApplicableTo('direction', 'span')).toBe(true);
                expect(attributes.isApplicableTo('direction', 'div')).toBe(false);
                expect(attributes.isApplicableTo('direction', 'tt')).toBe(false);
            });

            it('knows all about tts:backgroundColor attribute', function() {
                var attributes = new TimedTextAttributes();
                expect(attributes.isInheritable('backgroundColor')).toBe(false);
                expect(attributes.isStyleAttribute('backgroundColor')).toBe(true);
                expect(attributes.getDefault('backgroundColor')).toBe('transparent');
                expect(attributes.appliesTo('backgroundColor')).toEqual([ 'body', 'div', 'p', 'region', 'span' ]);
            });

            it('knows all about tts:color attribute', function() {
                var attributes = new TimedTextAttributes();
                expect(attributes.isInheritable('color')).toBe(true);
                expect(attributes.isStyleAttribute('color')).toBe(true);
                expect(attributes.getDefault('color')).toBe('white');
                expect(attributes.appliesTo('color')).toEqual([ 'span' ]);
            });

            it('knows all about tts:direction attribute', function() {
                var attributes = new TimedTextAttributes();
                expect(attributes.isInheritable('direction')).toBe(true);
                expect(attributes.isStyleAttribute('direction')).toBe(true);
                expect(attributes.getDefault('direction')).toBe('ltr');
                expect(attributes.appliesTo('direction')).toEqual([ 'p', 'span' ]);
            });

            it('knows all about tts:display attribute', function() {
                var attributes = new TimedTextAttributes();
                expect(attributes.isInheritable('display')).toBe(false);
                expect(attributes.isStyleAttribute('display')).toBe(true);
                expect(attributes.getDefault('display')).toBe('auto');
                expect(attributes.appliesTo('display')).toEqual([ 'body', 'div', 'p', 'region', 'span' ]);
            });

            it('clones a shallow copy of itself', function() {
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('begin', new Timestamp('00:00:15'));

                expect(attributes.clone()).toEqual(attributes);
                expect(attributes.clone()).not.toBe(attributes);
            });

        });
    }
);
