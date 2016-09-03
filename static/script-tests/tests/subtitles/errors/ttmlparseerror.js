require(
    [
        'antie/subtitles/errors/ttmlparseerror'
    ],
    function(TtmlParseError) {
        'use strict';

        describe('antie.subtitles.errors.TtmlParseError', function() {

            it('returns the specified error message', function() {
                expect(new TtmlParseError('Testing errors').message).toBe('Testing errors');
            });

        });
    }
);
