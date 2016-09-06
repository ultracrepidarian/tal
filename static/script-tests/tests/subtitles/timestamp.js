require(
    [
        'antie/application',
        'antie/devices/browserdevice',
        'antie/runtimecontext',
        'antie/subtitles/timestamp',
        'antie/subtitles/errors/ttmlparseerror'
    ],
    function(Application, Device, RuntimeContext, Timestamp, TtmlParseError) {
        'use strict';

        describe('antie.subtitles.Timestamp', function() {

            it('parses a valid clock time', function() {
                expect(new Timestamp('14:38:53.122')._seconds).toBeCloseTo(14*60*60 + 38*60 + 53.122, 3);
            });

            it('chokes on a clock time with too few colons', function() {
                try {
                    new Timestamp('38:53.122');
                    expect('Error not thrown').toBe('Error thrown');  // Fail the test (in the absence of the Jasmine 2.4 fail() method)
                } catch (e) {
                    expect(e.message).toBe('Invalid timestamp: 38:53.122');
                    expect(e).toEqual(jasmine.any(TtmlParseError));
                }
            });

            it('chokes on a clock time with too many colons', function() {
                try {
                    new Timestamp('11:14:38:53.122');
                    expect('Error not thrown').toBe('Error thrown');  // Fail the test (in the absence of the Jasmine 2.4 fail() method)
                } catch (e) {
                    expect(e.message).toBe('Invalid timestamp: 11:14:38:53.122');
                    expect(e).toEqual(jasmine.any(TtmlParseError));
                }
            });

            it('chokes on a clock time with the decimal point in the wrong place', function() {
                try {
                    new Timestamp('14:38.122:53');
                    expect('Error not thrown').toBe('Error thrown');  // Fail the test (in the absence of the Jasmine 2.4 fail() method)
                } catch (e) {
                    expect(e.message).toBe('Invalid timestamp: 14:38.122:53');
                    expect(e).toEqual(jasmine.any(TtmlParseError));
                }
            });

            it('chokes on a clock time with more than 2 digits of minutes', function() {
                try {
                    new Timestamp('14:138:53.122');
                    expect('Error not thrown').toBe('Error thrown');  // Fail the test (in the absence of the Jasmine 2.4 fail() method)
                } catch (e) {
                    expect(e.message).toBe('Invalid timestamp: 14:138:53.122');
                    expect(e).toEqual(jasmine.any(TtmlParseError));
                }
            });

            it('is OK with a clock time with more than 2 digits of hours', function() {
                expect(new Timestamp('149:38:53.122')._seconds).toBeCloseTo(149*60*60 + 38*60 + 53.122, 3);
            });

            it('parses a valid offset integer hours', function() {
                expect(new Timestamp('2h')._seconds).toBe(7200);
            });

            it('parses a valid offset integer minutes', function() {
                expect(new Timestamp('2m')._seconds).toBe(120);
            });

            it('parses a valid offset integer seconds', function() {
                expect(new Timestamp('2s')._seconds).toBe(2);
            });

            it('parses a valid offset integer milliseconds', function() {
                expect(new Timestamp('2ms')._seconds).toBeCloseTo(0.002, 3);
            });

            it('parses a valid offset decimal hours', function() {
                expect(new Timestamp('2.1h')._seconds).toBeCloseTo(7560, 0);
            });

            it('parses a valid offset decimal minutes', function() {
                expect(new Timestamp('2.1m')._seconds).toBeCloseTo(126, 0);
            });

            it('parses a valid offset decimal seconds', function() {
                expect(new Timestamp('2.1s')._seconds).toBeCloseTo(2.1, 1);
            });

            it('parses a valid offset decimal milliseconds', function() {
                expect(new Timestamp('2.1ms')._seconds).toBeCloseTo(0.0021, 4);
            });

        });
    }
);
