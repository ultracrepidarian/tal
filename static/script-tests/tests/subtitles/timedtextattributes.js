require(
    [
        'antie/subtitles/timedtextattributes',
        'antie/subtitles/timestamp'
    ],
    function(TimedTextAttributes, Timestamp) {
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
                var style00Attributes = new TimedTextAttributes();
                var style0Attributes = new TimedTextAttributes();
                style0Attributes.setAttribute('style', [ style00Attributes ]);
                var style1Attributes = new TimedTextAttributes();
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('style', [ style0Attributes, style1Attributes ]);

                style00Attributes.setAttribute('backgroundColor', 'rgba(128,0,56,0.3)');
                style0Attributes.setAttribute('backgroundColor', '#FFEE00');
                style1Attributes.setAttribute('backgroundColor', '#0000FE');
                attributes.setAttribute('backgroundColor', 'red');

                expect(attributes.getAttribute('backgroundColor')).toBe('red');
            });

            it('will choose tts attribute value from first referenced style if there is no inline attribute', function() {
                var style00Attributes = new TimedTextAttributes();
                var style0Attributes = new TimedTextAttributes();
                style0Attributes.setAttribute('style', [ style00Attributes ]);
                var style1Attributes = new TimedTextAttributes();
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('style', [ style0Attributes, style1Attributes ]);

                style00Attributes.setAttribute('backgroundColor', 'rgba(128,0,56,0.3)');
                style0Attributes.setAttribute('backgroundColor', '#FFEE00');
                style1Attributes.setAttribute('backgroundColor', '#0000FE');

                expect(attributes.getAttribute('backgroundColor')).toBe('#FFEE00');
            });

            it('will choose tts attribute value depth-first from referenced style until found', function() {
                var style00Attributes = new TimedTextAttributes();
                var style0Attributes = new TimedTextAttributes();
                style0Attributes.setAttribute('style', [ style00Attributes ]);
                var style1Attributes = new TimedTextAttributes();
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('style', [ style0Attributes, style1Attributes ]);

                style00Attributes.setAttribute('backgroundColor', 'rgba(128,0,56,0.3)');
                style1Attributes.setAttribute('backgroundColor', '#0000FE');

                expect(attributes.getAttribute('backgroundColor')).toBe('rgba(128,0,56,0.3)');
            });

            it('will choose tts attribute value from next referenced style if not found depth-first in 1st one', function() {
                var style00Attributes = new TimedTextAttributes();
                var style0Attributes = new TimedTextAttributes();
                style0Attributes.setAttribute('style', [ style00Attributes ]);
                var style1Attributes = new TimedTextAttributes();
                var attributes = new TimedTextAttributes();
                attributes.setAttribute('style', [ style0Attributes, style1Attributes ]);

                style1Attributes.setAttribute('backgroundColor', '#0000FE');

                expect(attributes.getAttribute('backgroundColor')).toBe('#0000FE');
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

        });
    }
);
