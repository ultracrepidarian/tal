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

        });
    }
);
